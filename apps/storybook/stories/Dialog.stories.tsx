import type { Meta } from '@storybook/react-vite'
import { Button, Dialog, Popover } from '@primitives-ui/react'
import { useRef, useState } from 'react'
import {
  primaryButtonClassName,
  dialogClassNames,
  popoverClassNames,
  inputClassName,
  fieldClassName,
} from './styles'

const meta = {
  title: 'Components/Dialog',
} satisfies Meta

export default meta

export function Default() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
      }}
    >
      <Dialog.Trigger className={dialogClassNames.trigger}>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={dialogClassNames.backdrop} />
        <Dialog.Popup
          dismissOnEscapeKeyDown={false}
          className={dialogClassNames.popup}
        >
          <Dialog.Title className={dialogClassNames.title}>
            Dialog Title
          </Dialog.Title>
          <Dialog.Description className={dialogClassNames.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Dialog.Description>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function DefaultOpen() {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Trigger className={dialogClassNames.trigger}>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={dialogClassNames.backdrop} />
        <Dialog.Popup className={dialogClassNames.popup}>
          <Dialog.Title className={dialogClassNames.title}>
            Dialog Title
          </Dialog.Title>
          <Dialog.Description className={dialogClassNames.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Dialog.Description>
          <Dialog.Close className={dialogClassNames.close}>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function Nested() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={dialogClassNames.trigger}>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={dialogClassNames.backdrop} />
        <Dialog.Popup className={dialogClassNames.popup}>
          <Dialog.Title className={dialogClassNames.title}>
            Dialog Title
          </Dialog.Title>
          <Dialog.Description className={dialogClassNames.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Dialog.Description>
          <Dialog.Root>
            <Dialog.Trigger className={dialogClassNames.trigger}>
              Open Nested
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className={dialogClassNames.backdrop} />
              <Dialog.Popup className={dialogClassNames.popup}>
                <Dialog.Title className={dialogClassNames.title}>
                  Dialog Title
                </Dialog.Title>
                <Dialog.Description className={dialogClassNames.description}>
                  Lorem ipsum dolor sit amet consectetur adipiscing elit.
                  Quisque faucibus ex sapien vitae pellentesque sem placerat. In
                  id cursus mi pretium tellus duis convallis. Tempus leo eu
                  aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus
                  nec metus bibendum egestas. Iaculis massa nisl malesuada
                  lacinia integer nunc posuere. Ut hendrerit semper vel class
                  aptent taciti sociosqu. Ad litora torquent per conubia nostra
                  inceptos himenaeos.
                </Dialog.Description>
                <Dialog.Close className={dialogClassNames.close}>
                  Close
                </Dialog.Close>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
          <Dialog.Close className={dialogClassNames.close}>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function MultipleTriggers() {
  const [open, setOpen] = useState(false)
  const [triggerId, setTriggerId] = useState<string | undefined>(undefined)

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen} triggerId={triggerId}>
        <div className='flex gap-3'>
          <Dialog.Trigger id='trigger-1' className={dialogClassNames.trigger}>
            Open-1
          </Dialog.Trigger>
          <Dialog.Trigger className={dialogClassNames.trigger}>
            Open-2
          </Dialog.Trigger>
          <Button
            className={primaryButtonClassName}
            onClick={() => {
              setOpen(true)
              setTriggerId('trigger-1')
            }}
          >
            Open programmatically - 3
          </Button>
        </div>
        <Dialog.Portal>
          <Dialog.Backdrop className={dialogClassNames.backdrop} />
          <Dialog.Popup className={dialogClassNames.popup}>
            <Dialog.Title className={dialogClassNames.title}>
              Dialog Title
            </Dialog.Title>
            <Dialog.Description className={dialogClassNames.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Dialog.Description>
            <Dialog.Close className={dialogClassNames.close}>
              Close
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

export function DetachedTrigger() {
  const store = useRef(Dialog.createStore())

  return (
    <>
      <Dialog.Trigger
        store={store.current}
        className={`${dialogClassNames.trigger} mb-3`}
      >
        Open detached
      </Dialog.Trigger>
      <Dialog.Root store={store.current}>
        <div className='flex gap-3'>
          <Dialog.Trigger className={dialogClassNames.trigger}>
            Open-1
          </Dialog.Trigger>
          <Dialog.Trigger className={dialogClassNames.trigger}>
            Open-2
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Backdrop className={dialogClassNames.backdrop} />
          <Dialog.Popup className={dialogClassNames.popup}>
            <Dialog.Title className={dialogClassNames.title}>
              Dialog Title
            </Dialog.Title>
            <Dialog.Description className={dialogClassNames.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Dialog.Description>
            <Dialog.Close className={dialogClassNames.close}>
              Close
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

export function NonModal() {
  const [open, setOpen] = useState(false)

  return (
    <div className='flex gap-4'>
      <Button className={primaryButtonClassName}>Forward move</Button>
      <Dialog.Root modal={false} open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={dialogClassNames.trigger}>
          Open
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup className={dialogClassNames.popup}>
            <Dialog.Title className={dialogClassNames.title}>
              Dialog Title
            </Dialog.Title>
            <Dialog.Description className={dialogClassNames.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Dialog.Description>
            <Dialog.Close className={dialogClassNames.close}>
              Close
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Button className={primaryButtonClassName}>Backward move</Button>
    </div>
  )
}

export function OutsideScroll() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={dialogClassNames.trigger}>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={dialogClassNames.backdrop} />
        <Dialog.Viewport className={dialogClassNames.viewport}>
          <Dialog.Popup className={dialogClassNames.scrollPopup}>
            <Dialog.Title className={dialogClassNames.title}>
              Dialog Title
            </Dialog.Title>
            <Dialog.Description className={dialogClassNames.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Dialog.Description>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <Dialog.Close className={dialogClassNames.close}>
              Close
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function FocusManagement() {
  const initialFocusRef = useRef<HTMLInputElement>(null)
  const returnFocusRef = useRef<HTMLButtonElement>(null)

  return (
    <div className='flex gap-4'>
      <Dialog.Root>
        <Dialog.Trigger className={dialogClassNames.trigger}>
          Open
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className={dialogClassNames.backdrop} />
          <Dialog.Popup
            className={dialogClassNames.popup}
            initialFocus={initialFocusRef}
            returnFocus={returnFocusRef}
          >
            <Dialog.Title className={dialogClassNames.title}>
              Dialog Form
            </Dialog.Title>
            <label className={fieldClassName}>
              First Name
              <input className={inputClassName} />
            </label>
            <label className={fieldClassName}>
              Last Name
              <input className={inputClassName} ref={initialFocusRef} />
            </label>
            <div className={dialogClassNames.actions}>
              <Dialog.Close className={dialogClassNames.close}>
                Close
              </Dialog.Close>
              <Dialog.Close className={dialogClassNames.save}>
                Save
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Button className={primaryButtonClassName} ref={returnFocusRef}>
        Final Focus
      </Button>
    </div>
  )
}

export function OpenFromPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger className={popoverClassNames.trigger}>
        Open Popover
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup className={popoverClassNames.popup}>
            <Popover.Title className={popoverClassNames.title}>
              Popover Title
            </Popover.Title>
            <Popover.Description className={popoverClassNames.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Popover.Description>
            <Dialog.Root>
              <Dialog.Trigger className={dialogClassNames.trigger}>
                Open Dialog
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className={dialogClassNames.backdrop} />
                <Dialog.Popup className={dialogClassNames.popup}>
                  <Dialog.Title className={dialogClassNames.title}>
                    Dialog Title
                  </Dialog.Title>
                  <Dialog.Description className={dialogClassNames.description}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </Dialog.Description>
                  <Dialog.Close className={dialogClassNames.close}>
                    Close
                  </Dialog.Close>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
