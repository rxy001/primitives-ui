'use client'

import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { useModalRootContext } from './ModalContext'
import { stateAttributesMapping } from './stateAttributesMapping'
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

export function ModalBackdrop({ render, ...other }: ModalBackdropProps) {
  const props = useModalBackdrop(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

ModalBackdrop.displayName = 'ModalBackdrop'

interface ModalBackdropOwnProps {}

export interface ModalBackdropState {
  open: boolean
}

export type UseModalBackdropProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, ModalBackdropOwnProps>

export interface ModalBackdropProps extends UseModalBackdropProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<ModalBackdropState>
}
