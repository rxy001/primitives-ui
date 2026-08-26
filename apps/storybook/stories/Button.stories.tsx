import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@primitives-ui/react'
import { primaryButtonClassName } from './styles'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    focusableWhenDisabled: {
      control: 'boolean',
    },
  },
  args: {
    className: primaryButtonClassName,
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Native Button',
    onClick: () => alert('Button clicked!'),
  },
}

export const LinkButton: Story = {
  args: {
    children: 'Link Button',
    nativeButton: false,
    render: (props) => (
      <a href='https://google.com' target='_blank' {...props}>
        Link Button
      </a>
    ),
  },
  argTypes: {
    nativeButton: {
      control: {
        disable: true,
      },
    },
  },
}

export const NonInteractive: Story = {
  args: {
    children: 'Non-Interactive',
    render: <div />,
    // oxlint-disable-next-line no-console
    onClick: () => console.log('Button clicked!'),
  },
}
