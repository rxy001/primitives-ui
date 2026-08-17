import type { ReactNode } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createPortal } from 'react-dom'
import { userEvent } from 'vitest/browser'
import type {
  EscapeKeyDownEvent,
  FocusOutsideEvent,
  PointerDownOutsideEvent,
  UsePopupProps,
} from '../usePopup'
import { createPrimitive } from '../../utils'
import { usePopup } from '../usePopup'

interface TestPopupProps extends UsePopupProps {
  children?: ReactNode
  testId?: string
}

function TestPopup({ children, testId = 'popup', ...options }: TestPopupProps) {
  const props = usePopup({
    enabled: true,
    initialFocus: false,
    returnFocus: false,
    ...options,
    children: children ?? (
      <button data-testid={`${testId}-inside`}>Inside</button>
    ),
    'data-testid': testId,
  })

  return createPrimitive('div', props)
}

async function pressEscape(target: HTMLElement) {
  target.focus()
  await userEvent.keyboard('{Escape}')
}

async function pointerDown(target: HTMLElement, init: PointerEventInit = {}) {
  if (Object.keys(init).length === 0) {
    await userEvent.click(target)
  } else {
    target.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        isPrimary: true,
        ...init,
      }),
    )
  }
}

async function moveFocus(from: HTMLElement, to: HTMLElement) {
  from.focus()
  to.focus()
}

async function focusElement(target: HTMLElement) {
  await act(async () => {
    target.focus()
  })
}

describe('usePopup dismissal API', () => {
  it('dismisses on Escape and exposes the original event and reason', async () => {
    const onEscapeKeyDown = vi.fn<(event: EscapeKeyDownEvent) => void>()
    const onDismiss = vi.fn()
    render(
      <TestPopup
        modal={false}
        onDismiss={onDismiss}
        onEscapeKeyDown={onEscapeKeyDown}
      />,
    )

    const popup = screen.getByTestId('popup')
    await pressEscape(popup)

    expect(onEscapeKeyDown).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onDismiss.mock.calls[0]?.[0]).toMatchObject({
      reason: 'escape-key',
      source: 'self',
      originalEvent: onEscapeKeyDown.mock.calls[0]?.[0].originalEvent,
    })
  })

  it('allows Escape dismissal to be disabled without suppressing its callback', async () => {
    const onEscapeKeyDown = vi.fn()
    const onDismiss = vi.fn()
    render(
      <TestPopup
        dismissOnEscapeKeyDown={false}
        modal={false}
        onDismiss={onDismiss}
        onEscapeKeyDown={onEscapeKeyDown}
      />,
    )

    await pressEscape(screen.getByTestId('popup'))

    expect(onEscapeKeyDown).toHaveBeenCalledOnce()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('allows the Escape callback to prevent dismissal', async () => {
    const onDismiss = vi.fn()
    render(
      <TestPopup
        modal={false}
        onDismiss={onDismiss}
        onEscapeKeyDown={(event) => event.preventDefault()}
      />,
    )

    await pressEscape(screen.getByTestId('popup'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('honors defaultPrevented on the original Escape event', async () => {
    const onEscapeKeyDown = vi.fn()
    const onDismiss = vi.fn()
    render(
      <TestPopup
        modal={false}
        onDismiss={onDismiss}
        onEscapeKeyDown={onEscapeKeyDown}
      />,
    )
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Escape',
    })
    event.preventDefault()

    screen.getByTestId('popup').dispatchEvent(event)

    expect(onEscapeKeyDown).toHaveBeenCalledOnce()
    expect(onEscapeKeyDown.mock.calls[0]?.[0].defaultPrevented).toBe(true)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses on primary pointer down outside', async () => {
    const onPointerDownOutside =
      vi.fn<(event: PointerDownOutsideEvent) => void>()
    const onDismiss = vi.fn()
    render(
      <>
        <TestPopup
          modal={false}
          onDismiss={onDismiss}
          onPointerDownOutside={onPointerDownOutside}
        />
        <button data-testid='outside'>Outside</button>
      </>,
    )

    await pointerDown(screen.getByTestId('outside'))

    expect(onPointerDownOutside).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onDismiss.mock.calls[0]?.[0]).toMatchObject({
      reason: 'pointer-down-outside',
      source: 'self',
      originalEvent: onPointerDownOutside.mock.calls[0]?.[0].originalEvent,
    })
  })

  it('does not dismiss for a pointer down inside', async () => {
    const onPointerDownOutside = vi.fn()
    const onDismiss = vi.fn()
    render(
      <TestPopup
        modal={false}
        onDismiss={onDismiss}
        onPointerDownOutside={onPointerDownOutside}
      />,
    )

    await pointerDown(screen.getByTestId('popup-inside'))

    expect(onPointerDownOutside).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('allows pointer dismissal to be disabled or prevented', async () => {
    const disabledCallback = vi.fn()
    const preventedCallback = vi.fn((event: PointerDownOutsideEvent) =>
      event.preventDefault(),
    )
    const onDisabledDismiss = vi.fn()
    const onPreventedDismiss = vi.fn()
    render(
      <>
        <TestPopup
          dismissOnPointerDownOutside={false}
          modal={false}
          onDismiss={onDisabledDismiss}
          onPointerDownOutside={disabledCallback}
          testId='disabled'
        />
        <TestPopup
          modal={false}
          onDismiss={onPreventedDismiss}
          onPointerDownOutside={preventedCallback}
          testId='prevented'
        />
        <button data-testid='outside'>Outside</button>
      </>,
    )

    await pointerDown(screen.getByTestId('outside'))

    expect(disabledCallback).toHaveBeenCalledOnce()
    expect(preventedCallback).toHaveBeenCalledOnce()
    expect(onDisabledDismiss).not.toHaveBeenCalled()
    expect(onPreventedDismiss).not.toHaveBeenCalled()
  })

  it('dismisses a non-modal Popup when focus leaves it', async () => {
    const onFocusOutside = vi.fn<(event: FocusOutsideEvent) => void>()
    const onDismiss = vi.fn()
    render(
      <>
        <TestPopup
          modal={false}
          onDismiss={onDismiss}
          onFocusOutside={onFocusOutside}
        />
        <button data-testid='outside'>Outside</button>
      </>,
    )

    await moveFocus(
      screen.getByTestId('popup-inside'),
      screen.getByTestId('outside'),
    )

    await waitFor(() => {
      expect(onFocusOutside).toHaveBeenCalledOnce()
      expect(onDismiss).toHaveBeenCalledOnce()
    })
    expect(onDismiss.mock.calls[0]?.[0]).toMatchObject({
      reason: 'focus-outside',
      source: 'self',
      originalEvent: onFocusOutside.mock.calls[0]?.[0].originalEvent,
    })
  })

  it('allows focus dismissal to be disabled or prevented', async () => {
    const onDisabledDismiss = vi.fn()
    const onPreventedDismiss = vi.fn()
    const disabledCallback = vi.fn()
    const preventedCallback = vi.fn((event: FocusOutsideEvent) =>
      event.preventDefault(),
    )
    render(
      <>
        <TestPopup
          dismissOnFocusOutside={false}
          modal={false}
          onDismiss={onDisabledDismiss}
          onFocusOutside={disabledCallback}
          testId='disabled'
        />
        <TestPopup
          modal={false}
          onDismiss={onPreventedDismiss}
          onFocusOutside={preventedCallback}
          testId='prevented'
        />
        <button data-testid='outside'>Outside</button>
      </>,
    )
    const outside = screen.getByTestId('outside')

    await moveFocus(screen.getByTestId('disabled-inside'), outside)
    await moveFocus(screen.getByTestId('prevented-inside'), outside)

    await waitFor(() => {
      expect(disabledCallback).toHaveBeenCalledOnce()
      expect(preventedCallback).toHaveBeenCalledOnce()
    })
    expect(onDisabledDismiss).not.toHaveBeenCalled()
    expect(onPreventedDismiss).not.toHaveBeenCalled()
  })

  it('does not dispatch focus-outside callbacks to a modal Popup', async () => {
    const onFocusOutside = vi.fn()
    const onDismiss = vi.fn()
    render(
      <>
        <TestPopup
          modal
          onDismiss={onDismiss}
          onFocusOutside={onFocusOutside}
        />
        <button data-testid='outside'>Outside</button>
      </>,
    )

    await moveFocus(
      screen.getByTestId('popup-inside'),
      screen.getByTestId('outside'),
    )

    expect(onFocusOutside).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('uses the latest callbacks and dismissal flags after rerender', async () => {
    const firstDismiss = vi.fn()
    const latestDismiss = vi.fn()
    const latestEscape = vi.fn()
    const { rerender } = render(
      <TestPopup
        dismissOnEscapeKeyDown={false}
        modal={false}
        onDismiss={firstDismiss}
      />,
    )

    rerender(
      <TestPopup
        dismissOnEscapeKeyDown
        modal={false}
        onDismiss={latestDismiss}
        onEscapeKeyDown={latestEscape}
      />,
    )
    await pressEscape(screen.getByTestId('popup'))

    expect(firstDismiss).not.toHaveBeenCalled()
    expect(latestEscape).toHaveBeenCalledOnce()
    expect(latestDismiss).toHaveBeenCalledOnce()
  })

  it('dismisses only the child branch when Escape originates in a child', async () => {
    const onParentDismiss = vi.fn()
    const onChildDismiss = vi.fn()
    render(
      <TestPopup modal={false} onDismiss={onParentDismiss} testId='parent'>
        <TestPopup modal={false} onDismiss={onChildDismiss} testId='child' />
      </TestPopup>,
    )

    await pressEscape(screen.getByTestId('child'))

    expect(onChildDismiss).toHaveBeenCalledOnce()
    expect(onParentDismiss).not.toHaveBeenCalled()
  })

  it('force-dismisses descendants without firing their preventable hook', async () => {
    const calls: string[] = []
    render(
      <>
        <TestPopup
          modal={false}
          onDismiss={(event) => calls.push(`dismiss parent:${event.source}`)}
          onPointerDownOutside={() => calls.push('request parent')}
          testId='parent'
        >
          <TestPopup
            modal={false}
            onDismiss={(event) => calls.push(`dismiss child:${event.source}`)}
            onPointerDownOutside={() => calls.push('request child')}
            testId='child'
          />
        </TestPopup>
        <button data-testid='outside'>Outside</button>
      </>,
    )

    await pointerDown(screen.getByTestId('outside'))

    expect(calls).toEqual([
      'request parent',
      'dismiss child:ancestor',
      'dismiss parent:self',
    ])
  })

  it('does not respond while disabled', async () => {
    const onDismiss = vi.fn()
    render(
      <>
        <TestPopup enabled={false} modal={false} onDismiss={onDismiss} />
        <button data-testid='outside'>Outside</button>
      </>,
    )

    await pressEscape(screen.getByTestId('popup'))
    await pointerDown(screen.getByTestId('outside'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does not dismiss twice for pointerdown followed by focusout', async () => {
    vi.useFakeTimers()
    try {
      const onDismiss = vi.fn()
      render(
        <>
          <TestPopup modal={false} onDismiss={onDismiss} />
          <button data-testid='outside'>Outside</button>
        </>,
      )
      const inside = screen.getByTestId('popup-inside')
      const outside = screen.getByTestId('outside')

      fireEvent.pointerDown(outside, { button: 0, isPrimary: true })
      fireEvent.focusOut(inside, { relatedTarget: outside })
      fireEvent.focusIn(outside, { relatedTarget: inside })
      await Promise.resolve()

      expect(onDismiss).toHaveBeenCalledOnce()
      expect(onDismiss.mock.calls[0]?.[0].reason).toBe('pointer-down-outside')

      await vi.runOnlyPendingTimersAsync()
      expect(onDismiss).toHaveBeenCalledOnce()
    } finally {
      vi.useRealTimers()
    }
  })

  it('preserves user capture handlers and the default tabIndex', async () => {
    const calls: string[] = []
    render(
      <TestPopup
        modal={false}
        onBlurCapture={() => calls.push('blur')}
        onFocusCapture={() => calls.push('focus')}
        onKeyDownCapture={() => calls.push('key')}
        onPointerDownCapture={() => calls.push('pointer')}
      />,
    )
    const popup = screen.getByTestId('popup')
    const inside = screen.getByTestId('popup-inside')

    expect(popup).toHaveAttribute('tabindex', '-1')
    fireEvent.focusIn(inside)
    fireEvent.keyDown(inside, { key: 'Enter' })
    fireEvent.pointerDown(inside, { button: 0, isPrimary: true })
    fireEvent.focusOut(inside, { relatedTarget: popup })

    await waitFor(() => {
      expect(calls).toEqual(['focus', 'key', 'pointer', 'blur'])
    })
  })

  it('allows a user tabIndex to override the default', () => {
    render(<TestPopup modal={false} tabIndex={0} />)
    expect(screen.getByTestId('popup')).toHaveAttribute('tabindex', '0')
  })
})

function PortalTestPopup(props: TestPopupProps) {
  return <TestPopup modal={false} {...props} />
}

describe('Popup pointer and keyboard events with React Portal content', () => {
  it('treats pointerdown in a Portal as inside its Popup', async () => {
    const onDismiss = vi.fn()
    const onPointerDownCapture = vi.fn()
    render(
      <PortalTestPopup
        onDismiss={onDismiss}
        onPointerDownCapture={onPointerDownCapture}
        testId='popup'
      >
        {createPortal(
          <button data-testid='portal'>Portal</button>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await userEvent.click(screen.getByTestId('portal'))

    expect(onPointerDownCapture).toHaveBeenCalledOnce()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('preserves the Portal inside mark when a user capture handler stops propagation', async () => {
    const onDismiss = vi.fn()
    render(
      <PortalTestPopup
        onDismiss={onDismiss}
        onPointerDownCapture={(event) => event.stopPropagation()}
        testId='popup'
      >
        {createPortal(
          <button data-testid='portal'>Portal</button>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await userEvent.click(screen.getByTestId('portal'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses with pointer-down-outside when clicking outside a Portal Popup', async () => {
    const onDismiss = vi.fn()
    render(
      <>
        <PortalTestPopup onDismiss={onDismiss} testId='popup'>
          {createPortal(
            <button data-testid='portal'>Portal</button>,
            document.body,
          )}
        </PortalTestPopup>
        <button data-testid='outside'>Outside</button>
      </>,
    )

    await userEvent.click(screen.getByTestId('outside'))

    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onDismiss.mock.calls[0]?.[0].reason).toBe('pointer-down-outside')
  })

  it('targets a Portal Popup when Escape originates in its Portal', async () => {
    const onDismiss = vi.fn()
    render(
      <PortalTestPopup onDismiss={onDismiss} testId='popup'>
        {createPortal(
          <button data-testid='portal'>Portal</button>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await focusElement(screen.getByTestId('portal'))
    await userEvent.keyboard('{Escape}')

    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onDismiss.mock.calls[0]?.[0].reason).toBe('escape-key')
  })

  it('dismisses only a child branch when Escape originates in its Portal', async () => {
    const onParentDismiss = vi.fn()
    const onChildDismiss = vi.fn()
    const onParentKeyDownCapture = vi.fn()
    const onChildKeyDownCapture = vi.fn()
    render(
      <PortalTestPopup
        onDismiss={onParentDismiss}
        onKeyDownCapture={onParentKeyDownCapture}
        testId='parent'
      >
        {createPortal(
          <PortalTestPopup
            onDismiss={onChildDismiss}
            onKeyDownCapture={onChildKeyDownCapture}
            testId='child'
          >
            <button data-testid='child-portal'>Child Portal</button>
          </PortalTestPopup>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await focusElement(screen.getByTestId('child-portal'))
    await userEvent.keyboard('{Escape}')

    expect(onParentKeyDownCapture).toHaveBeenCalledOnce()
    expect(onChildKeyDownCapture).toHaveBeenCalledOnce()
    expect(onChildDismiss).toHaveBeenCalledOnce()
    expect(onParentDismiss).not.toHaveBeenCalled()
  })

  it('dismisses every exited descendant in a three-level Portal tree', async () => {
    const onParentDismiss = vi.fn()
    const onChildDismiss = vi.fn()
    const onGrandchildDismiss = vi.fn()
    render(
      <PortalTestPopup onDismiss={onParentDismiss} testId='parent'>
        <button data-testid='parent-inside'>Parent</button>
        {createPortal(
          <PortalTestPopup onDismiss={onChildDismiss} testId='child'>
            {createPortal(
              <PortalTestPopup
                onDismiss={onGrandchildDismiss}
                testId='grandchild'
              >
                <button data-testid='grandchild-inside'>Grandchild</button>
              </PortalTestPopup>,
              document.body,
            )}
          </PortalTestPopup>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await focusElement(screen.getByTestId('grandchild-inside'))
    await focusElement(screen.getByTestId('parent-inside'))

    expect(onParentDismiss).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(onChildDismiss).toHaveBeenCalledOnce()
      expect(onGrandchildDismiss).toHaveBeenCalledOnce()
    })
  })
})
