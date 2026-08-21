'use client'

import { __DEV__ } from '@primitives-ui/utils'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { createHook, withMetadata } from '../utils'
import { useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

export const useModalViewport = createHook<
  'div',
  ModalViewportOwnProps,
  ModalViewportState,
  false,
  ModalRootContextValue['component']
>((props, componentName) => {
  const { store, component } = useModalRootContext()

  if (__DEV__) {
    if (component !== componentName) {
      console.error(
        'Warning: %s.Portal cannot be used with %s.Root.',
        componentName,
        component,
      )
    }
  }

  const open = store.useSelector(modalSelectors.open)

  return withMetadata(props, {
    state: { open },
  })
})

interface ModalViewportOwnProps {}

export interface ModalViewportState {
  open: boolean
}

export type UseModalViewportProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, ModalViewportOwnProps>
