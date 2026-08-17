'use client'

import type { ModalBackdropState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalBackdrop } from '../modal'
import { createHook, createPrimitive } from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAlertDialogBackdrop = createHook<
  'div',
  AlertDialogBackdropOwnProps,
  AlertDialogBackdropState
>((props) => useModalBackdrop(props))

export function AlertDialogBackdrop({
  render,
  ...other
}: AlertDialogBackdropProps) {
  const props = useAlertDialogBackdrop(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

AlertDialogBackdrop.displayName = 'AlertDialogBackdrop'

interface AlertDialogBackdropOwnProps {}

export interface AlertDialogBackdropState extends ModalBackdropState {}

export type UseAlertDialogBackdropProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AlertDialogBackdropOwnProps>

export interface AlertDialogBackdropProps extends UseAlertDialogBackdropProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogBackdropState>
}
