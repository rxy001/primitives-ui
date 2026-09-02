import { addEventListener, isFunction } from '@primitives-ui/utils'
import type { OrderedRegistryEntry } from '../createOrderedRegistry'
import type { PopupDismissSource } from './store'
import { createDocumentManager } from '../createDocumentManager'
import {
  createOrderedRegistry,
  OrderedRegistry,
} from '../createOrderedRegistry'

export const ESCAPE_KEY = 'escape-key' as const
export type ESCAPE_KEY = typeof ESCAPE_KEY

export const POINTER_DOWN_OUTSIDE = 'pointer-down-outside' as const
export type POINTER_DOWN_OUTSIDE = typeof POINTER_DOWN_OUTSIDE

export const FOCUS_OUTSIDE = 'focus-outside' as const
export type FOCUS_OUTSIDE = typeof FOCUS_OUTSIDE

export type PopupDismissInteraction =
  | {
      reason: ESCAPE_KEY
      originalEvent: KeyboardEvent
    }
  | {
      reason: POINTER_DOWN_OUTSIDE
      originalEvent: PointerEvent
    }
  | {
      reason: FOCUS_OUTSIDE
      originalEvent: FocusEvent
    }

export type PopupDismissRequest<
  Source extends PopupDismissSource = PopupDismissSource,
> = PopupDismissInteraction & {
  source: Source
}

type PopupDismissAction = () => void

export interface PopupEntry extends OrderedRegistryEntry<PopupEntry> {
  modalRef: React.RefObject<boolean>
  activeTriggerRef: React.RefObject<HTMLElement | null>
  pause: () => void
  resume: () => void
  isTargetInsideFocusScope(target: EventTarget | null): boolean
  isTargetInsideAnyTrigger(target: EventTarget | null): boolean
  requestDismiss(
    request: PopupDismissRequest<'self'>,
  ): PopupDismissAction | void
  forceDismiss(request: PopupDismissRequest<'ancestor'>): PopupDismissAction
}

export const getPopupManager = createDocumentManager(
  (document: Document) => new PopupManager(document),
)

interface PopupEntryGroup {
  targetEntry: PopupEntry

  descendantEntries: PopupEntries
}

interface PendingFocusTransition {
  // The focusout event owns the transition. React capture handlers enrich it
  // before the queued microtask evaluates which logical branches were exited.
  originalEvent: FocusEvent
  candidateEntries: PopupEntries
  markedDestinationEntries: PopupEntry[]
}

type PopupEntries = readonly PopupEntry[]

export class PopupManager {
  readonly #registry: OrderedRegistry<PopupEntry>
  readonly #document: Document
  readonly #markedInsideEntriesByEvent = new WeakMap<Event, Set<PopupEntry>>()
  #isPointerDown = false
  #pointerDownGeneration = 0
  #keyDownGeneration = 0
  #pendingFocusTransition: PendingFocusTransition | null = null

  constructor(document: Document) {
    this.#document = document
    this.#registry = createOrderedRegistry()
  }

  #syncPausedEntries = (entries: PopupEntries) => {
    const modalBoundaryIndex = entries.findIndex(
      (entry) => entry.modalRef.current,
    )

    entries.forEach((entry, index) => {
      const shouldPause = modalBoundaryIndex > -1 && index > modalBoundaryIndex

      if (shouldPause) {
        entry.pause()
      } else {
        entry.resume()
      }
    })
  }

  getTopmostModalEntry = () =>
    this.#registry.getEntries().find((entry) => entry.modalRef.current)

  register = (entry: PopupEntry) => {
    const shouldAttach = this.#registry.getSize() === 0

    if (!this.#registry.register(entry)) return () => {}

    if (shouldAttach) this.#attach()

    this.#syncPausedEntries(this.#registry.getEntries())

    return () => this.unregister(entry)
  }

  unregister = (entry: PopupEntry) => {
    if (this.#registry.unregister(entry)) {
      this.#syncPausedEntries(this.#registry.getEntries())
    }

    if (this.#registry.getSize() === 0) {
      this.#detach()
    }
  }

  isTopmost = (entry: PopupEntry) => this.#registry.getTopmost() === entry

  markEventAsInside = (entry: PopupEntry, event: Event) => {
    // React events bubble through the React tree across createPortal() even
    // when DOM containment cannot associate the event target with the Popup.
    let markedInsideEntries = this.#markedInsideEntriesByEvent.get(event)

    if (!markedInsideEntries) {
      markedInsideEntries = new Set()
      this.#markedInsideEntriesByEvent.set(event, markedInsideEntries)
    }

    markedInsideEntries.add(entry)
  }

  markFocusTargetAsInside = (entry: PopupEntry, event: FocusEvent) => {
    const transition = this.#pendingFocusTransition

    // A React Portal is not a DOM descendant of its Popup. Match the target's
    // focusin event to the pending focusout and record its logical owner.
    if (
      !transition ||
      transition.originalEvent.relatedTarget !== event.target ||
      !transition.candidateEntries.includes(entry)
    ) {
      return
    }

    transition.markedDestinationEntries.push(entry)
  }

  #isRegistered = (entry: PopupEntry) =>
    this.#registry.getEntries().includes(entry)

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.isComposing || event.repeat) {
      return
    }

    const registryEntries = [...this.#registry.getEntries()]

    const keyDownGeneration = ++this.#keyDownGeneration

    addEventListener(
      event.target as HTMLElement,
      event.type,
      () => {
        if (this.#keyDownGeneration !== keyDownGeneration) {
          return
        }

        const targetGroups = resolveEscapeTargetGroups(
          event,
          registryEntries,
          this.#markedInsideEntriesByEvent.get(event),
        )
        // Evaluate recently registered independent roots first.
        targetGroups.forEach((targetGroup) => {
          const groupEntries = getGroupEntries(targetGroup)

          this.#dispatchDismissGroup(
            {
              reason: ESCAPE_KEY,
              originalEvent: event,
            },
            targetGroup,
            groupEntries,
          )
        })
      },
      {
        once: true,
      },
    )
  }

  #handlePointerDown = (event: PointerEvent) => {
    const registryEntries = [...this.#registry.getEntries()]

    // Browsers commonly move focus as part of pointerdown. Suppress the
    // resulting focusout so one pointer interaction cannot dismiss twice.
    this.#isPointerDown = true
    const pointerDownGeneration = ++this.#pointerDownGeneration

    setTimeout(() => {
      if (this.#pointerDownGeneration === pointerDownGeneration) {
        this.#isPointerDown = false
      }
    }, 0)

    addEventListener(
      event.target as HTMLElement,
      event.type,
      () => {
        if (this.#pointerDownGeneration !== pointerDownGeneration) {
          return
        }

        if (!isPrimaryPointerDown(event)) {
          return
        }

        const targetGroups = resolvePointerDownTargetGroups(registryEntries)

        targetGroups.forEach((targetGroup) => {
          const groupEntries = getGroupEntries(targetGroup)
          const insideEntries = this.#getPointerInsideEntries(
            groupEntries,
            event,
          )
          const pointerOutsideEntries = groupEntries.filter(
            (entry) => !insideEntries.includes(entry),
          )

          if (pointerOutsideEntries.length === 0) return

          this.#dispatchDismissGroup(
            {
              reason: POINTER_DOWN_OUTSIDE,
              originalEvent: event,
            },
            targetGroup,
            pointerOutsideEntries,
          )
        })
      },
      {
        once: true,
      },
    )
  }

  #handleFocusOut = (event: FocusEvent) => {
    // A null relatedTarget means the destination is unknown (for example,
    // focus leaving the document), so an outside transition cannot be proven.
    if (!event.relatedTarget || this.#isPointerDown) {
      return
    }

    const activeEntries = getActiveEntries(this.#registry.getEntries()).filter(
      (entry) => !entry.modalRef.current,
    )

    const transition: PendingFocusTransition = {
      originalEvent: event,
      candidateEntries: activeEntries,
      markedDestinationEntries: [],
    }

    // React onBlurCapture and onFocusCapture run later in the same focus
    // transition. Keep this transition available while those handlers run.
    this.#pendingFocusTransition = transition

    setTimeout(() => {
      // A later synchronous focusout may replace the capture slot, but every
      // transition still dispatches from its own closure.
      if (this.#pendingFocusTransition === transition) {
        this.#pendingFocusTransition = null
      }

      this.#dispatchFocusTransition(transition)
    })
  }

  #dispatchFocusTransition = (transition: PendingFocusTransition) => {
    const { originalEvent, candidateEntries, markedDestinationEntries } =
      transition

    // Entries that logically contained the element losing focus.
    const sourceEntries = [
      ...new Set([
        ...getFocusTargetEntries(candidateEntries, originalEvent.target),
        ...this.#getEventInsideEntries(candidateEntries, originalEvent),
      ]),
    ]

    if (sourceEntries.length === 0) return

    // Entries that logically contain the element receiving focus.
    const destinationEntries = [
      ...new Set([
        ...getFocusTargetEntries(candidateEntries, originalEvent.relatedTarget),
        ...getEntriesWithAncestors(candidateEntries, markedDestinationEntries),
      ]),
    ]

    // Only entries in the source but not the destination were exited by this
    // focus transition.
    const focusOutsideEntries = candidateEntries.filter(
      (entry) =>
        sourceEntries.includes(entry) && !destinationEntries.includes(entry),
    )

    if (focusOutsideEntries.length === 0) return

    const targetGroups = resolveFocusOutsideTargetGroups(
      candidateEntries,
      focusOutsideEntries,
    )

    targetGroups.forEach((targetGroup) => {
      this.#dispatchDismissGroup(
        {
          reason: FOCUS_OUTSIDE,
          originalEvent,
        },
        targetGroup,
        focusOutsideEntries,
      )
    })
  }

  #dispatchDismissGroup = (
    interaction: PopupDismissInteraction,
    targetGroup: PopupEntryGroup,
    requestDismissEntries: PopupEntries,
  ) => {
    const groupEntries = getGroupEntries(targetGroup)
    const childEntriesByParentEntry = createChildEntriesByParentEntry(
      targetGroup.targetEntry,
      groupEntries,
    )
    const dismissActionByEntry = new Map<PopupEntry, PopupDismissAction>()

    const visitEntry = (entry: PopupEntry, ancestorWillDismiss: boolean) => {
      let currentWillDismiss = ancestorWillDismiss

      // Decisions run root-first. Once an ancestor accepts dismissal, its
      // descendants are forced closed without firing their preventable hooks.
      if (ancestorWillDismiss) {
        dismissActionByEntry.set(
          entry,
          entry.forceDismiss({ ...interaction, source: 'ancestor' }),
        )
      } else if (!this.#isRegistered(entry)) {
        currentWillDismiss = true
      } else if (requestDismissEntries.includes(entry)) {
        const dismissAction = entry.requestDismiss({
          ...interaction,
          source: 'self',
        })

        const wasSynchronouslyUnregistered = !this.#isRegistered(entry)
        currentWillDismiss =
          isFunction(dismissAction) || wasSynchronouslyUnregistered

        if (dismissAction) {
          dismissActionByEntry.set(entry, dismissAction)
        }
      }

      const childEntries = childEntriesByParentEntry.get(entry) ?? []

      childEntries.forEach((childEntry) =>
        visitEntry(childEntry, currentWillDismiss),
      )
    }

    visitEntry(targetGroup.targetEntry, false)

    groupEntries.forEach((entry) => {
      const dismissAction = dismissActionByEntry.get(entry)
      if (dismissAction && this.#isRegistered(entry)) {
        dismissAction()
      }
    })
  }

  #getEventInsideEntries = (
    entries: PopupEntries,
    event: Event,
  ): PopupEntries => {
    const matchedEntries = entries.filter(
      (entry) =>
        entry.elementRef.current !== null &&
        this.#isEventInsideEntry(entry, event),
    )

    return getEntriesWithAncestors(entries, matchedEntries)
  }

  #getPointerInsideEntries = (
    entries: PopupEntries,
    event: PointerEvent,
  ): PopupEntries => {
    const matchedEntries = entries.filter((entry) => {
      const isEventInsidePopup =
        entry.elementRef.current !== null &&
        this.#isEventInsideEntry(entry, event)
      const isTargetInsideTrigger = entry.isTargetInsideAnyTrigger(event.target)

      return isEventInsidePopup || isTargetInsideTrigger
    })

    return getEntriesWithAncestors(entries, matchedEntries)
  }

  #isEventInsideEntry = (entry: PopupEntry, event: Event) => {
    if (this.#markedInsideEntriesByEvent.get(event)?.has(entry)) {
      return true
    }

    const node = entry.elementRef.current
    if (!node) return false

    return node.contains(event.target as HTMLElement)
  }

  #attach = () => {
    this.#document.addEventListener('keydown', this.#handleKeyDown, true)
    this.#document.addEventListener('focusout', this.#handleFocusOut, true)
    this.#document.addEventListener(
      'pointerdown',
      this.#handlePointerDown,
      true,
    )
  }

  #detach = () => {
    this.#document.removeEventListener('keydown', this.#handleKeyDown, true)
    this.#document.removeEventListener('focusout', this.#handleFocusOut, true)
    this.#document.removeEventListener(
      'pointerdown',
      this.#handlePointerDown,
      true,
    )
  }
}

function isPrimaryPointerDown(event: PointerEvent) {
  return event.isPrimary && event.button === 0 && !event.ctrlKey
}

function getGroupEntries(targetGroup: PopupEntryGroup): PopupEntries {
  return [...targetGroup.descendantEntries, targetGroup.targetEntry]
}

function getDescendantEntries(
  entries: PopupEntries,
  targetEntry: PopupEntry,
): PopupEntries {
  return entries.filter((entry) => {
    if (entry === targetEntry) {
      return false
    }

    let ancestor = entry.parent

    while (ancestor) {
      if (ancestor === targetEntry) {
        return true
      }

      ancestor = ancestor.parent
    }

    return false
  })
}

function getRootNonModalEntries(entries: PopupEntries): PopupEntries {
  return getRootEntries(entries).filter((entry) => !entry.modalRef.current)
}

function getRootEntries(entries: PopupEntries): PopupEntries {
  return entries.filter((entry) => {
    const parentEntry = entry.parent

    return !parentEntry || !entries.includes(parentEntry)
  })
}

function getActiveEntries(entries: PopupEntries): PopupEntries {
  const modalBoundaryIndex = entries.findIndex(
    (entry) => entry.modalRef.current,
  )
  const activeEntries =
    modalBoundaryIndex === -1
      ? entries
      : entries.slice(0, modalBoundaryIndex + 1)

  return activeEntries
}

function resolveEscapeTargetGroups(
  event: KeyboardEvent,
  entries: PopupEntries,
  markedInsideEntries: ReadonlySet<PopupEntry> | undefined,
): readonly PopupEntryGroup[] {
  const activeEntries = getActiveEntries(entries)

  const target = event.target as HTMLElement

  const triggerEntry = activeEntries.find((entry) => {
    const trigger = entry.activeTriggerRef.current

    return trigger?.contains(target) ?? false
  })

  if (triggerEntry) {
    return [
      {
        targetEntry: triggerEntry,
        descendantEntries: getDescendantEntries(activeEntries, triggerEntry),
      },
    ]
  }

  const markedEntry = markedInsideEntries
    ? activeEntries.find((entry) => markedInsideEntries.has(entry))
    : undefined
  if (markedEntry) {
    return [
      {
        targetEntry: markedEntry,
        descendantEntries: getDescendantEntries(activeEntries, markedEntry),
      },
    ]
  }

  const modalBoundaryEntry = activeEntries.find(
    (entry) => entry.modalRef.current,
  )
  if (modalBoundaryEntry) {
    return [
      {
        targetEntry: modalBoundaryEntry,
        descendantEntries: getDescendantEntries(
          activeEntries,
          modalBoundaryEntry,
        ),
      },
    ]
  }

  return getRootNonModalEntries(activeEntries).map((targetEntry) => ({
    targetEntry,
    descendantEntries: getDescendantEntries(activeEntries, targetEntry),
  }))
}

function resolvePointerDownTargetGroups(
  entries: PopupEntries,
): readonly PopupEntryGroup[] {
  const activeEntries = getActiveEntries(entries)
  const rootEntries = getRootEntries(activeEntries)

  return rootEntries.map((targetEntry) => ({
    targetEntry,
    descendantEntries: getDescendantEntries(activeEntries, targetEntry),
  }))
}

function resolveFocusOutsideTargetGroups(
  entries: PopupEntries,
  focusOutsideEntries: PopupEntries,
): readonly PopupEntryGroup[] {
  const rootEntries = getRootEntries(entries)

  return rootEntries
    .map((targetEntry) => ({
      targetEntry,
      descendantEntries: getDescendantEntries(entries, targetEntry),
    }))
    .filter(
      (targetGroup) =>
        focusOutsideEntries.includes(targetGroup.targetEntry) ||
        targetGroup.descendantEntries.some((entry) =>
          focusOutsideEntries.includes(entry),
        ),
    )
}

function getFocusTargetEntries(
  entries: PopupEntries,
  target: EventTarget | null,
): PopupEntries {
  const matchedEntries = entries.filter((entry) =>
    entry.isTargetInsideFocusScope(target),
  )

  // Focus inside a portaled child Popup is also logically inside each of its
  // ancestor Popups, even though their DOM trees do not contain the target.
  return getEntriesWithAncestors(entries, matchedEntries)
}

function getEntriesWithAncestors(
  entries: PopupEntries,
  matchedEntries: PopupEntries,
): PopupEntries {
  const allEntries: PopupEntry[] = []

  matchedEntries.forEach((entry) => {
    let current: PopupEntry | undefined = entry

    // A portaled child Popup is logically inside every registered ancestor,
    // even though their DOM trees do not contain one another.
    while (current && entries.includes(current)) {
      allEntries.push(current)
      current = current.parent
    }
  })

  return allEntries
}

function createChildEntriesByParentEntry(
  targetEntry: PopupEntry,
  entries: PopupEntries,
): ReadonlyMap<PopupEntry, PopupEntries> {
  const childEntriesByParentEntry = new Map<PopupEntry, PopupEntry[]>()

  for (const entry of entries) {
    if (entry === targetEntry) {
      continue
    }

    let parent = entry.parent

    // A filtered group may omit intermediate ancestors (for example, paused
    // or modal entries). Connect to the nearest ancestor still in this group.
    while (parent && !entries.includes(parent)) {
      parent = parent.parent
    }

    if (!parent) {
      continue
    }

    const childEntries = childEntriesByParentEntry.get(parent)

    if (childEntries) {
      childEntries.push(entry)
    } else {
      childEntriesByParentEntry.set(parent, [entry])
    }
  }

  return childEntriesByParentEntry
}
