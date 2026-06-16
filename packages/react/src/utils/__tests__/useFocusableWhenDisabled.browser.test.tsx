import { focus } from '#test'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { getMetadataProps } from '../metadata'
import { useFocusableWhenDisabled } from '../useFocusableWhenDisabled'

function TestButton(inProps: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const props = getMetadataProps(
    useFocusableWhenDisabled({
      focusableWhenDisabled: true,
      ...inProps,
    }),
  )

  return (
    <button {...props} type='button'>
      target
    </button>
  )
}

describe('useFocusableWhenDisabled', () => {
  it('allows Tab when disabled but focusable', async () => {
    const screen = await render(<TestButton disabled />)
    const button = screen.getByRole('button')

    await userEvent.tab()

    await expect.element(button).toHaveFocus()

    await userEvent.tab()

    await expect.element(button).not.toHaveFocus()
  })

  it('prevents keyDown event', async () => {
    const onKeyDown = vi.fn()
    const screen = await render(<TestButton onKeyDown={onKeyDown} />)
    const button = screen.getByRole('button')

    await focus(button)
    await expect.element(button).toHaveFocus()

    await userEvent.tab()

    expect(onKeyDown).toHaveBeenCalledOnce()

    await screen.rerender(<TestButton onKeyDown={onKeyDown} disabled />)

    await focus(button)
    await expect.element(button).toHaveFocus()

    await userEvent.tab()

    expect(onKeyDown).toHaveBeenCalledOnce()
  })
})
