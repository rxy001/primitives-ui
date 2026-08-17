import type { Meta } from '@storybook/react-vite'
import { Modal, useModalStore } from '@primitives-ui/react/modal'
import { useState } from 'react'

const meta = {
  title: 'Components/Modal',
} satisfies Meta

export default meta

const classNames = {
  popup:
    'fixed w-80 h-40 top-1/2 left-1/2 -translate-1/2 border-amber-600 border-2 bg-amber-300',
}

export function Default() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Trigger>Trigger</Modal.Trigger>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup className={classNames.popup}>
            <Modal.Title>Title-1</Modal.Title>
            <Modal.Description>Description</Modal.Description>
            <div>
              Magna exercitation reprehenderit magna aute tempor cupidatat
              consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
              incididunt cillum quis. Velit duis sit officia eiusmod Lorem
              aliqua enim laboris do dolor eiusmod. Et mollit incididunt nisi
              consectetur esse laborum eiusmod pariatur proident Lorem eiusmod
              et. Culpa deserunt nostrud ad veniam.
            </div>
            <div>
              Magna exercitation reprehenderit magna aute tempor cupidatat
              consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
              incididunt cillum quis. Velit duis sit officia eiusmod Lorem
              aliqua enim laboris do dolor eiusmod. Et mollit incididunt nisi
              consectetur esse laborum eiusmod pariatur proident Lorem eiusmod
              et. Culpa deserunt nostrud ad veniam.
            </div>
            <div>
              Magna exercitation reprehenderit magna aute tempor cupidatat
              consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
              incididunt cillum quis. Velit duis sit officia eiusmod Lorem
              aliqua enim laboris do dolor eiusmod. Et mollit incididunt nisi
              consectetur esse laborum eiusmod pariatur proident Lorem eiusmod
              et. Culpa deserunt nostrud ad veniam.
            </div>
            <div>
              Magna exercitation reprehenderit magna aute tempor cupidatat
              consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
              incididunt cillum quis. Velit duis sit officia eiusmod Lorem
              aliqua enim laboris do dolor eiusmod. Et mollit incididunt nisi
              consectetur esse laborum eiusmod pariatur proident Lorem eiusmod
              et. Culpa deserunt nostrud ad veniam.
            </div>
            <div>
              Magna exercitation reprehenderit magna aute tempor cupidatat
              consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
              incididunt cillum quis. Velit duis sit officia eiusmod Lorem
              aliqua enim laboris do dolor eiusmod. Et mollit incididunt nisi
              consectetur esse laborum eiusmod pariatur proident Lorem eiusmod
              et. Culpa deserunt nostrud ad veniam.
            </div>
            <Modal.Close>Close</Modal.Close>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
    </div>
  )
}

export function MultipleTriggers() {
  const [open, setOpen] = useState(false)
  const store = useModalStore()

  return (
    <>
      <Modal.Trigger store={store}>Outside Trigger 1</Modal.Trigger>
      <Modal.Root store={store} open={open} onOpenChange={setOpen}>
        <Modal.Trigger>Trigger 1</Modal.Trigger>
        <Modal.Trigger>Trigger 2</Modal.Trigger>
        <Modal.Trigger>Trigger 3</Modal.Trigger>
        <button
          onClick={() => {
            setOpen(true)
          }}
        >
          programmatically
        </button>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup className={classNames.popup}>
            <Modal.Title>Title</Modal.Title>
            <Modal.Description>Description</Modal.Description>
            <button>button</button>
            <Modal.Close>Close</Modal.Close>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}

export function Nested() {
  return (
    <Modal.Root>
      <Modal.Trigger>Trigger</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className={classNames.popup}>
          <Modal.Title>Title</Modal.Title>
          <Modal.Description>Description</Modal.Description>
          <button>button</button>
          <Modal.Close>Close</Modal.Close>
          <Modal.Root>
            <Modal.Trigger>Trigger</Modal.Trigger>
            <Modal.Portal>
              <Modal.Backdrop />
              <Modal.Popup className={classNames.popup}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Description>Description</Modal.Description>
                <button>button</button>
                <Modal.Close>Close</Modal.Close>
              </Modal.Popup>
            </Modal.Portal>
          </Modal.Root>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  )
}

export function NonModal() {
  return (
    <>
      <button
        onClick={() => {
          alert('clicked')
        }}
      >
        Outerside - 1
      </button>
      <Modal.Root modal={false}>
        <Modal.Trigger>Trigger</Modal.Trigger>
        <Modal.Portal>
          <Modal.Popup className={classNames.popup}>
            <Modal.Title>Title</Modal.Title>
            <Modal.Description>Description</Modal.Description>
            <button>button</button>
            <Modal.Close>Close</Modal.Close>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
      <button>Outerside - 2</button>
    </>
  )
}
