import type { Meta } from '@storybook/react-vite'
import { Dialog } from '@primitives-ui/react'

const meta = {
  title: 'Components/Dialog',
} satisfies Meta

export default meta

export function Default() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Trigger</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Description>Title</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
