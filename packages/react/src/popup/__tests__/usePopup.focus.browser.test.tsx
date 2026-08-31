import type { ReactNode } from 'react'
import { focus } from '#test'
import { createRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { render } from 'vitest-browser-react'
import { server } from 'vitest/browser'
import { userEvent } from 'vitest/browser'
import type { UsePopupProps } from '../usePopup'
import { createPrimitive } from '../../utils'
import { usePopup } from '../usePopup'

interface TestPopupProps extends UsePopupProps {
  children?: ReactNode
  testId?: string
}

function TestPopup({ children, testId = 'popup', ...options }: TestPopupProps) {
  const props = usePopup({
    ...options,
    children,
    'data-testid': testId,
  })

  return createPrimitive('div', props)
}

function PortalTestPopup(props: TestPopupProps) {
  return (
    <TestPopup
      enabled
      initialFocus={false}
      modal={false}
      returnFocus={false}
      {...props}
    />
  )
}

describe('usePopup initial focus', () => {
  it('focuses the first tabbable element and skips unavailable candidates', async () => {
    const screen = await render(
      <TestPopup enabled modal returnFocus={false}>
        <button data-testid='disabled' disabled>
          Disabled
        </button>
        <button data-testid='hidden' hidden>
          Hidden
        </button>
        <button data-testid='negative' tabIndex={-1}>
          Negative
        </button>
        <button data-testid='first'>First</button>
        <button data-testid='second'>Second</button>
      </TestPopup>,
    )

    await expect.element(screen.getByTestId('first')).toHaveFocus()
  })

  it('focuses the Popup when it has no tabbable descendants', async () => {
    const screen = await render(<TestPopup enabled modal returnFocus={false} />)

    await expect.element(screen.getByTestId('popup')).toHaveFocus()
  })

  it('keeps the current focus when initialFocus is false', async () => {
    const scene = (enabled: boolean) => (
      <>
        <button data-testid='outside'>Outside</button>
        <TestPopup
          enabled={enabled}
          initialFocus={false}
          modal
          returnFocus={false}
        >
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false))
    screen.getByTestId('outside').element().focus()

    await screen.rerender(scene(true))

    await expect.element(screen.getByTestId('outside')).toHaveFocus()
  })

  it('does not move focus when focus is already inside', async () => {
    const scene = (enabled: boolean) => (
      <TestPopup enabled={enabled} modal returnFocus={false}>
        <button data-testid='first'>First</button>
        <button data-testid='second'>Second</button>
      </TestPopup>
    )
    const screen = await render(scene(false))
    screen.getByTestId('second').element().focus()

    await screen.rerender(scene(true))

    await expect.element(screen.getByTestId('second')).toHaveFocus()
  })

  it('accepts an HTMLElement as initialFocus', async () => {
    const scene = (
      enabled: boolean,
      initialFocus: UsePopupProps['initialFocus'],
    ) => (
      <TestPopup
        enabled={enabled}
        initialFocus={initialFocus}
        modal
        returnFocus={false}
      >
        <button data-testid='first'>First</button>
        <button data-testid='target'>Target</button>
      </TestPopup>
    )
    const screen = await render(scene(false, false))
    const target = screen.getByTestId('target').element()

    await screen.rerender(scene(true, target as HTMLElement))

    await expect.element(screen.getByTestId('target')).toHaveFocus()
  })

  it('accepts a RefObject as initialFocus', async () => {
    const targetRef = createRef<HTMLButtonElement>()
    const scene = (enabled: boolean) => (
      <TestPopup
        enabled={enabled}
        initialFocus={targetRef}
        modal
        returnFocus={false}
      >
        <button data-testid='first'>First</button>
        <button data-testid='target' ref={targetRef}>
          Target
        </button>
      </TestPopup>
    )
    const screen = await render(scene(false))

    await screen.rerender(scene(true))

    await expect.element(screen.getByTestId('target')).toHaveFocus()
  })

  it('accepts a function as initialFocus and invokes it only when needed', async () => {
    const initialFocus = vi.fn(() =>
      document.querySelector<HTMLElement>('[data-testid="target"]'),
    )
    const scene = (enabled: boolean) => (
      <TestPopup
        enabled={enabled}
        initialFocus={initialFocus}
        modal
        returnFocus={false}
      >
        <button data-testid='first'>First</button>
        <button data-testid='target'>Target</button>
      </TestPopup>
    )
    const screen = await render(scene(false))

    await screen.rerender(scene(true))

    await expect.element(screen.getByTestId('target')).toHaveFocus()
    expect(initialFocus).toHaveBeenCalledOnce()
  })

  it('falls back to the first tabbable when the explicit target is unavailable', async () => {
    const detached = document.createElement('button')
    const screen = await render(
      <TestPopup enabled initialFocus={detached} modal returnFocus={false}>
        <button data-testid='first'>First</button>
      </TestPopup>,
    )

    await expect.element(screen.getByTestId('first')).toHaveFocus()
  })

  it('applies initial focus only to the topmost concurrently opened Popup', async () => {
    const screen = await render(
      <>
        <TestPopup
          enabled
          modal={false}
          returnFocus={false}
          testId='first-popup'
        >
          <button data-testid='first-target'>First</button>
        </TestPopup>
        <TestPopup
          enabled
          modal={false}
          returnFocus={false}
          testId='second-popup'
        >
          <button data-testid='second-target'>Second</button>
        </TestPopup>
      </>,
    )

    await expect.element(screen.getByTestId('second-target')).toHaveFocus()
    await expect.element(screen.getByTestId('first-target')).not.toHaveFocus()
  })
})

describe('usePopup return focus', () => {
  it('returns focus to the trigger when a modal session closes', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const scene = (enabled: boolean) => (
      <>
        <button data-testid='trigger' ref={triggerRef}>
          Trigger
        </button>
        <TestPopup enabled={enabled} modal trigger={triggerRef.current}>
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false))
    screen.getByTestId('trigger').element().focus()

    await screen.rerender(scene(true))
    await expect.element(screen.getByTestId('inside')).toHaveFocus()
    await screen.rerender(scene(false))

    await expect.element(screen.getByTestId('trigger')).toHaveFocus()
  })

  it('returns modal focus to the previously focused element without a trigger', async () => {
    const scene = (enabled: boolean) => (
      <>
        <button data-testid='previous'>Previous</button>
        <TestPopup enabled={enabled} modal>
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false))
    screen.getByTestId('previous').element().focus()

    await screen.rerender(scene(true))
    await expect.element(screen.getByTestId('inside')).toHaveFocus()
    await screen.rerender(scene(false))

    await expect.element(screen.getByTestId('previous')).toHaveFocus()
  })

  it('does not restore focus when returnFocus is false', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const scene = (enabled: boolean) => (
      <>
        <button data-testid='trigger' ref={triggerRef}>
          Trigger
        </button>
        <TestPopup
          enabled={enabled}
          modal
          returnFocus={false}
          trigger={triggerRef.current}
        >
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false))
    screen.getByTestId('trigger').element().focus()

    await screen.rerender(scene(true))
    await expect.element(screen.getByTestId('inside')).toHaveFocus()
    await screen.rerender(scene(false))

    await expect.element(screen.getByTestId('trigger')).not.toHaveFocus()
  })

  it('accepts an HTMLElement as returnFocus', async () => {
    const scene = (
      enabled: boolean,
      returnFocus: UsePopupProps['returnFocus'],
    ) => (
      <>
        <button data-testid='target'>Target</button>
        <TestPopup enabled={enabled} modal returnFocus={returnFocus}>
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false, false))
    const target = screen.getByTestId('target').element()

    await screen.rerender(scene(true, target as HTMLElement))
    await expect.element(screen.getByTestId('inside')).toHaveFocus()
    await screen.rerender(scene(false, target as HTMLElement))

    await expect.element(screen.getByTestId('target')).toHaveFocus()
  })

  it('accepts a RefObject as returnFocus', async () => {
    const targetRef = createRef<HTMLButtonElement>()
    const scene = (enabled: boolean) => (
      <>
        <button data-testid='target' ref={targetRef}>
          Target
        </button>
        <TestPopup enabled={enabled} modal returnFocus={targetRef}>
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false))

    await screen.rerender(scene(true))
    await expect.element(screen.getByTestId('inside')).toHaveFocus()
    await screen.rerender(scene(false))

    await expect.element(screen.getByTestId('target')).toHaveFocus()
  })

  it('accepts a function as returnFocus and reads its latest result', async () => {
    let targetTestId = 'first-target'
    const returnFocus = vi.fn(() =>
      document.querySelector<HTMLElement>(`[data-testid="${targetTestId}"]`),
    )
    const scene = (enabled: boolean) => (
      <>
        <button data-testid='first-target'>First target</button>
        <button data-testid='second-target'>Second target</button>
        <TestPopup enabled={enabled} modal returnFocus={returnFocus}>
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false))

    await screen.rerender(scene(true))
    await expect.element(screen.getByTestId('inside')).toHaveFocus()
    targetTestId = 'second-target'
    await screen.rerender(scene(false))

    await expect.element(screen.getByTestId('second-target')).toHaveFocus()
    expect(returnFocus).toHaveBeenCalledOnce()
  })

  it('does not steal focus when it already moved outside the Popup', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const scene = (enabled: boolean) => (
      <>
        <button data-testid='trigger' ref={triggerRef}>
          Trigger
        </button>
        <button data-testid='other'>Other</button>
        <TestPopup enabled={enabled} modal trigger={triggerRef.current}>
          <button data-testid='inside'>Inside</button>
        </TestPopup>
      </>
    )
    const screen = await render(scene(false))

    await screen.rerender(scene(true))
    await expect.element(screen.getByTestId('inside')).toHaveFocus()
    screen.getByTestId('other').element().focus()
    await screen.rerender(scene(false))

    await expect.element(screen.getByTestId('other')).toHaveFocus()
  })

  it('does not steal focus back after focus-outside dismissal', async () => {
    function DismissiblePopup() {
      const [enabled, setEnabled] = useState(true)
      return (
        <>
          <TestPopup
            enabled={enabled}
            modal={false}
            onDismiss={() => setEnabled(false)}
          >
            <button data-testid='inside'>Inside</button>
          </TestPopup>
          <button data-testid='outside'>Outside</button>
        </>
      )
    }
    const screen = await render(<DismissiblePopup />)
    await expect.element(screen.getByTestId('inside')).toHaveFocus()

    screen.getByTestId('outside').element().focus()

    await expect.element(screen.getByTestId('outside')).toHaveFocus()
  })
})

describe('usePopup modal focus guards', () => {
  it('wraps Tab from the last tabbable to the first', async () => {
    const screen = await render(
      <TestPopup enabled modal returnFocus={false}>
        <button data-testid='first'>First</button>
        <button data-testid='last'>Last</button>
      </TestPopup>,
    )
    screen.getByTestId('last').element().focus()

    await userEvent.tab()

    await expect.element(screen.getByTestId('first')).toHaveFocus()
  })

  it('wraps Shift+Tab from the first tabbable to the last', async () => {
    const screen = await render(
      <TestPopup enabled modal returnFocus={false}>
        <button data-testid='first'>First</button>
        <button data-testid='last'>Last</button>
      </TestPopup>,
    )
    await expect.element(screen.getByTestId('first')).toHaveFocus()

    await userEvent.tab({ shift: true })

    await expect.element(screen.getByTestId('last')).toHaveFocus()
  })

  it('returns focus to the Popup when there are no tabbable children', async () => {
    const screen = await render(<TestPopup enabled modal returnFocus={false} />)
    await expect.element(screen.getByTestId('popup')).toHaveFocus()

    await userEvent.tab()

    await expect.element(screen.getByTestId('popup')).toHaveFocus()
  })

  it.skipIf(server.browser === 'firefox')(
    'recovers focus when the focused tabbable is removed',
    async () => {
      const scene = (showSecond: boolean) => (
        <TestPopup enabled modal returnFocus={false}>
          <button data-testid='first'>First</button>
          {showSecond ? <button data-testid='second'>Second</button> : null}
        </TestPopup>
      )
      const screen = await render(scene(true))
      screen.getByTestId('second').element().focus()

      await screen.rerender(scene(false))

      await expect.element(screen.getByTestId('first')).toHaveFocus()
    },
  )
  it('recovers focus when the focused tabbable becomes hidden', async () => {
    const screen = await render(
      <TestPopup enabled modal returnFocus={false}>
        <button data-testid='first'>First</button>
        <button data-testid='second'>Second</button>
      </TestPopup>,
    )
    const second = screen.getByTestId('second').element()
    second.focus()
    second.style.display = 'none'
    second.blur()

    await expect.element(screen.getByTestId('first')).toHaveFocus()
  })
})

describe('usePopup non-modal Tab order', () => {
  function NonModalScene({ withTabbable = true }: { withTabbable?: boolean }) {
    const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
    return (
      <>
        <button data-testid='before'>Before</button>
        <button data-testid='trigger' ref={setTrigger}>
          Trigger
        </button>
        <TestPopup
          enabled
          initialFocus={false}
          modal={false}
          returnFocus={false}
          trigger={trigger}
        >
          {withTabbable ? (
            <>
              <button data-testid='first'>First</button>
              <button data-testid='last'>Last</button>
            </>
          ) : null}
        </TestPopup>
        <button data-testid='after'>After</button>
      </>
    )
  }

  it('moves from the trigger into the first Popup tabbable', async () => {
    const screen = await render(<NonModalScene />)
    screen.getByTestId('trigger').element().focus()

    await userEvent.tab()

    await expect.element(screen.getByTestId('first')).toHaveFocus()
  })

  it('moves forward from the last Popup tabbable to the next outside element', async () => {
    const screen = await render(<NonModalScene />)
    screen.getByTestId('last').element().focus()

    await userEvent.tab()

    await expect.element(screen.getByTestId('after')).toHaveFocus()
  })

  it('moves backward from the first Popup tabbable to its trigger', async () => {
    const screen = await render(<NonModalScene />)
    screen.getByTestId('first').element().focus()

    await userEvent.tab({ shift: true })

    await expect.element(screen.getByTestId('trigger')).toHaveFocus()
  })

  it('skips a Popup with no tabbable elements', async () => {
    const screen = await render(<NonModalScene withTabbable={false} />)
    screen.getByTestId('trigger').element().focus()

    await userEvent.tab()

    await expect.element(screen.getByTestId('after')).toHaveFocus()
  })
})

describe('Popup focus outside with React Portal content', () => {
  it('keeps focus inside when moving from Popup DOM to a Portal', async () => {
    const onDismiss = vi.fn()
    const screen = await render(
      <PortalTestPopup onDismiss={onDismiss} testId='popup'>
        <button data-testid='inside'>Inside</button>
        {createPortal(
          <button data-testid='portal'>Portal</button>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await focus(screen.getByTestId('inside'))
    await focus(screen.getByTestId('portal'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('keeps focus inside when moving from a Portal to Popup DOM', async () => {
    const onDismiss = vi.fn()
    const screen = await render(
      <PortalTestPopup onDismiss={onDismiss} testId='popup'>
        <button data-testid='inside'>Inside</button>
        {createPortal(
          <button data-testid='portal'>Portal</button>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await focus(screen.getByTestId('portal'))
    await focus(screen.getByTestId('inside'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('keeps focus inside when moving between two Portals', async () => {
    const onDismiss = vi.fn()
    const screen = await render(
      <PortalTestPopup onDismiss={onDismiss} testId='popup'>
        {createPortal(
          <button data-testid='first-portal'>First Portal</button>,
          document.body,
        )}
        {createPortal(
          <button data-testid='second-portal'>Second Portal</button>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await focus(screen.getByTestId('first-portal'))
    await focus(screen.getByTestId('second-portal'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses when focus moves from a Portal to outside', async () => {
    const onDismiss = vi.fn()
    const screen = await render(
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

    await focus(screen.getByTestId('portal'))
    await focus(screen.getByTestId('outside'))

    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onDismiss.mock.calls[0]?.[0].reason).toBe('focus-outside')
  })

  it('dismisses only a child Portal when focus moves to its parent', async () => {
    const onParentDismiss = vi.fn()
    const onChildDismiss = vi.fn()
    const screen = await render(
      <PortalTestPopup onDismiss={onParentDismiss} testId='parent'>
        <button data-testid='parent-inside'>Parent</button>
        {createPortal(
          <PortalTestPopup onDismiss={onChildDismiss} testId='child'>
            <button data-testid='child-inside'>Child</button>
          </PortalTestPopup>,
          document.body,
        )}
      </PortalTestPopup>,
    )

    await focus(screen.getByTestId('child-inside'))
    await focus(screen.getByTestId('parent-inside'))

    expect(onParentDismiss).not.toHaveBeenCalled()
    expect(onChildDismiss).toHaveBeenCalledOnce()
  })
})
