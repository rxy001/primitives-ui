import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { getMetadataProps, getMetadataState } from '../metadata'
import { useFocusRing } from '../useFocusRing'

function TestButton(props: { autoFocus?: boolean; disabled?: boolean }) {
  const focusRingProps = useFocusRing({
    autoFocus: props.autoFocus,
    disabled: props.disabled,
  })
  const { focusVisible } = getMetadataState(focusRingProps)

  return (
    <button
      {...getMetadataProps(focusRingProps)}
      disabled={props.disabled}
      type='button'
    >
      {focusVisible ? 'visible' : 'hidden'}
    </button>
  )
}

function TestInput() {
  const props = useFocusRing({})
  const { focusVisible } = getMetadataState(props)

  return (
    <label>
      Name
      <input {...getMetadataProps(props)} aria-label='name' />
      <span>{focusVisible ? 'visible' : 'hidden'}</span>
    </label>
  )
}

describe('useFocusRing', () => {
  it('sets focusVisible when a button receives keyboard focus', async () => {
    const screen = await render(<TestButton />)
    const button = screen.getByRole('button')

    await userEvent.tab()

    await expect.element(button).toHaveFocus()
    await expect.element(button).toHaveTextContent('visible')
  })

  it('does not set focusVisible when a button receives mouse focus', async () => {
    const screen = await render(<TestButton />)
    const button = screen.getByRole('button')

    await userEvent.click(button)

    await expect.element(button).toHaveFocus()
    await expect.element(button).toHaveTextContent('hidden')
  })

  it('keeps focusVisible for text inputs even when focused by mouse', async () => {
    const screen = await render(<TestInput />)
    const input = screen.getByLabelText('name')

    await userEvent.click(input)

    await expect.element(screen.getByText('visible')).toBeVisible()
  })

  it('sets focusVisible when a mouse-focused element receives keyboard input', async () => {
    const screen = await render(<TestButton />)
    const button = screen.getByRole('button')

    await userEvent.click(button)

    await expect.element(button).toHaveTextContent('hidden')

    await userEvent.keyboard(' ')

    await expect.element(button).toHaveTextContent('visible')
  })

  it('clears focusVisible when the focused element becomes disabled', async () => {
    const screen = await render(<TestButton />)

    await userEvent.tab()

    await expect.element(screen.getByText('visible')).toBeVisible()

    await screen.rerender(<TestButton disabled />)

    await expect.element(screen.getByText('hidden')).toBeVisible()
  })

  it('clears focusVisible when the focused element blurs.', async () => {
    const screen = await render(<TestButton />)

    await userEvent.tab()

    await expect.element(screen.getByText('visible')).toBeVisible()

    await userEvent.tab()

    await expect.element(screen.getByText('hidden')).toBeVisible()
  })

  it('focuses autoFocus elements and reports their focus ring state', async () => {
    const reset = await render(<TestButton />)

    await userEvent.tab()
    await reset.unmount()

    // oxlint-disable-next-line jsx-a11y/no-autofocus
    const screen = await render(<TestButton autoFocus />)
    const button = screen.container.querySelector('button')!

    await expect
      .element(screen.getByRole('button'))
      .toHaveTextContent('visible')
    expect(document.activeElement).toBe(button)
  })
})
