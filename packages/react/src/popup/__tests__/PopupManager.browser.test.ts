import type { PopupDismissInteraction, PopupEntry } from '../PopupManager'
import { markEventInsidePopup, PopupManager } from '../PopupManager'

type EntryOverrides = Partial<PopupEntry>

function createTestDocument() {
  return document.implementation.createHTMLDocument('popup-test')
}

function createEntry(
  doc: Document,
  parent?: PopupEntry,
  overrides: EntryOverrides = {},
): PopupEntry {
  const elementRef = overrides.elementRef ?? {
    current: doc.createElement('div'),
  }

  return {
    parent,
    elementRef,
    modalRef: { current: false },
    pause: vi.fn(),
    resume: vi.fn(),
    triggerRef: { current: null },
    isFocusInside: (target) =>
      !!target &&
      typeof (target as Node).nodeType === 'number' &&
      elementRef.current?.contains(target as Node) === true,
    requestDismiss: vi.fn(() => undefined),
    forceDismiss: vi.fn(() => vi.fn()),
    ...overrides,
  }
}

function markNextEventInside(
  target: HTMLElement,
  type: 'keydown' | 'pointerdown',
  entry: PopupEntry,
) {
  target.addEventListener(type, (event) => markEventInsidePopup(entry, event), {
    once: true,
  })
}

async function flushTasks() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

async function pressEscape(
  target: Document | HTMLElement,
  init: KeyboardEventInit = {},
) {
  dispatchKeyboardEvent(target, { key: 'Escape', ...init })
}

async function pointerDown(target: HTMLElement, init: PointerEventInit = {}) {
  dispatchPointerEvent(target, {
    button: 0,
    isPrimary: true,
    ...init,
  })
}

async function moveFocus(from: HTMLElement, to: HTMLElement) {
  dispatchFocusEvent(from, 'focusout', to)
  dispatchFocusEvent(to, 'focusin', from)
  await flushTasks()
}

function dispatchKeyboardEvent(
  target: Document | HTMLElement,
  init: KeyboardEventInit,
) {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  })
  target.dispatchEvent(event)
  return event
}

function dispatchPointerEvent(
  target: HTMLElement,
  init: PointerEventInit = {},
) {
  const event = new MouseEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    button: init.button,
    ctrlKey: init.ctrlKey,
  }) as PointerEvent

  Object.defineProperty(event, 'isPrimary', {
    configurable: true,
    value: init.isPrimary ?? false,
  })

  target.dispatchEvent(event)
  return event
}

function dispatchFocusEvent(
  target: HTMLElement,
  type: 'focusin' | 'focusout',
  relatedTarget: EventTarget | null,
) {
  const event = new FocusEvent(type, {
    bubbles: true,
    cancelable: false,
    relatedTarget,
  })
  target.dispatchEvent(event)
  return event
}

describe('PopupManager registration', () => {
  it('ignores duplicate registration and makes cleanup idempotent', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const requestDismiss = vi.fn(() => undefined)
    const entry = createEntry(doc, undefined, { requestDismiss })
    const firstCleanup = manager.register(entry)
    const duplicateCleanup = manager.register(entry)

    duplicateCleanup()
    await pressEscape(doc)
    expect(requestDismiss).toHaveBeenCalledOnce()

    firstCleanup()
    firstCleanup()
    await pressEscape(doc)
    expect(requestDismiss).toHaveBeenCalledOnce()
  })

  it('keeps managers in different Documents isolated', async () => {
    const firstDocument = createTestDocument()
    const secondDocument = createTestDocument()
    const firstManager = new PopupManager(firstDocument)
    const secondManager = new PopupManager(secondDocument)
    const dismissFirst = vi.fn()
    const dismissSecond = vi.fn()
    const unregisterFirst = firstManager.register(
      createEntry(firstDocument, undefined, {
        requestDismiss: () => dismissFirst,
      }),
    )
    const unregisterSecond = secondManager.register(
      createEntry(secondDocument, undefined, {
        requestDismiss: () => dismissSecond,
      }),
    )

    await pressEscape(firstDocument)

    expect(dismissFirst).toHaveBeenCalledOnce()
    expect(dismissSecond).not.toHaveBeenCalled()

    unregisterSecond()
    unregisterFirst()
  })
})

describe('PopupManager Escape handling', () => {
  it.each([
    ['a non-Escape key', { key: 'Enter' }],
    ['a repeated Escape', { key: 'Escape', repeat: true }],
    ['an Escape during composition', { key: 'Escape', isComposing: true }],
  ])('ignores %s', async (_name, init) => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const requestDismiss = vi.fn(() => vi.fn())
    const unregister = manager.register(
      createEntry(doc, undefined, { requestDismiss }),
    )

    dispatchKeyboardEvent(doc, init)

    expect(requestDismiss).not.toHaveBeenCalled()
    unregister()
  })

  it('targets the Popup associated with a trigger descendant', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const trigger = doc.createElement('button')
    const triggerChild = doc.createElement('span')
    trigger.append(triggerChild)
    doc.body.append(trigger)
    const requestTargetDismiss = vi.fn(() => vi.fn())
    const requestOtherDismiss = vi.fn(() => vi.fn())
    const target = createEntry(doc, undefined, {
      triggerRef: { current: trigger },
      requestDismiss: requestTargetDismiss,
    })
    const other = createEntry(doc, undefined, {
      requestDismiss: requestOtherDismiss,
    })
    const unregisterTarget = manager.register(target)
    const unregisterOther = manager.register(other)

    await pressEscape(triggerChild)

    expect(requestTargetDismiss).toHaveBeenCalledOnce()
    expect(requestOtherDismiss).not.toHaveBeenCalled()

    unregisterOther()
    unregisterTarget()
  })

  it('targets a logical Portal branch marked by the event', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const portal = doc.createElement('button')
    doc.body.append(portal)
    const requestTargetDismiss = vi.fn(() => vi.fn())
    const requestOtherDismiss = vi.fn(() => vi.fn())
    const target = createEntry(doc, undefined, {
      requestDismiss: requestTargetDismiss,
    })
    const other = createEntry(doc, undefined, {
      requestDismiss: requestOtherDismiss,
    })
    const unregisterTarget = manager.register(target)
    const unregisterOther = manager.register(other)

    markNextEventInside(portal, 'keydown', target)
    await pressEscape(portal)

    expect(requestTargetDismiss).toHaveBeenCalledOnce()
    expect(requestOtherDismiss).not.toHaveBeenCalled()

    unregisterOther()
    unregisterTarget()
  })

  it('uses the modal boundary when Escape has no explicit owner', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const requestBackgroundDismiss = vi.fn(() => vi.fn())
    const requestModalDismiss = vi.fn(() => vi.fn())
    const background = createEntry(doc, undefined, {
      requestDismiss: requestBackgroundDismiss,
    })
    const modal = createEntry(doc, undefined, {
      modalRef: { current: true },
      requestDismiss: requestModalDismiss,
    })
    const unregisterBackground = manager.register(background)
    const unregisterModal = manager.register(modal)

    await pressEscape(doc)

    expect(requestModalDismiss).toHaveBeenCalledOnce()
    expect(requestBackgroundDismiss).not.toHaveBeenCalled()

    unregisterModal()
    unregisterBackground()
  })

  it('handles every independent non-modal root when Escape has no owner', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const requestFirstDismiss = vi.fn(() => vi.fn())
    const requestSecondDismiss = vi.fn(() => vi.fn())
    const first = createEntry(doc, undefined, {
      requestDismiss: requestFirstDismiss,
    })
    const second = createEntry(doc, undefined, {
      requestDismiss: requestSecondDismiss,
    })
    const unregisterFirst = manager.register(first)
    const unregisterSecond = manager.register(second)

    await pressEscape(doc)

    expect(requestFirstDismiss).toHaveBeenCalledOnce()
    expect(requestSecondDismiss).toHaveBeenCalledOnce()

    unregisterSecond()
    unregisterFirst()
  })

  it('decides root-first and commits deepest-first through four levels', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const calls: string[] = []
    const root = createEntry(doc, undefined, {
      requestDismiss: () => {
        calls.push('decide root')
        return () => calls.push('commit root')
      },
    })
    const child = createEntry(doc, root, {
      forceDismiss: () => () => calls.push('commit child'),
    })
    const grandchild = createEntry(doc, child, {
      forceDismiss: () => () => calls.push('commit grandchild'),
    })
    const greatGrandchild = createEntry(doc, grandchild, {
      forceDismiss: () => () => calls.push('commit great-grandchild'),
    })
    const cleanups = [root, child, grandchild, greatGrandchild].map((entry) =>
      manager.register(entry),
    )

    await pressEscape(doc)

    expect(calls).toEqual([
      'decide root',
      'commit great-grandchild',
      'commit grandchild',
      'commit child',
      'commit root',
    ])

    cleanups.reverse().forEach((cleanup) => cleanup())
  })

  it('continues to a child when its parent rejects dismissal', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const dismissChild = vi.fn()
    const requestParentDismiss = vi.fn()
    const requestChildDismiss = vi.fn(() => dismissChild)
    const parent = createEntry(doc, undefined, {
      requestDismiss: requestParentDismiss,
    })
    const child = createEntry(doc, parent, {
      requestDismiss: requestChildDismiss,
    })
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)

    await pressEscape(doc)

    expect(requestParentDismiss).toHaveBeenCalledOnce()
    expect(requestChildDismiss).toHaveBeenCalledOnce()
    expect(dismissChild).toHaveBeenCalledOnce()

    unregisterChild()
    unregisterParent()
  })

  it('does not target an entry registered after keydown', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const requestFirstDismiss = vi.fn()
    const requestNewDismiss = vi.fn(() => vi.fn())
    const unregisterFirst = manager.register(
      createEntry(doc, undefined, { requestDismiss: requestFirstDismiss }),
    )

    dispatchKeyboardEvent(doc, { key: 'Escape' })
    const unregisterNew = manager.register(
      createEntry(doc, undefined, { requestDismiss: requestNewDismiss }),
    )

    expect(requestFirstDismiss).toHaveBeenCalledOnce()
    expect(requestNewDismiss).not.toHaveBeenCalled()

    unregisterNew()
    unregisterFirst()
  })

  it('does not commit an entry unregistered during its Escape decision', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const dismiss = vi.fn()
    let unregister = () => {}
    const requestDismiss = vi.fn(() => {
      unregister()
      return dismiss
    })
    unregister = manager.register(
      createEntry(doc, undefined, { requestDismiss }),
    )

    await pressEscape(doc)

    expect(requestDismiss).toHaveBeenCalledOnce()
    expect(dismiss).not.toHaveBeenCalled()
  })
})

describe('PopupManager pointer-down edge cases', () => {
  it.each([
    ['a secondary button', { button: 2, isPrimary: true }],
    ['a non-primary pointer', { button: 0, isPrimary: false }],
    ['a control-click', { button: 0, isPrimary: true, ctrlKey: true }],
  ])('ignores %s', async (_name, init) => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const outside = doc.createElement('button')
    doc.body.append(outside)
    const requestDismiss = vi.fn(() => vi.fn())
    const unregister = manager.register(
      createEntry(doc, undefined, { requestDismiss }),
    )

    await pointerDown(outside, init)

    expect(requestDismiss).not.toHaveBeenCalled()
    unregister()
  })

  it('treats a marked Portal event as inside its Popup tree', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const portal = doc.createElement('button')
    doc.body.append(portal)
    const requestParentDismiss = vi.fn(() => vi.fn())
    const requestChildDismiss = vi.fn(() => vi.fn())
    const parent = createEntry(doc, undefined, {
      requestDismiss: requestParentDismiss,
    })
    const child = createEntry(doc, parent, {
      requestDismiss: requestChildDismiss,
    })
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)

    markNextEventInside(portal, 'pointerdown', child)
    await pointerDown(portal)

    expect(requestParentDismiss).not.toHaveBeenCalled()
    expect(requestChildDismiss).not.toHaveBeenCalled()

    unregisterChild()
    unregisterParent()
  })

  it('processes only the latest reentrant pointerdown generation', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const firstTarget = doc.createElement('button')
    const secondTarget = doc.createElement('button')
    doc.body.append(firstTarget, secondTarget)
    const interactions: PopupDismissInteraction[] = []
    const requestDismiss = vi.fn((interaction: PopupDismissInteraction) => {
      interactions.push(interaction)
      return vi.fn()
    })
    const unregister = manager.register(
      createEntry(doc, undefined, { requestDismiss }),
    )
    const dispatchSecondPointerDown = (event: Event) => {
      if (event.target === firstTarget) {
        dispatchPointerEvent(secondTarget, { button: 0, isPrimary: true })
      }
    }
    doc.addEventListener('pointerdown', dispatchSecondPointerDown, true)

    dispatchPointerEvent(firstTarget, { button: 0, isPrimary: true })

    expect(requestDismiss).toHaveBeenCalledOnce()
    expect(interactions[0]?.originalEvent.target).toBe(secondTarget)

    doc.removeEventListener('pointerdown', dispatchSecondPointerDown, true)
    unregister()
  })

  it('does not target an entry registered after pointerdown', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const outside = doc.createElement('button')
    doc.body.append(outside)
    const requestFirstDismiss = vi.fn()
    const requestNewDismiss = vi.fn(() => vi.fn())
    const unregisterFirst = manager.register(
      createEntry(doc, undefined, { requestDismiss: requestFirstDismiss }),
    )

    dispatchPointerEvent(outside, { button: 0, isPrimary: true })
    const unregisterNew = manager.register(
      createEntry(doc, undefined, { requestDismiss: requestNewDismiss }),
    )

    expect(requestFirstDismiss).toHaveBeenCalledOnce()
    expect(requestNewDismiss).not.toHaveBeenCalled()

    unregisterNew()
    unregisterFirst()
  })

  it('suppresses focusout caused by pointerdown and accepts a later transition', async () => {
    vi.useFakeTimers()
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const inside = doc.createElement('button')
    const outside = doc.createElement('button')
    doc.body.append(inside, outside)
    const requestDismiss = vi.fn(() => undefined)
    const unregister = manager.register(
      createEntry(doc, undefined, {
        elementRef: { current: inside },
        requestDismiss,
      }),
    )

    dispatchPointerEvent(inside, { button: 0, isPrimary: true })
    dispatchFocusEvent(inside, 'focusout', outside)
    await Promise.resolve()
    expect(requestDismiss).not.toHaveBeenCalled()

    vi.runOnlyPendingTimers()
    dispatchFocusEvent(inside, 'focusout', outside)
    vi.runOnlyPendingTimers()
    expect(requestDismiss).toHaveBeenCalledOnce()

    unregister()
    vi.useRealTimers()
  })
})

describe('PopupManager deep focus transitions', () => {
  it('dismisses every popup exited when focus moves from a grandchild to its root', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const calls: string[] = []
    const rootNode = doc.createElement('button')
    const childNode = doc.createElement('button')
    const grandchildNode = doc.createElement('button')
    doc.body.append(rootNode, childNode, grandchildNode)
    const root = createEntry(doc, undefined, {
      elementRef: { current: rootNode },
      requestDismiss: () => {
        calls.push('request root')
        return () => calls.push('dismiss root')
      },
    })
    const child = createEntry(doc, root, {
      elementRef: { current: childNode },
      requestDismiss: () => {
        calls.push('request child')
        return () => calls.push('dismiss child')
      },
    })
    const grandchild = createEntry(doc, child, {
      elementRef: { current: grandchildNode },
      requestDismiss: () => {
        calls.push('request grandchild')
        return () => calls.push('dismiss grandchild')
      },
      forceDismiss: () => () => calls.push('dismiss grandchild'),
    })
    const unregisterRoot = manager.register(root)
    const unregisterChild = manager.register(child)
    const unregisterGrandchild = manager.register(grandchild)

    await moveFocus(grandchildNode, rootNode)

    expect(calls).toEqual([
      'request child',
      'dismiss grandchild',
      'dismiss child',
    ])

    unregisterGrandchild()
    unregisterChild()
    unregisterRoot()
  })

  it('keeps the destination sibling branch and closes only the source branch', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const root = createEntry(doc)
    const firstNode = doc.createElement('button')
    const secondNode = doc.createElement('button')
    doc.body.append(firstNode, secondNode)
    const dismissFirst = vi.fn()
    const first = createEntry(doc, root, {
      elementRef: { current: firstNode },
      requestDismiss: () => dismissFirst,
    })
    const requestSecondDismiss = vi.fn(() => vi.fn())
    const second = createEntry(doc, root, {
      elementRef: { current: secondNode },
      requestDismiss: requestSecondDismiss,
    })
    const unregisterRoot = manager.register(root)
    const unregisterFirst = manager.register(first)
    const unregisterSecond = manager.register(second)

    await moveFocus(firstNode, secondNode)

    expect(dismissFirst).toHaveBeenCalledOnce()
    expect(requestSecondDismiss).not.toHaveBeenCalled()

    unregisterSecond()
    unregisterFirst()
    unregisterRoot()
  })

  it('dispatches two synchronous focus transitions from their own snapshots', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const inside = doc.createElement('button')
    const firstOutside = doc.createElement('button')
    const secondOutside = doc.createElement('button')
    doc.body.append(inside, firstOutside, secondOutside)
    const originalEvents: FocusEvent[] = []
    const requestDismiss = vi.fn((interaction: PopupDismissInteraction) => {
      if (interaction.reason === 'focus-outside') {
        originalEvents.push(interaction.originalEvent)
      }
      return
    })
    const unregister = manager.register(
      createEntry(doc, undefined, {
        elementRef: { current: inside },
        requestDismiss,
      }),
    )

    dispatchFocusEvent(inside, 'focusout', firstOutside)
    dispatchFocusEvent(inside, 'focusout', secondOutside)
    await flushTasks()

    expect(requestDismiss).toHaveBeenCalledTimes(2)
    expect(originalEvents.map((event) => event.relatedTarget)).toEqual([
      firstOutside,
      secondOutside,
    ])

    unregister()
  })

  it('ignores a Portal destination mark for a different related target', async () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const inside = doc.createElement('button')
    const destination = doc.createElement('button')
    const other = doc.createElement('button')
    doc.body.append(inside, destination, other)
    const dismiss = vi.fn()
    const entry = createEntry(doc, undefined, {
      elementRef: { current: inside },
      requestDismiss: () => dismiss,
    })
    const unregister = manager.register(entry)

    dispatchFocusEvent(inside, 'focusout', destination)
    dispatchFocusEvent(other, 'focusin', inside)
    manager.markFocusDestinationInside(
      entry,
      new FocusEvent('focusin', { relatedTarget: inside }),
    )
    await flushTasks()

    expect(dismiss).toHaveBeenCalledOnce()
    unregister()
  })
})

// These cases use the live browser document so native focus transitions are
// covered in addition to the detached-document event snapshots above.
type LiveEntryOverrides = Partial<PopupEntry>

function createLiveEntry(
  parent?: PopupEntry,
  overrides: LiveEntryOverrides = {},
): PopupEntry {
  const elementRef = overrides.elementRef ?? {
    current: document.createElement('div'),
  }
  const isFocusInside =
    overrides.isFocusInside ??
    ((target: EventTarget | null) =>
      !!target &&
      typeof (target as Node).nodeType === 'number' &&
      elementRef.current?.contains(target as Node) === true)

  return {
    parent,
    elementRef,
    modalRef: { current: false },
    pause: vi.fn(),
    resume: vi.fn(),
    triggerRef: { current: null },
    isFocusInside,
    requestDismiss: vi.fn(),
    forceDismiss: vi.fn(() => vi.fn()),
    ...overrides,
  }
}

async function livePointerDown(target: HTMLElement) {
  target.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      isPrimary: true,
    }),
  )
}

async function moveLiveFocus(from: HTMLElement, to: HTMLElement) {
  from.tabIndex = from.tabIndex < 0 ? 0 : from.tabIndex
  to.tabIndex = to.tabIndex < 0 ? 0 : to.tabIndex
  from.focus()
  to.focus()
  await flushTasks()
}

function markLiveFocusOutInside(target: HTMLElement, entry: PopupEntry) {
  target.addEventListener(
    'focusout',
    (event) => markEventInsidePopup(entry, event),
    { once: true },
  )
}

function markLiveFocusDestinationInside(
  manager: PopupManager,
  target: HTMLElement,
  entry: PopupEntry,
) {
  target.addEventListener(
    'focusin',
    (event) => manager.markFocusDestinationInside(entry, event),
    { once: true },
  )
}

function isLiveInteraction(
  interaction: PopupDismissInteraction,
  reason: PopupDismissInteraction['reason'],
) {
  return interaction.reason === reason
}

describe('PopupManager pointer-down handling', () => {
  it('decides parent first and commits child first within a Popup tree', async () => {
    const calls: string[] = []
    const manager = new PopupManager(document)
    const outside = document.createElement('button')
    const parent = createLiveEntry(undefined, {
      requestDismiss: () => {
        calls.push('decide parent')
        return () => calls.push('commit parent')
      },
    })
    const child = createLiveEntry(parent, {
      forceDismiss: () => () => calls.push('commit child'),
    })
    const grandchild = createLiveEntry(child, {
      forceDismiss: () => () => calls.push('commit grandchild'),
    })

    document.body.append(outside)
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)
    const unregisterGrandchild = manager.register(grandchild)

    await livePointerDown(outside)

    expect(calls).toEqual([
      'decide parent',
      'commit grandchild',
      'commit child',
      'commit parent',
    ])

    unregisterGrandchild()
    unregisterChild()
    unregisterParent()
    outside.remove()
  })

  it('treats a descendant as inside its ancestor Popup branch', async () => {
    const manager = new PopupManager(document)
    const requestParentDismiss = vi.fn()
    const requestChildDismiss = vi.fn()
    const dismissSibling = vi.fn()
    const requestSiblingDismiss = vi.fn(() => dismissSibling)
    const parent = createLiveEntry(undefined, {
      requestDismiss: requestParentDismiss,
    })
    const child = createLiveEntry(parent, {
      requestDismiss: requestChildDismiss,
    })
    const sibling = createLiveEntry(parent, {
      requestDismiss: requestSiblingDismiss,
    })
    const childNode = child.elementRef.current!

    document.body.append(childNode)
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)
    const unregisterSibling = manager.register(sibling)

    await livePointerDown(childNode)

    expect(requestParentDismiss).not.toHaveBeenCalled()
    expect(requestChildDismiss).not.toHaveBeenCalled()
    expect(requestSiblingDismiss).toHaveBeenCalledOnce()
    expect(dismissSibling).toHaveBeenCalledOnce()

    unregisterSibling()
    unregisterChild()
    unregisterParent()
    childNode.remove()
  })

  it('handles independent Popup trees separately', async () => {
    const manager = new PopupManager(document)
    const requestFirstDismiss = vi.fn(() => vi.fn())
    const dismissSecond = vi.fn()
    const requestSecondDismiss = vi.fn(() => dismissSecond)
    const firstRoot = createLiveEntry(undefined, {
      requestDismiss: requestFirstDismiss,
    })
    const secondRoot = createLiveEntry(undefined, {
      requestDismiss: requestSecondDismiss,
    })
    const firstNode = firstRoot.elementRef.current!

    document.body.append(firstNode)
    const unregisterFirst = manager.register(firstRoot)
    const unregisterSecond = manager.register(secondRoot)

    await livePointerDown(firstNode)

    expect(requestFirstDismiss).not.toHaveBeenCalled()
    expect(requestSecondDismiss).toHaveBeenCalledOnce()
    expect(dismissSecond).toHaveBeenCalledOnce()

    unregisterSecond()
    unregisterFirst()
    firstNode.remove()
  })
})

describe('PopupManager focus-outside handling', () => {
  it('decides parent first and commits child first outside a Popup tree', async () => {
    const calls: string[] = []
    const manager = new PopupManager(document)
    const outside = document.createElement('button')
    const parent = createLiveEntry(undefined, {
      requestDismiss: (interaction) => {
        if (isLiveInteraction(interaction, 'focus-outside')) {
          calls.push('decide parent')
          return () => calls.push('commit parent')
        }
        return
      },
    })
    const child = createLiveEntry(parent, {
      forceDismiss: (interaction) => () => {
        if (isLiveInteraction(interaction, 'focus-outside')) {
          calls.push('commit child')
        }
      },
    })
    const childNode = child.elementRef.current!

    document.body.append(childNode, outside)
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)

    await moveLiveFocus(childNode, outside)

    expect(calls).toEqual(['decide parent', 'commit child', 'commit parent'])

    unregisterChild()
    unregisterParent()
    childNode.remove()
    outside.remove()
  })

  it('dismisses only the child when focus moves from child to parent', async () => {
    const manager = new PopupManager(document)
    const requestParentDismiss = vi.fn()
    const dismissChild = vi.fn()
    const requestChildDismiss = vi.fn(() => dismissChild)
    const parent = createLiveEntry(undefined, {
      requestDismiss: requestParentDismiss,
    })
    const child = createLiveEntry(parent, {
      requestDismiss: requestChildDismiss,
    })
    const parentNode = parent.elementRef.current!
    const childNode = child.elementRef.current!

    document.body.append(parentNode, childNode)
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)

    await moveLiveFocus(childNode, parentNode)

    expect(requestParentDismiss).not.toHaveBeenCalled()
    expect(requestChildDismiss).toHaveBeenCalledOnce()
    expect(dismissChild).toHaveBeenCalledOnce()

    unregisterChild()
    unregisterParent()
    parentNode.remove()
    childNode.remove()
  })

  it('dismisses only the sibling branch that focus leaves', async () => {
    const manager = new PopupManager(document)
    const requestParentDismiss = vi.fn()
    const parent = createLiveEntry(undefined, {
      requestDismiss: requestParentDismiss,
    })
    const dismissFirst = vi.fn()
    const requestFirstDismiss = vi.fn(() => dismissFirst)
    const first = createLiveEntry(parent, {
      requestDismiss: requestFirstDismiss,
    })
    const requestSecondDismiss = vi.fn(() => vi.fn())
    const second = createLiveEntry(parent, {
      requestDismiss: requestSecondDismiss,
    })
    const firstNode = first.elementRef.current!
    const secondNode = second.elementRef.current!

    document.body.append(firstNode, secondNode)
    const unregisterParent = manager.register(parent)
    const unregisterFirst = manager.register(first)
    const unregisterSecond = manager.register(second)

    await moveLiveFocus(firstNode, secondNode)

    expect(requestParentDismiss).not.toHaveBeenCalled()
    expect(requestFirstDismiss).toHaveBeenCalledOnce()
    expect(dismissFirst).toHaveBeenCalledOnce()
    expect(requestSecondDismiss).not.toHaveBeenCalled()

    unregisterSecond()
    unregisterFirst()
    unregisterParent()
    firstNode.remove()
    secondNode.remove()
  })

  it('handles independent Popup trees separately', async () => {
    const manager = new PopupManager(document)
    const dismissFirst = vi.fn()
    const requestFirstDismiss = vi.fn(() => dismissFirst)
    const requestSecondDismiss = vi.fn(() => vi.fn())
    const first = createLiveEntry(undefined, {
      requestDismiss: requestFirstDismiss,
    })
    const second = createLiveEntry(undefined, {
      requestDismiss: requestSecondDismiss,
    })
    const firstNode = first.elementRef.current!
    const secondNode = second.elementRef.current!

    document.body.append(firstNode, secondNode)
    const unregisterFirst = manager.register(first)
    const unregisterSecond = manager.register(second)

    await moveLiveFocus(firstNode, secondNode)

    expect(requestFirstDismiss).toHaveBeenCalledOnce()
    expect(dismissFirst).toHaveBeenCalledOnce()
    expect(requestSecondDismiss).not.toHaveBeenCalled()

    unregisterSecond()
    unregisterFirst()
    firstNode.remove()
    secondNode.remove()
  })

  it('ignores focus moving between elements outside every Popup', async () => {
    const manager = new PopupManager(document)
    const firstOutside = document.createElement('button')
    const secondOutside = document.createElement('button')
    const requestDismiss = vi.fn(() => vi.fn())
    const entry = createLiveEntry(undefined, { requestDismiss })

    document.body.append(firstOutside, secondOutside)
    const unregister = manager.register(entry)

    await moveLiveFocus(firstOutside, secondOutside)

    expect(requestDismiss).not.toHaveBeenCalled()

    unregister()
    firstOutside.remove()
    secondOutside.remove()
  })

  it('treats a React Portal destination as inside its Popup', async () => {
    const manager = new PopupManager(document)
    const popupNode = document.createElement('div')
    const portalNode = document.createElement('button')
    const requestDismiss = vi.fn(() => vi.fn())
    const entry = createLiveEntry(undefined, {
      elementRef: { current: popupNode },
      requestDismiss,
    })

    popupNode.append(document.createElement('button'))
    document.body.append(popupNode, portalNode)
    const unregister = manager.register(entry)
    const insideNode = popupNode.firstElementChild as HTMLElement

    markLiveFocusDestinationInside(manager, portalNode, entry)
    await moveLiveFocus(insideNode, portalNode)

    expect(requestDismiss).not.toHaveBeenCalled()

    unregister()
    popupNode.remove()
    portalNode.remove()
  })

  it('treats a React Portal source as inside its Popup', async () => {
    const manager = new PopupManager(document)
    const popupNode = document.createElement('div')
    const portalNode = document.createElement('button')
    const outside = document.createElement('button')
    const dismiss = vi.fn()
    const requestDismiss = vi.fn(() => dismiss)
    const entry = createLiveEntry(undefined, {
      elementRef: { current: popupNode },
      requestDismiss,
    })

    document.body.append(popupNode, portalNode, outside)
    const unregister = manager.register(entry)

    markLiveFocusOutInside(portalNode, entry)
    await moveLiveFocus(portalNode, outside)

    expect(requestDismiss).toHaveBeenCalledOnce()
    expect(dismiss).toHaveBeenCalledOnce()

    unregister()
    popupNode.remove()
    portalNode.remove()
    outside.remove()
  })

  it('keeps focus inside when moving between React Portals', async () => {
    const manager = new PopupManager(document)
    const firstPortalNode = document.createElement('button')
    const secondPortalNode = document.createElement('button')
    const requestDismiss = vi.fn(() => vi.fn())
    const entry = createLiveEntry(undefined, { requestDismiss })

    document.body.append(firstPortalNode, secondPortalNode)
    const unregister = manager.register(entry)

    markLiveFocusOutInside(firstPortalNode, entry)
    markLiveFocusDestinationInside(manager, secondPortalNode, entry)
    await moveLiveFocus(firstPortalNode, secondPortalNode)

    expect(requestDismiss).not.toHaveBeenCalled()

    unregister()
    firstPortalNode.remove()
    secondPortalNode.remove()
  })

  it('dismisses only a child Portal when focus moves to its parent', async () => {
    const manager = new PopupManager(document)
    const parentNode = document.createElement('button')
    const childPortalNode = document.createElement('button')
    const requestParentDismiss = vi.fn(() => vi.fn())
    const dismissChild = vi.fn()
    const requestChildDismiss = vi.fn(() => dismissChild)
    const parent = createLiveEntry(undefined, {
      elementRef: { current: parentNode },
      requestDismiss: requestParentDismiss,
    })
    const child = createLiveEntry(parent, {
      requestDismiss: requestChildDismiss,
    })

    document.body.append(parentNode, childPortalNode)
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)

    markLiveFocusOutInside(childPortalNode, child)
    await moveLiveFocus(childPortalNode, parentNode)

    expect(requestParentDismiss).not.toHaveBeenCalled()
    expect(requestChildDismiss).toHaveBeenCalledOnce()
    expect(dismissChild).toHaveBeenCalledOnce()

    unregisterChild()
    unregisterParent()
    parentNode.remove()
    childPortalNode.remove()
  })

  it('treats a focus guard as inside, then dismisses when focus leaves it', async () => {
    const manager = new PopupManager(document)
    const guard = document.createElement('span')
    const outside = document.createElement('button')
    const originalEvents: FocusEvent[] = []
    const requestDismiss = vi.fn((interaction: PopupDismissInteraction) => {
      if (interaction.reason === 'focus-outside') {
        originalEvents.push(interaction.originalEvent)
      }
      return
    })
    const popupNode = document.createElement('button')
    const entry = createLiveEntry(undefined, {
      elementRef: { current: popupNode },
      isFocusInside: (target) => target === popupNode || target === guard,
      requestDismiss,
    })

    document.body.append(popupNode, guard, outside)
    const unregister = manager.register(entry)

    await moveLiveFocus(popupNode, guard)

    expect(requestDismiss).not.toHaveBeenCalled()

    await moveLiveFocus(guard, outside)

    expect(requestDismiss).toHaveBeenCalledOnce()
    expect(originalEvents[0]?.target).toBe(guard)

    unregister()
    popupNode.remove()
    guard.remove()
    outside.remove()
  })

  it('continues to an exited child when its parent rejects dismissal', async () => {
    const manager = new PopupManager(document)
    const outside = document.createElement('button')
    const requestParentDismiss = vi.fn()
    const dismissChild = vi.fn()
    const requestChildDismiss = vi.fn(() => dismissChild)
    const parent = createLiveEntry(undefined, {
      requestDismiss: requestParentDismiss,
    })
    const child = createLiveEntry(parent, {
      requestDismiss: requestChildDismiss,
    })
    const childNode = child.elementRef.current!

    document.body.append(childNode, outside)
    const unregisterParent = manager.register(parent)
    const unregisterChild = manager.register(child)

    await moveLiveFocus(childNode, outside)

    expect(requestParentDismiss).toHaveBeenCalledOnce()
    expect(requestChildDismiss).toHaveBeenCalledOnce()
    expect(dismissChild).toHaveBeenCalledOnce()

    unregisterChild()
    unregisterParent()
    childNode.remove()
    outside.remove()
  })

  it('does not dispatch to modal or paused background popups', async () => {
    const manager = new PopupManager(document)
    const outside = document.createElement('button')
    const requestBackgroundDismiss = vi.fn(() => vi.fn())
    const requestModalDismiss = vi.fn(() => vi.fn())
    const background = createLiveEntry(undefined, {
      requestDismiss: requestBackgroundDismiss,
    })
    const modal = createLiveEntry(undefined, {
      modalRef: { current: true },
      requestDismiss: requestModalDismiss,
    })
    const modalNode = modal.elementRef.current!

    document.body.append(modalNode, outside)
    const unregisterBackground = manager.register(background)
    const unregisterModal = manager.register(modal)

    await moveLiveFocus(modalNode, outside)

    expect(requestBackgroundDismiss).not.toHaveBeenCalled()
    expect(requestModalDismiss).not.toHaveBeenCalled()

    unregisterModal()
    unregisterBackground()
    modalNode.remove()
    outside.remove()
  })

  it('does not duplicate a pointer-down-outside dismissal', async () => {
    vi.useFakeTimers()
    const manager = new PopupManager(document)
    const outside = document.createElement('button')
    const entryNode = document.createElement('button')
    const dismiss = vi.fn()
    const interactions: PopupDismissInteraction[] = []
    const requestDismiss = vi.fn((interaction: PopupDismissInteraction) => {
      interactions.push(interaction)
      return dismiss
    })
    const entry = createLiveEntry(undefined, {
      elementRef: { current: entryNode },
      requestDismiss,
    })

    document.body.append(entryNode, outside)
    const unregister = manager.register(entry)

    try {
      entryNode.focus()
      outside.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          button: 0,
          isPrimary: true,
        }),
      )
      outside.focus()

      expect(requestDismiss).toHaveBeenCalledOnce()
      expect(dismiss).toHaveBeenCalledOnce()
      expect(interactions).toHaveLength(1)
      expect(interactions[0]?.reason).toBe('pointer-down-outside')

      await vi.runOnlyPendingTimersAsync()
      expect(requestDismiss).toHaveBeenCalledOnce()
      expect(dismiss).toHaveBeenCalledOnce()
    } finally {
      unregister()
      entryNode.remove()
      outside.remove()
      vi.useRealTimers()
    }
  })

  it('ignores focus leaving the document without a destination', async () => {
    const manager = new PopupManager(document)
    const requestDismiss = vi.fn(() => vi.fn())
    const entry = createLiveEntry(undefined, { requestDismiss })
    const entryNode = entry.elementRef.current!

    document.body.append(entryNode)
    const unregister = manager.register(entry)

    entryNode.tabIndex = 0
    entryNode.focus()
    entryNode.blur()

    expect(requestDismiss).not.toHaveBeenCalled()

    unregister()
    entryNode.remove()
  })

  it('does not target a Popup registered after focusout', async () => {
    const manager = new PopupManager(document)
    const outside = document.createElement('button')
    const requestFirstDismiss = vi.fn()
    const requestNewDismiss = vi.fn(() => vi.fn())
    const first = createLiveEntry(undefined, {
      requestDismiss: requestFirstDismiss,
    })
    const newlyOpened = createLiveEntry(undefined, {
      requestDismiss: requestNewDismiss,
    })
    const firstNode = first.elementRef.current!

    document.body.append(firstNode, outside)
    const unregisterFirst = manager.register(first)

    firstNode.tabIndex = 0
    firstNode.focus()
    outside.focus()
    const unregisterNew = manager.register(newlyOpened)
    await flushTasks()

    expect(requestFirstDismiss).toHaveBeenCalledOnce()
    expect(requestNewDismiss).not.toHaveBeenCalled()

    unregisterNew()
    unregisterFirst()
    firstNode.remove()
    outside.remove()
  })
})
