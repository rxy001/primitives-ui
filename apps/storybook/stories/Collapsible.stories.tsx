import type { Meta } from '@storybook/react-vite'
import { Collapsible } from '@primitives-ui/react'
import { collapsibleClassNames } from './styles'

const meta = {
  title: 'Components/Collapsible',
} satisfies Meta

export default meta

export function Default() {
  return (
    <Collapsible.Root className={collapsibleClassNames.root}>
      <Collapsible.Trigger className={collapsibleClassNames.trigger}>
        Trigger
      </Collapsible.Trigger>
      <Collapsible.Panel className={collapsibleClassNames.panel}>
        Test
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}
