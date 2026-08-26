import type { AccordionRootProps } from '@primitives-ui/react'
import type { Meta } from '@storybook/react-vite'
import { Accordion } from '@primitives-ui/react'
import { accordionClassNames } from './styles'

const meta = {
  title: 'Components/Accordion',
} satisfies Meta

export default meta

function AccordionTemplate(props: AccordionRootProps) {
  return (
    <Accordion.Root {...props} className={accordionClassNames.root}>
      <Accordion.Item className={accordionClassNames.item}>
        <Accordion.Header className={accordionClassNames.header}>
          <Accordion.Trigger className={accordionClassNames.trigger}>
            Trigger-1
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className={accordionClassNames.panel}>
          Panel-1
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item className={accordionClassNames.item}>
        <Accordion.Header className={accordionClassNames.header}>
          <Accordion.Trigger className={accordionClassNames.trigger}>
            Trigger-2
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className={accordionClassNames.panel}>
          Panel-2
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item className={accordionClassNames.item}>
        <Accordion.Header className={accordionClassNames.header}>
          <Accordion.Trigger className={accordionClassNames.trigger}>
            Trigger-3
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className={accordionClassNames.panel}>
          Panel-3
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

export function Default() {
  return <AccordionTemplate />
}

export function KeepMounted() {
  return <AccordionTemplate keepMounted />
}

export function Multiple() {
  return <AccordionTemplate multiple />
}
