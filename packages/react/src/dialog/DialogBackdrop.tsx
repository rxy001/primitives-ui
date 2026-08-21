'use client'

import type { ModalBackdropState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalBackdrop } from '../modal'
import { createHook, createPrimitive } from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useDialogBackdrop = createHook<
  'div',
  DialogBackdropOwnProps,
  DialogBackdropState
>((props) => useModalBackdrop(props, 'Dialog'))

export function DialogBackdrop({ render, ...other }: DialogBackdropProps) {
  const props = useDialogBackdrop(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

DialogBackdrop.displayName = 'DialogBackdrop'

interface DialogBackdropOwnProps {}

export interface DialogBackdropState extends ModalBackdropState {}

export type UseDialogBackdropProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, DialogBackdropOwnProps>

export interface DialogBackdropProps extends UseDialogBackdropProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogBackdropState>
}
