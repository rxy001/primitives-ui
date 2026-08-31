'use client'

import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { usePopoverRootContext } from './PopoverContext'
import { stateAttributesMapping } from './stateAttributesMapping'
import { popoverSelectors } from './store'

export const usePopoverBackdrop = createHook<
  'div',
  PopoverBackdropOwnProps,
  PopoverBackdropState
>((props) => {
  const { store } = usePopoverRootContext()

  const open = store.useSelector(popoverSelectors.open)

  props = {
    ...props,
    'aria-hidden': true,
    role: 'presentation',
  }

  return withMetadata(props, {
    state: { open },
  })
})

export function PopoverBackdrop({ render, ...other }: PopoverBackdropProps) {
  const props = usePopoverBackdrop(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

PopoverBackdrop.displayName = 'PopoverBackdrop'

interface PopoverBackdropOwnProps {}

export interface PopoverBackdropState {
  open: boolean
}

export type UsePopoverBackdropProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, PopoverBackdropOwnProps>

export interface PopoverBackdropProps extends UsePopoverBackdropProps {
  render?: RenderProp<PopoverBackdropState>
}
