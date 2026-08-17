import type { PopupEntry } from '../PopupManager'
import { getPopupManager, PopupManager } from '../PopupManager'

function createTestDocument() {
  return document.implementation.createHTMLDocument('popup-test')
}

function createEntry(
  doc: Document,
  overrides: Partial<PopupEntry> = {},
): PopupEntry {
  const elementRef = overrides.elementRef ?? {
    current: doc.createElement('div'),
  }

  return {
    elementRef,
    modalRef: { current: false },
    pause: vi.fn(),
    resume: vi.fn(),
    getTrigger: () => null,
    isFocusInside: (target) =>
      !!target &&
      typeof (target as Node).nodeType === 'number' &&
      elementRef.current?.contains(target as Node) === true,
    requestDismiss: vi.fn(() => null),
    forceDismiss: vi.fn(() => vi.fn()),
    ...overrides,
  }
}

describe('PopupManager registration', () => {
  it('returns one manager per Document', () => {
    const firstDocument = createTestDocument()
    const secondDocument = createTestDocument()

    expect(getPopupManager(firstDocument)).toBe(getPopupManager(firstDocument))
    expect(getPopupManager(firstDocument)).not.toBe(
      getPopupManager(secondDocument),
    )
  })

  it('attaches listeners for the first entry and detaches them after the last', () => {
    const doc = createTestDocument()
    const addEventListener = vi.spyOn(doc, 'addEventListener')
    const removeEventListener = vi.spyOn(doc, 'removeEventListener')
    const manager = new PopupManager(doc)
    const first = createEntry(doc)
    const second = createEntry(doc)

    const unregisterFirst = manager.register(first)
    const unregisterSecond = manager.register(second)

    expect(addEventListener).toHaveBeenCalledTimes(3)
    expect(addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      true,
    )
    expect(addEventListener).toHaveBeenCalledWith(
      'focusout',
      expect.any(Function),
      true,
    )
    expect(addEventListener).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function),
      true,
    )

    unregisterSecond()
    expect(removeEventListener).not.toHaveBeenCalled()

    unregisterFirst()
    expect(removeEventListener).toHaveBeenCalledTimes(3)
  })

  it('pauses entries below the topmost modal and resumes them when it closes', () => {
    const doc = createTestDocument()
    const manager = new PopupManager(doc)
    const background = createEntry(doc)
    const modal = createEntry(doc, { modalRef: { current: true } })
    const foreground = createEntry(doc)
    const unregisterBackground = manager.register(background)

    vi.mocked(background.pause).mockClear()
    vi.mocked(background.resume).mockClear()

    const unregisterModal = manager.register(modal)
    expect(background.pause).toHaveBeenCalledOnce()
    expect(modal.resume).toHaveBeenCalledOnce()

    vi.mocked(background.pause).mockClear()
    vi.mocked(modal.resume).mockClear()
    const unregisterForeground = manager.register(foreground)

    expect(foreground.resume).toHaveBeenCalledOnce()
    expect(modal.resume).toHaveBeenCalledOnce()
    expect(background.pause).toHaveBeenCalledOnce()
    expect(manager.getTopmostModalEntry()).toBe(modal)

    vi.mocked(background.resume).mockClear()
    unregisterModal()
    expect(background.resume).toHaveBeenCalledOnce()
    expect(manager.getTopmostModalEntry()).toBeUndefined()

    unregisterForeground()
    unregisterBackground()
  })
})
