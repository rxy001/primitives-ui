'use client'

import type { HookProps, HTMLElements } from '../utils/types'
import { createHook, withMetadata } from '../utils'
import { useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

export const useModalBackdrop = createHook<
  'div',
  ModalBackdropOwnProps,
  ModalBackdropState
>((props) => {
  const { store } = useModalRootContext()

  const open = store.useSelector(modalSelectors.open)

  props = {
    ...props,
    'aria-hidden': true,
    role: 'presentation',
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
