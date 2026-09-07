'use client'

import { __DEV__ } from '@primitives-ui/utils'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { createHook, withMetadata } from '../utils'
import { useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

export const useModalBackdrop = createHook<
  'div',
  ModalBackdropOwnProps,
  ModalBackdropState,
  false,
  ModalRootContextValue['component']
>((props, componentName) => {
  const { store, component } = useModalRootContext()

  if (__DEV__) {
    if (component !== componentName) {
      console.error(
        'Warning: %s.Backdrop cannot be used with %s.Root.',
        componentName,
        component,
      )
    }
  }

  const open = store.useSelector(modalSelectors.open)

  props = {
    hidden: !open,
    'aria-hidden': true,
    ...props,
  }

  return withMetadata(props, {
    state: { open },
  })
})

interface ModalBackdropOwnProps {}

export interface ModalBackdropState {
  open: boolean
}

export type UseModalBackdropProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, ModalBackdropOwnProps>
