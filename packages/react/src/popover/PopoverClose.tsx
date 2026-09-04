'use client'

import type { ButtonProps, ButtonState } from '../button'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useButton } from '../button'
import { createChangeDetails, createHook, createPrimitive } from '../utils'
import { usePopoverRootContext } from './PopoverContext'

export const usePopoverClose = createHook<
  'button',
  PopoverCloseOwnProps,
  PopoverCloseState
>(({ nativeButton, ...props }) => {
  const { store } = usePopoverRootContext()

  const { onClick } = props
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)

    if (event.defaultPrevented) return

    store.close(createChangeDetails('close-press', event.nativeEvent))
  }

  props = {
    ...props,
    onClick: handleClick,
  }

  const buttonProps = useButton({
    ...props,
    nativeButton,
    focusableWhenDisabled: true,
  })

  return buttonProps
})

export function PopoverClose({ render, ...other }: PopoverCloseProps) {
  const props = usePopoverClose(other)

  return createPrimitive('button', props, { render })
}

PopoverClose.displayName = 'PopoverClose'

interface PopoverCloseOwnProps {
  /**
   * Whether the rendered element is a native `<button>` element.
   * @defaultValue `true`
   */
  nativeButton?: ButtonProps['nativeButton']
}

export interface PopoverCloseState extends ButtonState {}

export type UsePopoverCloseProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, PopoverCloseOwnProps>

export interface PopoverCloseProps extends UsePopoverCloseProps {
  render?: RenderProp<PopoverCloseState>
}
