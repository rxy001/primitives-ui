import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@primitives-ui/react'

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
    className: 'bg-blue-500 text-white px-4 py-2 rounded',
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
