'use client'

import { __DEV__ } from '@primitives-ui/utils'
import type { ButtonProps, ButtonState } from '../button'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { useButton } from '../button'
import { createChangeDetails, createHook } from '../utils'
import { useModalRootContext } from './ModalContext'

export const useModalClose = createHook<
  'button',
  ModalCloseOwnProps,
  ModalCloseState,
  false,
  ModalRootContextValue['component']
>(({ nativeButton, ...props }, componentName) => {
  const { store, component } = useModalRootContext()

  if (__DEV__) {
    if (component !== componentName) {
      console.error(
        'Warning: %s.Close cannot be used with %s.Root.',
        componentName,
        component,
      )
    }
  }

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
