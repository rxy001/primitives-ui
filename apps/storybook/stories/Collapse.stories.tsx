import type { Meta } from '@storybook/react-vite'
import { Collapsible } from '@primitives-ui/react'

const meta = {
  title: 'Components/Collapsible',
} satisfies Meta

export default meta

export function Default() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger>Trigger</Collapsible.Trigger>
      <Collapsible.Panel keepMounted>Test</Collapsible.Panel>
    </Collapsible.Root>
  )
}
