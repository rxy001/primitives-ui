import type { Meta } from '@storybook/react-vite'
import { Tooltip } from '@primitives-ui/react'
import { tooltipClassNames } from './styles'

const meta = {
  title: 'Components/Tooltip',
} satisfies Meta

export default meta

export function Default() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger className={tooltipClassNames.trigger}>
        Open
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup className={tooltipClassNames.popup}>
            <Tooltip.Arrow className={tooltipClassNames.arrow} />
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function DefaultOpen() {
  return (
    <Tooltip.Root defaultOpen>
      <Tooltip.Trigger className={tooltipClassNames.trigger}>
        Open
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup className={tooltipClassNames.popup}>
            <Tooltip.Arrow className={tooltipClassNames.arrow} />
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function MultipleTriggers() {
  return (
    <Tooltip.Root>
      <div className='flex gap-3'>
        <Tooltip.Trigger className={tooltipClassNames.trigger}>
          Open-1
        </Tooltip.Trigger>
        <Tooltip.Trigger className={tooltipClassNames.trigger}>
          Open-2
        </Tooltip.Trigger>
        <Tooltip.Trigger className={tooltipClassNames.trigger}>
          Open-3
        </Tooltip.Trigger>
      </div>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup className={tooltipClassNames.popup}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
