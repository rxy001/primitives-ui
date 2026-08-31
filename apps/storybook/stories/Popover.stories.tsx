import type { Meta } from '@storybook/react-vite'
import { Dialog, Popover } from '@primitives-ui/react'
import { useRef } from 'react'
import { dialogClassNames, popoverClassNames } from './styles'

const meta = {
  title: 'Components/Popover',
} satisfies Meta

export default meta

export function Default() {
  const container = useRef(null)

  return (
    <Popover.Root>
      <div ref={container} className='relative w-200 h-200 border-20'>
        <Popover.Trigger
          className={`${popoverClassNames.trigger} absolute left-40 top-10`}
        >
          Open
        </Popover.Trigger>
      </div>
      <Popover.Portal container={container}>
        <Popover.Positioner>
          <Popover.Popup className={popoverClassNames.popup}>
            <Popover.Arrow className={popoverClassNames.arrow} />
            <Popover.Title className={popoverClassNames.title}>
              Popover Title
            </Popover.Title>
            <Popover.Description className={popoverClassNames.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function OpenFromDialog() {
  return (
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Dialog.Description>
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
                  <Popover.Description
                    className={popoverClassNames.description}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </Popover.Description>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
          <Dialog.Close className={dialogClassNames.close}>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function MultipleTriggers() {
  return (
    <Popover.Root>
      <div className='flex gap-3'>
        <Popover.Trigger className={popoverClassNames.trigger}>
          Open-1
        </Popover.Trigger>
        <Popover.Trigger className={popoverClassNames.trigger}>
          Open-2
        </Popover.Trigger>
        <Popover.Trigger className={popoverClassNames.trigger}>
          Open-3
        </Popover.Trigger>
      </div>
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
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function Flip() {
  return (
    <div className='w-100 h-100 overflow-auto border-2'>
      <div className='w-300 h-300 p-30 relative' id='container'>
        <Popover.Root>
          <Popover.Trigger className={`${popoverClassNames.trigger} mt-40`}>
            Open-1
          </Popover.Trigger>
          <Popover.Portal
            container={() => document.getElementById('container')}
          >
            <Popover.Positioner
              offset={50}
              hide={{
                strategy: 'referenceClipped',
              }}
            >
              <Popover.Popup
                className={popoverClassNames.popup}
                dismissOnFocusOutside={false}
              >
                <Popover.Title className={popoverClassNames.title}>
                  Popover Title
                </Popover.Title>
                <Popover.Description className={popoverClassNames.description}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Popover.Description>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  )
}
