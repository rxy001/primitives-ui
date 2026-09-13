/* oxlint-disable jsx-a11y/no-autofocus -- These fixtures exercise the autofocus API. */
import type { ComponentProps } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import {
  createElement,
  createRef,
  StrictMode,
  useLayoutEffect,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import type { UseFocusRingProps } from '../useFocusRing'
import { Button } from '../../button'
import { getMetadataProps, getMetadataState } from '../metadata'
import { useFocusRing } from '../useFocusRing'

type FocusRingFixtureProps = Omit<ComponentProps<'input'>, 'ref'> &
  UseFocusRingProps & {
    as?: 'button' | 'a' | 'div' | 'input' | 'textarea' | 'select' | 'span'
    nodeKey?: string
    href?: string
  }

function FocusRingFixture({
  as = 'button',
  nodeKey,
  ...props
}: FocusRingFixtureProps) {
  const focusRingMetadata = useFocusRing(props)
  return createElement(as, {
    ...getMetadataProps(focusRingMetadata),
    key: nodeKey,
    'data-focus-visible': getMetadataState(focusRingMetadata).focusVisible,
  })
}

// Drain custom autofocus microtasks before registering our frame callback, so
// the hook's deferred focus/key updates run first in the same frame. act then
// flushes their React updates, including effects that clear a disabled ring.
// Even negative assertions must wait for pending updates to avoid false passes.
async function waitForFocusUpdates() {
  await act(async () => {
    await Promise.resolve()
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  })
}

async function focusElement(element: HTMLElement) {
  act(() => element.focus())
  await waitForFocusUpdates()
  expect(element.ownerDocument.activeElement).toBe(element)
}

async function expectFocusRing(
  element: HTMLElement,
  expectedFocusVisible: boolean,
) {
  await expect
    .poll(() => element.getAttribute('data-focus-visible'))
    .toBe(String(expectedFocusVisible))
}

async function clickAndFocus(element: HTMLElement) {
  await act(() => userEvent.click(element))
  // Some browsers do not focus buttons on click. Programmatic focus after the
  // real pointer interaction also exercises the hook's recorded input modality.
  await focusElement(element)
}

// Seed document modality without changing focus or activating native controls.
function setKeyboardModality(document: Document = window.document) {
  fireEvent.keyDown(document, { key: 'Shift', shiftKey: true })
}

function setMouseModality(document: Document = window.document) {
  fireEvent.mouseDown(document.body)
}

beforeEach(() => {
  // Initialize tracking before setting the input mode; it outlives each mount.
  render(<FocusRingFixture />)
  setKeyboardModality()
  cleanup()
})

afterEach(cleanup)

describe('focus and input modality', () => {
  it.each(['button', 'a', 'div'] as const)(
    'tracks keyboard navigation and blur on %s',
    async (as) => {
      const renderResult = render(
        <>
          <button tabIndex={0}>before</button>
          <FocusRingFixture
            as={as}
            href={as === 'a' ? '#' : undefined}
            tabIndex={0}
            data-testid='target'
          />
          <button tabIndex={0}>after</button>
        </>,
      )
      const targetElement = renderResult.getByTestId('target')
      await expectFocusRing(targetElement, false)
      expect(document.activeElement).not.toBe(targetElement)
      await focusElement(renderResult.getByText('before'))
      await act(() => userEvent.tab())
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      await expectFocusRing(targetElement, true)
      await act(() => userEvent.tab())
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(renderResult.getByText('after'))
      await expectFocusRing(targetElement, false)
      await act(() => userEvent.tab({ shift: true }))
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      await expectFocusRing(targetElement, true)
      act(() => targetElement.blur())
      await waitForFocusUpdates()
      await expectFocusRing(targetElement, false)
    },
  )

  it('recomputes the ring when re-entering with a different input modality', async () => {
    const renderResult = render(
      <>
        <FocusRingFixture>target</FocusRingFixture>
        <button>outside</button>
      </>,
    )
    const targetElement = renderResult.getByText('target')
    await clickAndFocus(targetElement)
    await expectFocusRing(targetElement, false)
    await act(() => userEvent.keyboard('a'))
    await waitForFocusUpdates()
    await expectFocusRing(targetElement, true)
    await clickAndFocus(renderResult.getByText('outside'))
    await expectFocusRing(targetElement, false)
    await focusElement(targetElement)
    await expectFocusRing(targetElement, false)
    await focusElement(renderResult.getByText('outside'))
    await act(() => userEvent.keyboard('{Shift}'))
    await focusElement(targetElement)
    await expectFocusRing(targetElement, true)
  })

  it.each(['{Shift}', '{Shift>}a{/Shift}'])(
    'shows a ring for keyboard interaction %s without refocusing',
    async (keySequence) => {
      const renderResult = render(<FocusRingFixture>target</FocusRingFixture>)
      const targetElement = renderResult.getByText('target')
      await clickAndFocus(targetElement)
      await expectFocusRing(targetElement, false)
      await act(() => userEvent.keyboard(keySequence))
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      await expectFocusRing(targetElement, true)
    },
  )

  it.each(['ctrlKey', 'altKey', 'metaKey'])(
    'ignores %s shortcuts without changing the ring or shared input modality',
    async (modifierFlag) => {
      const renderResult = render(
        <>
          <FocusRingFixture>target</FocusRingFixture>
          <FocusRingFixture>next</FocusRingFixture>
        </>,
      )
      const targetElement = renderResult.getByText('target')
      const nextElement = renderResult.getByText('next')
      await clickAndFocus(targetElement)
      fireEvent.keyDown(targetElement, { key: 'a', [modifierFlag]: true })
      await waitForFocusUpdates()
      await expectFocusRing(targetElement, false)
      await focusElement(nextElement)
      await expectFocusRing(nextElement, false)

      await focusElement(targetElement)
      await act(() => userEvent.keyboard('a'))
      await waitForFocusUpdates()
      await expectFocusRing(targetElement, true)
      fireEvent.keyDown(targetElement, { key: 'a', [modifierFlag]: true })
      await waitForFocusUpdates()
      await expectFocusRing(targetElement, true)
      await focusElement(nextElement)
      await expectFocusRing(nextElement, true)
    },
  )

  it.each(['keyboard', 'mouse'] as const)(
    'records %s modality even when a descendant stops event propagation',
    async (inputModality) => {
      const stopPropagation = vi.fn((event: React.SyntheticEvent) => {
        event.stopPropagation()
      })
      const renderResult = render(
        <>
          <div>
            <button onKeyDown={stopPropagation} onMouseDown={stopPropagation}>
              child
            </button>
          </div>
          <FocusRingFixture>next</FocusRingFixture>
        </>,
      )
      const childButton = renderResult.getByText('child')
      const nextElement = renderResult.getByText('next')
      if (inputModality === 'keyboard') setMouseModality()
      await focusElement(nextElement)
      await expectFocusRing(nextElement, inputModality === 'mouse')

      if (inputModality === 'keyboard') {
        await focusElement(childButton)
        await act(() => userEvent.keyboard('a'))
      } else {
        await act(() => userEvent.click(childButton))
      }
      expect(stopPropagation).toHaveBeenCalledOnce()
      await focusElement(nextElement)
      await expectFocusRing(nextElement, inputModality === 'keyboard')
    },
  )

  it.each(['target', 'icon'])(
    'preserves keyboard modality when clicking the focused element: %s',
    async (clickTargetTestId) => {
      const renderResult = render(
        <>
          <FocusRingFixture as='div' tabIndex={0} data-testid='target'>
            <span data-testid='icon'>icon</span>
          </FocusRingFixture>
          <FocusRingFixture>next</FocusRingFixture>
        </>,
      )
      const targetElement = renderResult.getByTestId('target')
      await focusElement(targetElement)
      await act(() =>
        userEvent.click(renderResult.getByTestId(clickTargetTestId)),
      )
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      await expectFocusRing(targetElement, true)
      await focusElement(renderResult.getByText('next'))
      await expectFocusRing(renderResult.getByText('next'), true)
    },
  )

  it('records an outside mouse interaction even when its default focus change is prevented', async () => {
    const renderResult = render(
      <>
        <FocusRingFixture>target</FocusRingFixture>
        <button onMouseDown={(event) => event.preventDefault()}>outside</button>
        <FocusRingFixture>next</FocusRingFixture>
      </>,
    )
    const targetElement = renderResult.getByText('target')
    await focusElement(targetElement)
    await act(() => userEvent.click(renderResult.getByText('outside')))
    await waitForFocusUpdates()
    expect(document.activeElement).toBe(targetElement)
    await expectFocusRing(targetElement, true)
    await focusElement(renderResult.getByText('next'))
    await expectFocusRing(renderResult.getByText('next'), false)
  })

  it('does not revive the old ring when Tab moves mouse focus to another instance', async () => {
    const renderResult = render(
      <>
        <FocusRingFixture tabIndex={0}>first</FocusRingFixture>
        <FocusRingFixture tabIndex={0}>second</FocusRingFixture>
      </>,
    )
    await clickAndFocus(renderResult.getByText('first'))
    await act(() => userEvent.tab())
    await waitForFocusUpdates()
    expect(document.activeElement).toBe(renderResult.getByText('second'))
    await expectFocusRing(renderResult.getByText('first'), false)
    await expectFocusRing(renderResult.getByText('second'), true)
  })
})

const controlCases: Array<{
  name: string
  props: FocusRingFixtureProps
  expectedMouseFocusVisible: boolean
}> = [
  ...[
    'text',
    'search',
    'url',
    'tel',
    'email',
    'password',
    'number',
    'date',
    'month',
    'week',
    'time',
    'datetime',
    'datetime-local',
  ].map((type) => ({
    name: `input ${type}`,
    props: { as: 'input' as const, type },
    expectedMouseFocusVisible: true,
  })),
  {
    name: 'textarea',
    props: { as: 'textarea' },
    expectedMouseFocusVisible: true,
  },
  {
    name: 'select',
    props: { as: 'select', children: <option>option</option> },
    expectedMouseFocusVisible: true,
  },
  {
    name: 'contentEditable',
    props: { as: 'div', contentEditable: true, tabIndex: 0 },
    expectedMouseFocusVisible: true,
  },
  {
    name: 'readonly input',
    props: { as: 'input', readOnly: true },
    expectedMouseFocusVisible: false,
  },
  {
    name: 'readonly textarea',
    props: { as: 'textarea', readOnly: true },
    expectedMouseFocusVisible: false,
  },
  ...[
    'checkbox',
    'radio',
    'range',
    'file',
    'button',
    'submit',
    'reset',
    'color',
  ].map((type) => ({
    name: `input ${type}`,
    props: { as: 'input' as const, type },
    expectedMouseFocusVisible: false,
  })),
]

describe('control semantics', () => {
  it.each(controlCases)(
    '$name uses its editing semantics for mouse focus and shows keyboard focus',
    async ({ props, expectedMouseFocusVisible }) => {
      const renderResult = render(
        <>
          <FocusRingFixture {...props} data-testid='target' />
          <button>outside</button>
        </>,
      )
      const targetElement = renderResult.getByTestId('target')
      // Focus following mouse input avoids opening native pickers/file dialogs.
      setMouseModality()
      await focusElement(targetElement)
      await expectFocusRing(targetElement, expectedMouseFocusVisible)
      await focusElement(renderResult.getByText('outside'))
      await expectFocusRing(targetElement, false)
      setKeyboardModality()
      await focusElement(targetElement)
      await expectFocusRing(targetElement, true)
      act(() => targetElement.blur())
      await waitForFocusUpdates()
      await expectFocusRing(targetElement, false)
    },
  )

  it('shows keyboard interaction on a mouse-focused readonly input', async () => {
    const renderResult = render(
      <FocusRingFixture as='input' readOnly data-testid='target' />,
    )
    const targetElement = renderResult.getByTestId('target')
    await clickAndFocus(targetElement)
    await expectFocusRing(targetElement, false)
    await act(() => userEvent.keyboard('a'))
    await waitForFocusUpdates()
    await expectFocusRing(targetElement, true)
  })

  it.each([true, false])(
    'respects inherited editing with contentEditable override %s',
    async (inheritsContentEditable) => {
      const renderResult = render(
        <div contentEditable suppressContentEditableWarning>
          <FocusRingFixture
            as='span'
            contentEditable={inheritsContentEditable ? undefined : false}
            tabIndex={0}
            data-testid='target'
          />
        </div>,
      )
      setMouseModality()
      const targetElement = renderResult.getByTestId('target')
      await focusElement(targetElement)
      await expectFocusRing(targetElement, inheritsContentEditable)
    },
  )

  it('uses updated control properties on the next focus', async () => {
    const renderResult = render(
      <FocusRingFixture as='input' data-testid='target' />,
    )
    const targetElement = renderResult.getByTestId('target')
    setMouseModality()
    await focusElement(targetElement)
    await expectFocusRing(targetElement, true)
    act(() => targetElement.blur())
    renderResult.rerender(
      <FocusRingFixture as='input' readOnly data-testid='target' />,
    )
    await focusElement(targetElement)
    await expectFocusRing(targetElement, false)
    act(() => targetElement.blur())
    renderResult.rerender(
      <FocusRingFixture as='input' type='checkbox' data-testid='target' />,
    )
    await focusElement(targetElement)
    await expectFocusRing(targetElement, false)
    act(() => targetElement.blur())
    renderResult.rerender(
      <FocusRingFixture as='input' type='text' data-testid='target' />,
    )
    await focusElement(targetElement)
    await expectFocusRing(targetElement, true)
  })
})

describe('nested focus', () => {
  it('tracks its own focus independently from focus and keys in descendants', async () => {
    const renderResult = render(
      <>
        <FocusRingFixture as='div' tabIndex={0} data-testid='parent'>
          <FocusRingFixture>child one</FocusRingFixture>
          <FocusRingFixture>child two</FocusRingFixture>
        </FocusRingFixture>
        <button>outside</button>
      </>,
    )
    const parentElement = renderResult.getByTestId('parent')
    const firstChildElement = renderResult.getByText('child one')
    const secondChildElement = renderResult.getByText('child two')
    await focusElement(firstChildElement)
    await expectFocusRing(parentElement, false)
    await expectFocusRing(firstChildElement, true)
    await act(() => userEvent.keyboard('a'))
    await waitForFocusUpdates()
    await expectFocusRing(parentElement, false)
    await focusElement(secondChildElement)
    await expectFocusRing(firstChildElement, false)
    await expectFocusRing(secondChildElement, true)
    await expectFocusRing(parentElement, false)
    await focusElement(parentElement)
    await expectFocusRing(parentElement, true)
    await expectFocusRing(secondChildElement, false)
    await focusElement(firstChildElement)
    await expectFocusRing(parentElement, false)
    await focusElement(renderResult.getByText('outside'))
    await expectFocusRing(firstChildElement, false)
    await expectFocusRing(parentElement, false)
  })
})

describe('autofocus and initial focus', () => {
  it.each([
    { as: 'button', isMouseModality: false, expectedFocusVisible: true },
    { as: 'button', isMouseModality: true, expectedFocusVisible: false },
    { as: 'input', isMouseModality: true, expectedFocusVisible: true },
    { as: 'div', isMouseModality: false, expectedFocusVisible: true },
    { as: 'div', isMouseModality: true, expectedFocusVisible: false },
  ] as const)(
    'autofocuses $as with mouse modality $isMouseModality',
    async ({ as, isMouseModality, expectedFocusVisible }) => {
      if (isMouseModality) setMouseModality()
      const renderResult = render(
        <FocusRingFixture
          as={as}
          tabIndex={0}
          autoFocus
          data-testid='target'
        />,
      )
      await waitForFocusUpdates()
      const targetElement = renderResult.getByTestId('target')
      expect(document.activeElement).toBe(targetElement)
      await expectFocusRing(targetElement, expectedFocusVisible)
    },
  )

  it('autofocuses a programmatically focusable element outside the tab order in StrictMode', async () => {
    const renderResult = render(
      <StrictMode>
        <FocusRingFixture
          as='div'
          tabIndex={-1}
          autoFocus
          data-testid='target'
        />
      </StrictMode>,
    )
    await waitForFocusUpdates()
    expect(document.activeElement).toBe(renderResult.getByTestId('target'))
    await expectFocusRing(renderResult.getByTestId('target'), true)
  })

  it.each([false, true])(
    'synchronizes focus acquired in a ref callback with mouse modality %s',
    async (isMouseModality) => {
      if (isMouseModality) setMouseModality()
      const renderResult = render(
        <FocusRingFixture
          ref={(node) => {
            node?.focus()
          }}
          data-testid='target'
        />,
      )
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(renderResult.getByTestId('target'))
      await expectFocusRing(
        renderResult.getByTestId('target'),
        !isMouseModality,
      )
    },
  )

  it.each([
    { name: 'disabled button', props: { disabled: true } },
    {
      name: 'hidden custom element',
      props: { as: 'div' as const, tabIndex: 0, hidden: true },
    },
    { name: 'non-focusable div', props: { as: 'div' as const } },
  ])('does not move existing focus to a $name', async ({ props }) => {
    const outsideRenderResult = render(<button>outside</button>)
    await focusElement(outsideRenderResult.getByText('outside'))
    const renderResult = render(
      <FocusRingFixture {...props} autoFocus data-testid='target' />,
    )
    await waitForFocusUpdates()
    expect(document.activeElement).toBe(
      outsideRenderResult.getByText('outside'),
    )
    await expectFocusRing(renderResult.getByTestId('target'), false)
  })

  it.each(['hide', 'move focus', 'unmount', 'replace'] as const)(
    'respects a parent layout effect that will %s before custom autofocus',
    async (action) => {
      const targetRef = createRef<HTMLElement>()
      const outsideRef = createRef<HTMLButtonElement>()
      function LayoutEffectFixture() {
        const [hasLayoutEffectRun, setHasLayoutEffectRun] = useState(false)
        useLayoutEffect(() => {
          if (action === 'hide') targetRef.current!.hidden = true
          if (action === 'move focus') outsideRef.current!.focus()
          setHasLayoutEffectRun(true)
        }, [])
        return (
          <>
            <button ref={outsideRef}>outside</button>
            {action === 'unmount' && hasLayoutEffectRun ? null : (
              <FocusRingFixture
                as='div'
                tabIndex={0}
                ref={targetRef}
                nodeKey={
                  action === 'replace' && hasLayoutEffectRun
                    ? 'replacement'
                    : 'initial'
                }
                autoFocus
                data-testid='target'
              />
            )}
          </>
        )
      }
      const renderResult = render(<LayoutEffectFixture />)
      await waitForFocusUpdates()
      if (action === 'move focus')
        expect(document.activeElement).toBe(renderResult.getByText('outside'))
      else
        expect(document.activeElement).not.toBe(
          renderResult.queryByTestId('target'),
        )
      const targetElement = renderResult.queryByTestId('target')
      if (targetElement) await expectFocusRing(targetElement, false)
    },
  )

  it('only autofocuses on mount, and a new instance can autofocus again', async () => {
    const renderResult = render(
      <>
        <FocusRingFixture
          as='div'
          tabIndex={0}
          autoFocus
          data-testid='target'
        />
        <button>outside</button>
      </>,
    )
    await waitForFocusUpdates()
    expect(document.activeElement).toBe(renderResult.getByTestId('target'))
    await focusElement(renderResult.getByText('outside'))
    renderResult.rerender(
      <>
        <FocusRingFixture
          as='div'
          tabIndex={0}
          autoFocus
          data-testid='target'
          title='updated'
        />
        <button>outside</button>
      </>,
    )
    await waitForFocusUpdates()
    expect(document.activeElement).toBe(renderResult.getByText('outside'))
    renderResult.rerender(
      <>
        <FocusRingFixture
          as='div'
          tabIndex={0}
          autoFocus
          data-testid='target'
          key='new instance'
        />
        <button>outside</button>
      </>,
    )
    await waitForFocusUpdates()
    expect(document.activeElement).toBe(renderResult.getByTestId('target'))
    await expectFocusRing(renderResult.getByTestId('target'), true)
  })

  it('does not autofocus merely because the prop becomes true after mount', async () => {
    const renderResult = render(
      <FocusRingFixture as='div' tabIndex={0} data-testid='target' />,
    )
    renderResult.rerender(
      <FocusRingFixture as='div' tabIndex={0} autoFocus data-testid='target' />,
    )
    await waitForFocusUpdates()
    expect(document.activeElement).not.toBe(renderResult.getByTestId('target'))
    await expectFocusRing(renderResult.getByTestId('target'), false)
  })

  it.each([false, true])(
    'handles native autofocus on a replaced DOM node with mouse modality %s',
    async (isMouseModality) => {
      const renderResult = render(
        <FocusRingFixture as='div' nodeKey='old' data-testid='target' />,
      )
      if (isMouseModality) setMouseModality()
      renderResult.rerender(
        <FocusRingFixture
          as='input'
          nodeKey='new'
          autoFocus
          readOnly
          data-testid='target'
        />,
      )
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(renderResult.getByTestId('target'))
      await expectFocusRing(
        renderResult.getByTestId('target'),
        !isMouseModality,
      )
    },
  )
})

describe('disabled state', () => {
  it.each(['button', 'div'] as const)(
    'clears the focus ring on a disabled %s and restores keyboard focus visibility after re-enabling',
    async (as) => {
      const renderResult = render(
        <>
          <FocusRingFixture as={as} tabIndex={0} data-testid='target' />
          <FocusRingFixture>other</FocusRingFixture>
        </>,
      )
      const targetElement = renderResult.getByTestId('target')
      await focusElement(targetElement)
      await expectFocusRing(targetElement, true)
      renderResult.rerender(
        <>
          <FocusRingFixture
            as={as}
            tabIndex={0}
            disabled
            data-testid='target'
          />
          <FocusRingFixture>other</FocusRingFixture>
        </>,
      )
      await waitForFocusUpdates()
      await expectFocusRing(targetElement, false)
      if (as === 'div') expect(document.activeElement).toBe(targetElement)
      await focusElement(renderResult.getByText('other'))
      await expectFocusRing(renderResult.getByText('other'), true)
      if (as === 'div') {
        await focusElement(targetElement)
        await act(() => userEvent.keyboard('a'))
        await waitForFocusUpdates()
        await expectFocusRing(targetElement, false)
      }
      renderResult.rerender(
        <>
          <FocusRingFixture as={as} tabIndex={0} data-testid='target' />
          <FocusRingFixture>other</FocusRingFixture>
        </>,
      )
      await focusElement(renderResult.getByText('other'))
      await focusElement(targetElement)
      await expectFocusRing(targetElement, true)
      await clickAndFocus(renderResult.getByText('other'))
      await focusElement(targetElement)
      await expectFocusRing(targetElement, false)
    },
  )

  it.each([false, true])(
    'does not retain a pending keyboard ring when disabled (mouse focus: %s)',
    async (isMouseModality) => {
      function DisableOnInteractionFixture() {
        const [disabled, setDisabled] = useState(false)
        return (
          <FocusRingFixture
            as='div'
            tabIndex={0}
            disabled={disabled}
            onFocus={isMouseModality ? undefined : () => setDisabled(true)}
            onKeyDown={() => setDisabled(true)}
            data-testid='target'
          >
            target
          </FocusRingFixture>
        )
      }
      const renderResult = render(<DisableOnInteractionFixture />)
      const targetElement = renderResult.getByTestId('target')
      if (isMouseModality) {
        await clickAndFocus(targetElement)
        await act(() => userEvent.keyboard('a'))
      } else act(() => targetElement.focus())
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      await expectFocusRing(targetElement, false)
    },
  )
})

describe('consumer handlers and rapid focus changes', () => {
  it('calls current consumer handlers and lets blur clear the ring even when prevented', async () => {
    const initialFocusCaptureHandler = vi.fn()
    const updatedFocusCaptureHandler = vi.fn()
    const initialKeyDownCaptureHandler = vi.fn()
    const updatedKeyDownCaptureHandler = vi.fn()
    const initialBlurHandler = vi.fn()
    const updatedBlurHandler = vi.fn((event: React.FocusEvent) =>
      event.preventDefault(),
    )
    const renderResult = render(
      <FocusRingFixture
        onFocusCapture={initialFocusCaptureHandler}
        onKeyDownCapture={initialKeyDownCaptureHandler}
        onBlur={initialBlurHandler}
      >
        target
      </FocusRingFixture>,
    )
    const targetElement = renderResult.getByText('target')
    renderResult.rerender(
      <FocusRingFixture
        onFocusCapture={updatedFocusCaptureHandler}
        onKeyDownCapture={updatedKeyDownCaptureHandler}
        onBlur={updatedBlurHandler}
      >
        target
      </FocusRingFixture>,
    )
    await focusElement(targetElement)
    await act(() => userEvent.keyboard('a'))
    act(() => targetElement.blur())
    await waitForFocusUpdates()
    expect(initialFocusCaptureHandler).not.toHaveBeenCalled()
    expect(initialKeyDownCaptureHandler).not.toHaveBeenCalled()
    expect(initialBlurHandler).not.toHaveBeenCalled()
    expect(updatedFocusCaptureHandler).toHaveBeenCalledOnce()
    expect(updatedKeyDownCaptureHandler).toHaveBeenCalledOnce()
    expect(updatedBlurHandler).toHaveBeenCalledOnce()
    expect(updatedFocusCaptureHandler.mock.calls[0][0].target).toBe(
      targetElement,
    )
    await expectFocusRing(targetElement, false)
  })

  it('allows a focus capture handler to suppress the ring', async () => {
    const renderResult = render(
      <FocusRingFixture onFocusCapture={(event) => event.preventDefault()}>
        target
      </FocusRingFixture>,
    )
    const targetElement = renderResult.getByText('target')
    await focusElement(targetElement)
    await expectFocusRing(targetElement, false)
  })

  it('allows a key capture handler to suppress this update without undoing document modality', async () => {
    const renderResult = render(
      <>
        <FocusRingFixture onKeyDownCapture={(event) => event.preventDefault()}>
          target
        </FocusRingFixture>
        <FocusRingFixture>next</FocusRingFixture>
      </>,
    )
    const targetElement = renderResult.getByText('target')
    await clickAndFocus(targetElement)
    await act(() => userEvent.keyboard('a'))
    await waitForFocusUpdates()
    await expectFocusRing(targetElement, false)
    await focusElement(renderResult.getByText('next'))
    await expectFocusRing(renderResult.getByText('next'), true)
  })

  it.each(['focus capture', 'key capture', 'key bubble'] as const)(
    'does not restore a ring after a consumer moves focus in %s',
    async (handlerPhase) => {
      const nextElementRef = createRef<HTMLElement>()
      const moveFocusToNextElement = () => nextElementRef.current!.focus()
      const renderResult = render(
        <>
          <FocusRingFixture
            onFocusCapture={
              handlerPhase === 'focus capture'
                ? moveFocusToNextElement
                : undefined
            }
            onKeyDownCapture={
              handlerPhase === 'key capture'
                ? moveFocusToNextElement
                : undefined
            }
            onKeyDown={
              handlerPhase === 'key bubble' ? moveFocusToNextElement : undefined
            }
          >
            target
          </FocusRingFixture>
          <FocusRingFixture ref={nextElementRef}>next</FocusRingFixture>
        </>,
      )
      const targetElement = renderResult.getByText('target')
      if (handlerPhase === 'focus capture') act(() => targetElement.focus())
      else {
        await clickAndFocus(targetElement)
        await act(() => userEvent.keyboard('aa'))
      }
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(nextElementRef.current)
      await expectFocusRing(targetElement, false)
      await expectFocusRing(nextElementRef.current!, true)
    },
  )

  it.each(['blur', 'focus another', 'unmount'] as const)(
    'does not leave a stale ring after immediate %s',
    async (action) => {
      const renderResult = render(
        <>
          <FocusRingFixture tabIndex={0}>first</FocusRingFixture>
          <FocusRingFixture tabIndex={0}>second</FocusRingFixture>
        </>,
      )
      const firstElement = renderResult.getByText('first')
      const secondElement = renderResult.getByText('second')
      act(() => {
        firstElement.focus()
        if (action === 'blur') firstElement.blur()
        if (action === 'focus another') secondElement.focus()
        if (action === 'unmount') renderResult.unmount()
      })
      await waitForFocusUpdates()
      if (action === 'unmount') {
        const remountResult = render(
          <FocusRingFixture>new instance</FocusRingFixture>,
        )
        await waitForFocusUpdates()
        await expectFocusRing(remountResult.getByText('new instance'), false)
        expect(document.activeElement).not.toBe(firstElement)
      } else {
        await expectFocusRing(firstElement, false)
        await expectFocusRing(secondElement, action === 'focus another')
        expect(document.activeElement).toBe(
          action === 'blur' ? document.body : secondElement,
        )
      }
    },
  )

  it('survives unmounting from a key handler while a ring update is pending', async () => {
    function UnmountOnKeyDownFixture() {
      const [isOriginalMounted, setIsOriginalMounted] = useState(true)
      return isOriginalMounted ? (
        <FocusRingFixture onKeyDown={() => setIsOriginalMounted(false)}>
          target
        </FocusRingFixture>
      ) : (
        <FocusRingFixture key='replacement'>replacement</FocusRingFixture>
      )
    }
    const renderResult = render(<UnmountOnKeyDownFixture />)
    await clickAndFocus(renderResult.getByText('target'))
    await act(() => userEvent.keyboard('a'))
    await waitForFocusUpdates()
    const replacementElement = renderResult.getByText('replacement')
    await expectFocusRing(replacementElement, false)
    expect(document.activeElement).not.toBe(replacementElement)
  })
})

describe('document and instance lifetime', () => {
  it('shares input modality with later mounts, remounts and same-document portals', async () => {
    const initialRenderResult = render(
      <FocusRingFixture>first</FocusRingFixture>,
    )
    await clickAndFocus(initialRenderResult.getByText('first'))
    initialRenderResult.unmount()
    const renderResult = render(<FocusRingFixture>second</FocusRingFixture>)
    await focusElement(renderResult.getByText('second'))
    await expectFocusRing(renderResult.getByText('second'), false)
    const portalContainer = document.createElement('div')
    document.body.append(portalContainer)
    try {
      renderResult.rerender(
        <>
          <FocusRingFixture>second</FocusRingFixture>
          {createPortal(
            <FocusRingFixture>portal</FocusRingFixture>,
            portalContainer,
          )}
        </>,
      )
      await focusElement(renderResult.getByText('portal'))
      await expectFocusRing(renderResult.getByText('portal'), false)
      await act(() => userEvent.keyboard('a'))
      await waitForFocusUpdates()
      await expectFocusRing(renderResult.getByText('portal'), true)
      await focusElement(renderResult.getByText('second'))
      await expectFocusRing(renderResult.getByText('second'), true)
      await expectFocusRing(renderResult.getByText('portal'), false)
    } finally {
      renderResult.unmount()
      portalContainer.remove()
    }
  })

  it('defaults a fresh iframe to keyboard modality and isolates its focus and input from the parent', async () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    const iframeDocument = iframe.contentDocument!
    const renderResult = render(
      <>
        <FocusRingFixture>parent</FocusRingFixture>
        {createPortal(
          <FocusRingFixture>frame</FocusRingFixture>,
          iframeDocument.body,
        )}
      </>,
    )
    const parentDocumentButton = renderResult.getByText('parent')
    const iframeButton = iframeDocument.querySelector('button')!
    try {
      setMouseModality()
      await focusElement(parentDocumentButton)
      await expectFocusRing(parentDocumentButton, false)
      await focusElement(iframeButton)
      await expectFocusRing(iframeButton, true)
      setMouseModality(iframeDocument)
      act(() => iframeButton.blur())
      await focusElement(iframeButton)
      await expectFocusRing(iframeButton, false)
      setKeyboardModality()
      await focusElement(parentDocumentButton)
      await expectFocusRing(parentDocumentButton, true)
      await focusElement(iframeButton)
      await expectFocusRing(iframeButton, false)
      setKeyboardModality(iframeDocument)
      act(() => iframeButton.blur())
      await focusElement(iframeButton)
      await expectFocusRing(iframeButton, true)
      renderResult.rerender(
        <>
          {createPortal(
            <FocusRingFixture as='div' tabIndex={0} autoFocus key='autofocus'>
              auto
            </FocusRingFixture>,
            iframeDocument.body,
          )}
        </>,
      )
      await waitForFocusUpdates()
      const autofocusElement = iframeDocument.querySelector('div')!
      expect(iframeDocument.activeElement).toBe(autofocusElement)
      await expectFocusRing(autofocusElement, true)
    } finally {
      renderResult.unmount()
      iframe.remove()
    }
  })
})

describe('Button integration', () => {
  it.each([true, false])(
    'shows keyboard focus on a focusable disabled Button without activating it (native: %s)',
    async (nativeButton) => {
      const onClick = vi.fn()
      const renderResult = render(
        <>
          <button tabIndex={0}>before</button>
          <Button
            nativeButton={nativeButton}
            render={nativeButton ? undefined : <div />}
            disabled
            focusableWhenDisabled
            tabIndex={0}
            onClick={onClick}
          >
            target
          </Button>
          <button tabIndex={0}>after</button>
        </>,
      )
      const targetElement = renderResult.getByText('target')
      await focusElement(renderResult.getByText('before'))
      await act(() => userEvent.tab())
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(true)
      expect(targetElement.hasAttribute('disabled')).toBe(false)
      expect(targetElement.getAttribute('aria-disabled')).toBe('true')
      await act(() => userEvent.keyboard('{Enter} '))
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(true)
      expect(onClick).not.toHaveBeenCalled()
      await act(() => userEvent.tab())
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(renderResult.getByText('after'))
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(false)
      await act(() => userEvent.tab({ shift: true }))
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(true)

      await clickAndFocus(renderResult.getByText('before'))
      await focusElement(targetElement)
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(false)
      await act(() => userEvent.keyboard('a'))
      await waitForFocusUpdates()
      expect(document.activeElement).toBe(targetElement)
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(true)
      expect(onClick).not.toHaveBeenCalled()
    },
  )

  it.each([
    { nativeButton: true, disabled: false, focusableWhenDisabled: false },
    { nativeButton: true, disabled: true, focusableWhenDisabled: false },
    { nativeButton: true, disabled: true, focusableWhenDisabled: true },
    { nativeButton: false, disabled: false, focusableWhenDisabled: false },
    { nativeButton: false, disabled: true, focusableWhenDisabled: false },
    { nativeButton: false, disabled: true, focusableWhenDisabled: true },
  ])(
    'respects autofocus with native=$nativeButton disabled=$disabled focusableWhenDisabled=$focusableWhenDisabled',
    async ({ nativeButton, disabled, focusableWhenDisabled }) => {
      const renderResult = render(
        <Button
          nativeButton={nativeButton}
          render={nativeButton ? undefined : <div />}
          disabled={disabled}
          focusableWhenDisabled={focusableWhenDisabled}
          autoFocus
        >
          target
        </Button>,
      )
      await waitForFocusUpdates()
      const targetElement = renderResult.getByText('target')
      const expectedAutoFocus = !disabled || focusableWhenDisabled
      expect(document.activeElement === targetElement).toBe(expectedAutoFocus)
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(
        expectedAutoFocus,
      )
    },
  )

  it.each([
    { nativeButton: true, focusableWhenDisabled: false },
    { nativeButton: false, focusableWhenDisabled: false },
    { nativeButton: true, focusableWhenDisabled: true },
    { nativeButton: false, focusableWhenDisabled: true },
  ])(
    'updates the ring when a Button becomes disabled (native=$nativeButton, focusableWhenDisabled=$focusableWhenDisabled)',
    async ({ nativeButton, focusableWhenDisabled }) => {
      const renderResult = render(
        <Button
          nativeButton={nativeButton}
          render={nativeButton ? undefined : <div />}
          focusableWhenDisabled={focusableWhenDisabled}
        >
          target
        </Button>,
      )
      const targetElement = renderResult.getByText('target')
      await focusElement(targetElement)
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(true)
      renderResult.rerender(
        <Button
          nativeButton={nativeButton}
          render={nativeButton ? undefined : <div />}
          focusableWhenDisabled={focusableWhenDisabled}
          disabled
        >
          target
        </Button>,
      )
      await waitForFocusUpdates()
      expect(targetElement.hasAttribute('data-focus-visible')).toBe(
        focusableWhenDisabled,
      )
      expect(targetElement.hasAttribute('disabled')).toBe(
        nativeButton && !focusableWhenDisabled,
      )
      if (focusableWhenDisabled)
        expect(document.activeElement).toBe(targetElement)
    },
  )
})

describe('DOM replacement', () => {
  it('clears the ring when the mounted hook loses its DOM node and does not restore stale state when the node returns', async () => {
    function ConditionalElementFixture({
      showElement,
    }: {
      showElement: boolean
    }) {
      const focusRingMetadata = useFocusRing({})
      return (
        <>
          <output
            data-testid='focus-state'
            data-focus-visible={
              getMetadataState(focusRingMetadata).focusVisible
            }
          />
          {showElement && (
            <button {...getMetadataProps(focusRingMetadata)}>target</button>
          )}
        </>
      )
    }
    const renderResult = render(<ConditionalElementFixture showElement />)
    const focusStateElement = renderResult.getByTestId('focus-state')
    const previousElement = renderResult.getByRole('button')
    await focusElement(previousElement)
    await expectFocusRing(focusStateElement, true)

    renderResult.rerender(<ConditionalElementFixture showElement={false} />)
    await waitForFocusUpdates()
    expect(renderResult.queryByRole('button')).toBeNull()
    expect(document.activeElement).not.toBe(previousElement)
    await expectFocusRing(focusStateElement, false)

    renderResult.rerender(<ConditionalElementFixture showElement />)
    await waitForFocusUpdates()
    const replacementElement = renderResult.getByRole('button')
    expect(replacementElement).not.toBe(previousElement)
    expect(document.activeElement).not.toBe(replacementElement)
    await expectFocusRing(focusStateElement, false)
    await focusElement(replacementElement)
    await expectFocusRing(focusStateElement, true)
  })

  it('clears the Button ring when its render element is replaced', async () => {
    const renderResult = render(
      <Button render={<button key='old' />}>target</Button>,
    )
    const previousElement = renderResult.getByText('target')
    await focusElement(previousElement)
    expect(previousElement.hasAttribute('data-focus-visible')).toBe(true)

    renderResult.rerender(<Button render={<button key='new' />}>target</Button>)
    await waitForFocusUpdates()
    const targetElement = renderResult.getByText('target')
    expect(targetElement).not.toBe(previousElement)
    expect(document.activeElement).not.toBe(targetElement)
    expect(targetElement.hasAttribute('data-focus-visible')).toBe(false)

    await focusElement(targetElement)
    expect(targetElement.hasAttribute('data-focus-visible')).toBe(true)
  })

  it('does not transfer the old focus ring to an unfocused replacement node', async () => {
    const renderResult = render(
      <FocusRingFixture nodeKey='old'>target</FocusRingFixture>,
    )
    await focusElement(renderResult.getByText('target'))
    await expectFocusRing(renderResult.getByText('target'), true)
    renderResult.rerender(
      <FocusRingFixture nodeKey='new'>target</FocusRingFixture>,
    )
    await waitForFocusUpdates()
    const targetElement = renderResult.getByText('target')
    expect(document.activeElement).not.toBe(targetElement)
    await expectFocusRing(targetElement, false)
  })
})
