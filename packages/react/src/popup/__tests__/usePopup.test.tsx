import type { ReactNode } from 'react'
import { act, render } from '@testing-library/react'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createPrimitive } from '../../utils'
import { usePopup } from '../usePopup'

interface TestPopupProps {
  children?: ReactNode
  enabled: boolean
  modal: boolean
}

function TestPopup({ children, enabled, modal }: TestPopupProps) {
  const props = usePopup({
    enabled,
    initialFocus: false,
    modal,
    returnFocus: false,
    children,
    'data-testid': 'popup',
  })

  return createPrimitive('div', props)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('usePopup', () => {
  it.each([
    ['modal to non-modal', true, false],
    ['non-modal to modal', false, true],
  ])('warns when changing from %s while enabled', (_name, initial, next) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(<TestPopup enabled modal={initial} />)

    rerender(<TestPopup enabled modal={next} />)

    expect(consoleError).toHaveBeenCalledWith(
      'Warning: The `modal` option passed to usePopup changed while the popup was enabled. ' +
        'Changing `modal` while enabled is not supported. Disable the popup before changing this option.',
    )
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('does not warn when modal changes between enabled sessions', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(<TestPopup enabled modal />)

    rerender(<TestPopup enabled={false} modal={false} />)
    rerender(<TestPopup enabled modal={false} />)

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('does not warn when modal remains stable', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(<TestPopup enabled modal />)

    rerender(<TestPopup enabled modal />)
    rerender(<TestPopup enabled modal />)

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('does not warn when modal changes while disabled', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(<TestPopup enabled={false} modal />)

    rerender(<TestPopup enabled={false} modal={false} />)

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('does not duplicate a warning in StrictMode', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(
      <StrictMode>
        <TestPopup enabled modal />
      </StrictMode>,
    )

    rerender(
      <StrictMode>
        <TestPopup enabled modal={false} />
      </StrictMode>,
    )

    expect(consoleError).toHaveBeenCalledOnce()
  })
})

describe('usePopup rendering environments', () => {
  it('renders on the server without accessing a live Popup element', () => {
    const markup = renderToString(
      <TestPopup enabled modal>
        <button>Inside</button>
      </TestPopup>,
    )

    expect(markup).toContain('data-primitives-ui-focus-guard')
    expect(markup).toContain('data-testid="popup"')
    expect(markup).not.toContain('data-primitives-ui-anchor-host')
  })

  it('hydrates without duplicating focus guards', async () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(<TestPopup enabled modal />)
    document.body.append(container)

    const root = hydrateRoot(container, <TestPopup enabled modal />)
    await act(async () => {
      await Promise.resolve()
    })

    expect(
      container.querySelectorAll('[data-primitives-ui-focus-guard]'),
    ).toHaveLength(2)

    await act(async () => root.unmount())
    container.remove()
  })
})
