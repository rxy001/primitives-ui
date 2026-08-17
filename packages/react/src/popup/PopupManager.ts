import { addEventListener } from '@primitives-ui/utils'
import type { OrderedRegistryEntry } from '../utils'
import {
  createOrderedRegistry,
  createDocumentManager,
  OrderedRegistry,
} from '../utils'

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

export type PopupDismissSource = 'self' | 'ancestor'

export type PopupDismissRequest<
  Source extends PopupDismissSource = PopupDismissSource,
> = PopupDismissInteraction & {
  source: Source
}

type PopupDismissAction = () => void

export interface PopupEntry extends OrderedRegistryEntry<PopupEntry> {
  modalRef: React.RefObject<boolean>
  pause: () => void
  resume: () => void
  getTrigger: () => HTMLElement | null

  isFocusInside(target: EventTarget | null): boolean

  requestDismiss(
    request: PopupDismissRequest<'self'>,
  ): PopupDismissAction | null

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
  eligibleEntries: PopupEntries
  eligibleEntrySet: PopupEntrySet
  destinationInsideEntrySet: Set<PopupEntry>
}

// `*Entries` preserves registry order. `*EntrySet` is membership-only.
type PopupEntries = readonly PopupEntry[]
type PopupEntrySet = ReadonlySet<PopupEntry>

export class PopupManager {
  readonly #registry: OrderedRegistry<PopupEntry>
  readonly #document: Document
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

  markFocusDestinationInside = (entry: PopupEntry, event: FocusEvent) => {
    const transition = this.#pendingFocusTransition

    // A React Portal is not a DOM descendant of its Popup. Match the target's
    // focusin event to the pending focusout and record its logical owner.
    if (
      !transition ||
      transition.originalEvent.relatedTarget !== event.target ||
      !transition.eligibleEntrySet.has(entry)
    ) {
      return
    }

    transition.destinationInsideEntrySet.add(entry)
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

        const targetGroups = resolveEscapeTargetGroups(event, registryEntries)
        // Evaluate recently registered independent roots first.
        targetGroups.forEach((targetGroup) => {
          const groupEntries = getGroupEntries(targetGroup)

          this.#dispatchDismissGroup(
            {
              reason: ESCAPE_KEY,
              originalEvent: event,
            },
            targetGroup,
            new Set(groupEntries),
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

        const targetGroups = resolvePointerDownTargetGroups(
          event,
          registryEntries,
        )

        targetGroups.forEach((targetGroup) => {
          const groupEntries = getGroupEntries(targetGroup)
          const insideEntrySet = getEventInsideEntrySet(groupEntries, event)
          const pointerOutsideEntrySet = new Set(
            groupEntries.filter((entry) => !insideEntrySet.has(entry)),
          )

          this.#dispatchDismissGroup(
            {
              reason: POINTER_DOWN_OUTSIDE,
              originalEvent: event,
            },
            targetGroup,
            pointerOutsideEntrySet,
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

    const eligibleEntries = getEligibleFocusOutsideEntries([
      ...this.#registry.getEntries(),
    ])

    const transition: PendingFocusTransition = {
      originalEvent: event,
      eligibleEntries,
      eligibleEntrySet: new Set(eligibleEntries),
      destinationInsideEntrySet: new Set(),
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
    const { originalEvent, eligibleEntries, destinationInsideEntrySet } =
      transition

    // DOM containment handles regular descendants. Event marks handle a
    // source rendered through React.createPortal().
    const sourceEntrySet = new Set([
      ...getFocusInsideEntrySet(eligibleEntries, originalEvent.target),
      ...getEventInsideEntrySet(eligibleEntries, originalEvent),
    ])

    if (sourceEntrySet.size === 0) return

    // Destination Portal ownership is written directly by onFocusCapture, so
    // the Manager does not need a document-level focusin listener.
    const destinationEntrySet = new Set([
      ...getFocusInsideEntrySet(eligibleEntries, originalEvent.relatedTarget),
      ...getEntryAndAncestorSet(eligibleEntries, destinationInsideEntrySet),
    ])

    const focusOutsideEntrySet = new Set(
      eligibleEntries.filter(
        (entry) => sourceEntrySet.has(entry) && !destinationEntrySet.has(entry),
      ),
    )

    if (focusOutsideEntrySet.size === 0) return

    const targetGroups = resolveFocusOutsideTargetGroups(
      eligibleEntries,
      focusOutsideEntrySet,
    )

    targetGroups.forEach((targetGroup) => {
      this.#dispatchDismissGroup(
        {
          reason: FOCUS_OUTSIDE,
          originalEvent,
        },
        targetGroup,
        focusOutsideEntrySet,
      )
    })
  }

  #dispatchDismissGroup = (
    interaction: PopupDismissInteraction,
    targetGroup: PopupEntryGroup,
    requestDismissEntrySet: PopupEntrySet,
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
      } else if (requestDismissEntrySet.has(entry)) {
        const dismissAction = entry.requestDismiss({
          ...interaction,
          source: 'self',
        })

        const wasSynchronouslyUnregistered = !this.#isRegistered(entry)
        currentWillDismiss =
          dismissAction !== null || wasSynchronouslyUnregistered

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

    // Registry order is descendant-first, so commits unmount children before
    // their ancestors after all preventable decisions have completed.
    groupEntries.forEach((entry) => {
      const dismissAction = dismissActionByEntry.get(entry)
      if (dismissAction && this.#isRegistered(entry)) {
        dismissAction()
      }
    })
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

const insideEntrySetByEvent = new WeakMap<Event, Set<PopupEntry>>()

export function markEventInsidePopup(entry: PopupEntry, event: Event) {
  // React events bubble through the React tree across createPortal() even when
  // DOM containment cannot associate the event target with the Popup.
  let insideEntrySet = insideEntrySetByEvent.get(event)

  if (!insideEntrySet) {
    insideEntrySet = new Set()
    insideEntrySetByEvent.set(event, insideEntrySet)
  }

  insideEntrySet.add(entry)
}

export function isEventInsidePopup(entry: PopupEntry, event: Event) {
  if (insideEntrySetByEvent.get(event)?.has(entry)) {
    return true
  }

  const node = entry.elementRef.current
  if (!node) return false

  const target = event.target as HTMLElement

  return node.contains(target)
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
  const entrySet = new Set(entries)

  return entries.filter((entry) => {
    const parentEntry = entry.parent

    return !parentEntry || !entrySet.has(parentEntry)
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
): readonly PopupEntryGroup[] {
  const activeEntries = getActiveEntries(entries)

  const target = event.target as HTMLElement
  const triggerEntry = activeEntries.find((entry) => {
    const trigger = entry.getTrigger()

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

  const markedInsideEntrySet = insideEntrySetByEvent.get(event)
  const markedEntry = markedInsideEntrySet
    ? activeEntries.find((entry) => markedInsideEntrySet.has(entry))
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
  event: PointerEvent,
  entries: PopupEntries,
): readonly PopupEntryGroup[] {
  const activeEntries = getActiveEntries(entries)

  const rootEntries = getRootEntries(activeEntries).filter(
    (entry) => !entry.getTrigger()?.contains(event.target as HTMLElement),
  )

  return rootEntries.map((targetEntry) => ({
    targetEntry,
    descendantEntries: getDescendantEntries(activeEntries, targetEntry),
  }))
}

function getEligibleFocusOutsideEntries(entries: PopupEntries): PopupEntries {
  // Modal focus is contained by guards and must not be dismissed merely
  // because a transient focusout appears to leave its DOM subtree.
  return getActiveEntries(entries).filter((entry) => !entry.modalRef.current)
}

function resolveFocusOutsideTargetGroups(
  entries: PopupEntries,
  focusOutsideEntrySet: PopupEntrySet,
): readonly PopupEntryGroup[] {
  const rootEntries = getRootEntries(entries)

  return rootEntries
    .map((targetEntry) => ({
      targetEntry,
      descendantEntries: getDescendantEntries(entries, targetEntry),
    }))
    .filter(
      (targetGroup) =>
        focusOutsideEntrySet.has(targetGroup.targetEntry) ||
        targetGroup.descendantEntries.some((entry) =>
          focusOutsideEntrySet.has(entry),
        ),
    )
}

function getEventInsideEntrySet(
  entries: PopupEntries,
  event: Event,
): PopupEntrySet {
  const directlyInsideEntrySet = new Set<PopupEntry>()

  entries.forEach((entry) => {
    if (!entry.elementRef.current || !isEventInsidePopup(entry, event)) {
      return
    }

    directlyInsideEntrySet.add(entry)
  })

  return getEntryAndAncestorSet(entries, directlyInsideEntrySet)
}

function getFocusInsideEntrySet(
  entries: PopupEntries,
  target: EventTarget | null,
): PopupEntrySet {
  const directlyInsideEntrySet = new Set<PopupEntry>()

  entries.forEach((entry) => {
    if (!entry.isFocusInside(target)) return

    directlyInsideEntrySet.add(entry)
  })

  return getEntryAndAncestorSet(entries, directlyInsideEntrySet)
}

function getEntryAndAncestorSet(
  entries: PopupEntries,
  directlyInsideEntrySet: PopupEntrySet,
): PopupEntrySet {
  const entrySet = new Set(entries)
  const insideEntrySet = new Set<PopupEntry>()

  directlyInsideEntrySet.forEach((entry) => {
    let current: PopupEntry | undefined = entry

    // A portaled child Popup is logically inside every registered ancestor,
    // even though their DOM trees do not contain one another.
    while (current && entrySet.has(current)) {
      insideEntrySet.add(current)
      current = current.parent
    }
  })

  return insideEntrySet
}

function createChildEntriesByParentEntry(
  targetEntry: PopupEntry,
  entries: PopupEntries,
): ReadonlyMap<PopupEntry, PopupEntries> {
  const entrySet = new Set(entries)
  const childEntriesByParentEntry = new Map<PopupEntry, PopupEntry[]>()

  for (const entry of entries) {
    if (entry === targetEntry) {
      continue
    }

    let parent = entry.parent

    // A filtered group may omit intermediate ancestors (for example, paused
    // or modal entries). Connect to the nearest ancestor still in this group.
    while (parent && !entrySet.has(parent)) {
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
