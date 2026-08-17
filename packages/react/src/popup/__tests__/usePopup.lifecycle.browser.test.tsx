import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StrictMode, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { UsePopupProps } from '../usePopup'
import { createPrimitive } from '../../utils'
import { usePopup } from '../usePopup'

interface TestPopupProps extends UsePopupProps {
  children?: ReactNode
  testId?: string
}

function TestPopup({ children, testId = 'popup', ...options }: TestPopupProps) {
  const props = usePopup({
    initialFocus: false,
    returnFocus: false,
    ...options,
    children,
    'data-testid': testId,
  })

  return createPrimitive('div', props)
}

interface TriggerHarnessProps extends Omit<TestPopupProps, 'trigger'> {
  showTrigger?: boolean
}

function TriggerHarness({
  showTrigger = true,
  ...popupProps
}: TriggerHarnessProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {showTrigger ? (
        <button data-testid='trigger' ref={triggerRef}>
          Trigger
        </button>
      ) : null}
      <TestPopup {...popupProps} trigger={triggerRef} />
    </>
  )
}

function getGuards(popup: HTMLElement) {
  return {
    after: popup.nextElementSibling as HTMLElement | null,
    before: popup.previousElementSibling as HTMLElement | null,
  }
}

describe('usePopup enabled lifecycle', () => {
  it('does not render guards while disabled', () => {
    render(<TestPopup enabled={false} modal />)

    expect(
      document.querySelectorAll('[data-primitives-ui-focus-guard]'),
    ).toHaveLength(0)
  })

  it('renders two hidden focus guards while enabled', () => {
    render(<TestPopup enabled modal />)

    const guards = document.querySelectorAll<HTMLElement>(
      '[data-primitives-ui-focus-guard]',
    )
    expect(guards).toHaveLength(2)
    guards.forEach((guard) => {
      expect(guard).toHaveAttribute('aria-hidden', 'true')
      expect(guard).toHaveAttribute('tabindex', '0')
    })
  })

  it('adds and removes guards as enabled changes', () => {
    const { rerender } = render(<TestPopup enabled={false} modal />)

    rerender(<TestPopup enabled modal />)
    expect(
      document.querySelectorAll('[data-primitives-ui-focus-guard]'),
    ).toHaveLength(2)

    rerender(<TestPopup enabled={false} modal />)
    expect(
      document.querySelectorAll('[data-primitives-ui-focus-guard]'),
    ).toHaveLength(0)
  })

  it('does not accumulate registrations across reopen cycles', async () => {
    const onDismiss = vi.fn()
    const { rerender } = render(
      <TestPopup enabled modal={false} onDismiss={onDismiss} />,
    )

    rerender(<TestPopup enabled={false} modal={false} onDismiss={onDismiss} />)
    rerender(<TestPopup enabled modal={false} onDismiss={onDismiss} />)

    fireEvent.keyDown(screen.getByTestId('popup'), { key: 'Escape' })

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('keeps only popups above the modal boundary interactive', async () => {
    render(
      <>
        <TestPopup enabled modal={false} testId='background' />
        <TestPopup enabled modal testId='modal' />
        <TestPopup enabled modal={false} testId='foreground' />
      </>,
    )

    await waitFor(() => {
      const backgroundGuards = getGuards(screen.getByTestId('background'))
      const modalGuards = getGuards(screen.getByTestId('modal'))
      const foregroundGuards = getGuards(screen.getByTestId('foreground'))

      expect(backgroundGuards.before).toHaveAttribute('tabindex', '-1')
      expect(backgroundGuards.after).toHaveAttribute('tabindex', '-1')
      expect(modalGuards.before).toHaveAttribute('tabindex', '0')
      expect(modalGuards.after).toHaveAttribute('tabindex', '0')
      expect(foregroundGuards.before).toHaveAttribute('tabindex', '0')
      expect(foregroundGuards.after).toHaveAttribute('tabindex', '0')
    })
  })

  it('survives StrictMode setup-cleanup-setup without duplicate guards', () => {
    render(
      <StrictMode>
        <TestPopup enabled modal />
      </StrictMode>,
    )

    expect(
      document.querySelectorAll('[data-primitives-ui-focus-guard]'),
    ).toHaveLength(2)
  })
})

describe('usePopup non-modal anchor lifecycle', () => {
  it('creates an anchor host immediately after a connected trigger', async () => {
    render(<TriggerHarness enabled modal={false} />)

    const trigger = screen.getByTestId('trigger')
    await waitFor(() => {
      const host = trigger.nextElementSibling as HTMLElement | null
      expect(host).toHaveAttribute('data-primitives-ui-anchor-host')
      expect(host).toHaveAttribute('aria-hidden', 'true')
      expect(host?.style.display).toBe('contents')
      expect(
        host?.querySelector('[data-primitives-ui-anchor-guard]'),
      ).toBeInTheDocument()
    })
  })

  it('does not create an anchor for a modal Popup', () => {
    render(<TriggerHarness enabled modal />)

    expect(
      document.querySelector('[data-primitives-ui-anchor-host]'),
    ).not.toBeInTheDocument()
  })

  it('does not create an anchor for a disconnected trigger', () => {
    const trigger = document.createElement('button')
    render(<TestPopup enabled modal={false} trigger={trigger} testId='popup' />)

    expect(
      document.querySelector('[data-primitives-ui-anchor-host]'),
    ).not.toBeInTheDocument()
  })

  it('removes the anchor host when disabled or unmounted', async () => {
    const { rerender, unmount } = render(
      <TriggerHarness enabled modal={false} />,
    )

    expect(
      document.querySelector('[data-primitives-ui-anchor-host]'),
    ).toBeInTheDocument()

    rerender(<TriggerHarness enabled={false} modal={false} />)
    await waitFor(() => {
      expect(
        document.querySelector('[data-primitives-ui-anchor-host]'),
      ).not.toBeInTheDocument()
    })

    rerender(<TriggerHarness enabled modal={false} />)
    expect(
      document.querySelector('[data-primitives-ui-anchor-host]'),
    ).toBeInTheDocument()

    unmount()
    expect(
      document.querySelector('[data-primitives-ui-anchor-host]'),
    ).not.toBeInTheDocument()
  })

  it('removes the anchor Portal when the trigger is removed', async () => {
    const { rerender } = render(
      <TriggerHarness enabled modal={false} showTrigger />,
    )

    const host = document.querySelector<HTMLElement>(
      '[data-primitives-ui-anchor-host]',
    )
    expect(host).toBeInTheDocument()

    rerender(<TriggerHarness enabled modal={false} showTrigger={false} />)

    await waitFor(() => {
      expect(host).not.toBeInTheDocument()
      expect(
        host?.querySelector('[data-primitives-ui-anchor-guard]'),
      ).not.toBeInTheDocument()
    })
  })

  it('moves its host when the trigger moves in the DOM', async () => {
    const firstContainer = document.createElement('div')
    const secondContainer = document.createElement('div')
    const trigger = document.createElement('button')
    firstContainer.append(trigger)
    document.body.append(firstContainer, secondContainer)
    const { unmount } = render(
      <TestPopup enabled modal={false} trigger={trigger} />,
    )
    const host = document.querySelector<HTMLElement>(
      '[data-primitives-ui-anchor-host]',
    )!

    secondContainer.append(trigger)

    await waitFor(() => {
      expect(host.parentElement).toBe(secondContainer)
      expect(trigger.nextSibling).toBe(host)
    })

    unmount()
    firstContainer.remove()
    secondContainer.remove()
  })

  it('creates only one anchor host in StrictMode', () => {
    render(
      <StrictMode>
        <TriggerHarness enabled modal={false} />
      </StrictMode>,
    )

    expect(
      document.querySelectorAll('[data-primitives-ui-anchor-host]'),
    ).toHaveLength(1)
    expect(
      document.querySelectorAll('[data-primitives-ui-anchor-guard]'),
    ).toHaveLength(1)
  })
})

describe('usePopup accessibility isolation', () => {
  it('hides outside siblings for a modal and restores original values', async () => {
    const { rerender } = render(
      <>
        <div aria-hidden='false' data-testid='outside-false' />
        <div aria-hidden='true' data-testid='outside-true' />
        <div data-testid='outside-empty' />
        <TestPopup enabled modal />
      </>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('outside-false')).toHaveAttribute(
        'aria-hidden',
        'true',
      )
      expect(screen.getByTestId('outside-true')).toHaveAttribute(
        'aria-hidden',
        'true',
      )
      expect(screen.getByTestId('outside-empty')).toHaveAttribute(
        'aria-hidden',
        'true',
      )
    })

    rerender(
      <>
        <div aria-hidden='false' data-testid='outside-false' />
        <div aria-hidden='true' data-testid='outside-true' />
        <div data-testid='outside-empty' />
        <TestPopup enabled={false} modal />
      </>,
    )

    expect(screen.getByTestId('outside-false')).toHaveAttribute(
      'aria-hidden',
      'false',
    )
    expect(screen.getByTestId('outside-true')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.getByTestId('outside-empty')).not.toHaveAttribute(
      'aria-hidden',
    )
  })

  it('does not hide outside content for a non-modal Popup', () => {
    render(
      <>
        <div data-testid='outside' />
        <TestPopup enabled modal={false} />
      </>,
    )

    expect(screen.getByTestId('outside')).not.toHaveAttribute('aria-hidden')
  })
})

describe('usePopup rendering environments', () => {
  it('uses the Popup ownerDocument and isolates events across Documents', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDocument = frame.contentDocument!
    const onDismiss = vi.fn()

    const { unmount } = render(
      createPortal(
        <TestPopup enabled modal={false} onDismiss={onDismiss} />,
        frameDocument.body,
      ),
    )
    const popup = frameDocument.querySelector<HTMLElement>(
      '[data-testid="popup"]',
    )!

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.keyDown(popup, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledOnce()

    unmount()
    frame.remove()
  })
})
