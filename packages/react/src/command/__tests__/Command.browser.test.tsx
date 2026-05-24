import { focus } from '#test'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import type { CommandProps } from '../Command'
import { Command } from '../Command'

async function renderTestCommand(props?: CommandProps) {
  const screen = await render(
    <Command data-testid='command' {...props}>
      Command
    </Command>,
  )

  const command = screen.getByTestId('command')

  return {
    command,
    screen,
    rerender: (rerenderProps: CommandProps) =>
      screen.rerender(
        <Command data-testid='command' {...rerenderProps}>
          Command
        </Command>,
      ),
  }
}

describe('Command', () => {
  describe('keyboard interactions', () => {
    it('triggers click event when pressing Enter on non-native button', async () => {
      const onClick = vi.fn()
      const onKeyDown = vi.fn()
      const { command } = await renderTestCommand({
        onClick,
        onKeyDown,
      })

      await focus(command)
      await expect.element(command).toHaveFocus()

      await userEvent.keyboard('{Enter>5/}')

      expect(onKeyDown).toHaveBeenCalledTimes(5)
      expect(onClick).toHaveBeenCalledTimes(5)
    })

    it('triggers click when pressing and releasing Space on non-native button', async () => {
      const onClick = vi.fn()
      const onKeyDown = vi.fn()
      const onKeyUp = vi.fn()
      const { command } = await renderTestCommand({
        onClick,
        onKeyDown,
        onKeyUp,
      })

      await focus(command)
      await expect.element(command).toHaveFocus()

      await userEvent.keyboard('{ >}')

      expect(onKeyDown).toHaveBeenCalledTimes(1)

      await userEvent.keyboard('{/ }')

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onKeyUp).toHaveBeenCalledTimes(1)
    })

    it('does not trigger click when configured keyboard activation is disabled', async () => {
      const onClick = vi.fn()
      const { command, rerender } = await renderTestCommand({
        onClick,
        clickOnEnter: false,
        clickOnSpace: false,
      })

      await focus(command)
      await expect.element(command).toHaveFocus()

      await userEvent.keyboard('{Enter}')

      expect(onClick).not.toHaveBeenCalled()

      await userEvent.keyboard('{ }')

      expect(onClick).not.toHaveBeenCalled()

      await rerender({
        onClick,
        clickOnEnter: false,
        clickOnSpace: false,
        render: <button />,
      })

      await userEvent.tab()
      await expect.element(command).toHaveFocus()

      await userEvent.keyboard('{Enter}')

      expect(onClick).not.toHaveBeenCalled()

      await userEvent.keyboard('{ }')

      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not trigger click when preventDefault is called on Space keyUp', async () => {
      const onClick = vi.fn()
      const { command } = await renderTestCommand({
        onClick,
        onKeyUp: (event) => event.preventDefault(),
      })

      await focus(command)
      await expect.element(command).toHaveFocus()

      await userEvent.keyboard('{ }')

      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not trigger click when preventDefault is called on keyDown', async () => {
      const onClick = vi.fn()
      const { command } = await renderTestCommand({
        onClick,
        onKeyDown: (event) => event.preventDefault(),
      })

      await focus(command)
      await expect.element(command).toHaveFocus()

      await userEvent.keyboard('{ }')

      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not activate from child or modified keyboard events', async () => {
      const onClick = vi.fn()
      const { screen } = await renderTestCommand({
        onClick,
        render: (props) => (
          <div {...props}>
            <input data-testid='input' />
          </div>
        ),
      })
      const input = screen.getByTestId('input')

      await focus(input)
      await expect.element(input).toHaveFocus()

      await userEvent.keyboard('{Enter}')

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('focus visible', () => {
    it('sets focusVisible when it receives keyboard focus', async () => {
      const screen = await render(<Command data-testid='command' />)
      const command = screen.getByTestId('command')

      await userEvent.tab()

      await expect.element(command).toHaveFocus()
      await expect.element(command).toHaveAttribute('data-focus-visible')
    })

    it('does not set focusVisible when a button receives mouse focus', async () => {
      const { command } = await renderTestCommand()

      await userEvent.click(command)

      await expect.element(command).toHaveFocus()
      await expect.element(command).not.toHaveAttribute('data-focus-visible')
    })

    it('sets focusVisible when a mouse-focused element receives keyboard input', async () => {
      const { command } = await renderTestCommand()

      await userEvent.click(command)

      await expect.element(command).not.toHaveAttribute('data-focus-visible')

      await userEvent.keyboard(' ')

      await expect.element(command).toHaveAttribute('data-focus-visible')
    })
  })

  describe('prop: focusableWhenDisabled', () => {
    it('allows disabled element to be focused', async () => {
      const { command } = await renderTestCommand({
        disabled: true,
        focusableWhenDisabled: true,
      })

      await focus(command)
      await expect.element(command).toHaveFocus()
    })
  })

  describe('event handlers', () => {
    it('prevents interactions except focus and blur', async () => {
      const onClick = vi.fn()
      const onKeyDown = vi.fn()
      const onKeyUp = vi.fn()
      const onFocus = vi.fn()
      const onBlur = vi.fn()

      const { command } = await renderTestCommand({
        onClick,
        onKeyDown,
        onFocus,
        onBlur,
        onKeyUp,
        disabled: true,
        focusableWhenDisabled: true,
      })

      await expect.element(command).not.toHaveFocus()

      await userEvent.tab()
      await expect.element(command).toHaveFocus()
      expect(onFocus).toHaveBeenCalledOnce()

      await userEvent.keyboard('{ }')
      expect(onKeyDown).not.toHaveBeenCalled()
      expect(onKeyUp).not.toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()

      await userEvent.keyboard('{Enter}')
      expect(onKeyDown).not.toHaveBeenCalled()
      expect(onKeyUp).not.toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()

      await command.click()
      expect(onClick).not.toHaveBeenCalled()

      await userEvent.tab()
      expect(onBlur).toHaveBeenCalledOnce()
    })
  })

  describe('focus: disabled', () => {
    it('prevents tab navigation for disabled non-tabbable elements', async () => {
      const { command } = await renderTestCommand({ disabled: true })

      await userEvent.tab()

      await expect.element(command).not.toHaveFocus()
      await expect.element(command).toHaveAttribute('aria-disabled', 'true')
      await expect.element(command).not.toHaveAttribute('tabIndex')
    })

    it('prevents tab navigation for disabled tabbable button', async () => {
      const { command } = await renderTestCommand({
        disabled: true,
        render: <button />,
      })

      await userEvent.tab()

      await expect.element(command).not.toHaveFocus()
      await expect.element(command).toBeDisabled()
      await expect.element(command).not.toHaveAttribute('tabIndex')
    })
  })
})
