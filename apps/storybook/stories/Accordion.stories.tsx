import type { AccordionRootProps } from '@primitives-ui/react'
import type { Meta } from '@storybook/react-vite'
import { Accordion } from '@primitives-ui/react'

const meta = {
  title: 'Components/Accordion',
} satisfies Meta

export default meta

function AccordionTemplate(props: AccordionRootProps) {
  return (
    <Accordion.Root {...props}>
      <Accordion.Item>
        <Accordion.Header>
          <Accordion.Trigger>Trigger-1</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel-1</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>
          <Accordion.Trigger>Trigger-2</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel-2</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>
          <Accordion.Trigger>Trigger-3</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel-3</Accordion.Panel>
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
