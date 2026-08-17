'use client'

import type { ButtonProps, ButtonState } from '../button'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useButton } from '../button'
import { createChangeDetails, createHook, createPrimitive } from '../utils'
import { useModalRootContext } from './ModalContext'

export const useModalClose = createHook<
  'button',
  ModalCloseOwnProps,
  ModalCloseState
>(({ nativeButton, ...props }) => {
  const { store } = useModalRootContext()

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

export function ModalClose({ render, ...other }: ModalCloseProps) {
  const props = useModalClose(other)

  return createPrimitive('button', props, {
    render,
  })
}

ModalClose.displayName = 'ModalClose'

interface ModalCloseOwnProps {
  /**
   * Whether the rendered element is a native `<button>` element.
   * @defaultValue `true`
   */
  nativeButton?: ButtonProps['nativeButton']
}

export interface ModalCloseState extends ButtonState {}

export type UseModalCloseProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, ModalCloseOwnProps>

export interface ModalCloseProps extends UseModalCloseProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<ModalCloseState>
}
