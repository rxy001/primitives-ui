'use client'

import type { ModalViewportState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalViewport } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useAlertDialogViewport = createHook<
  'div',
  AlertDialogViewportOwnProps,
  AlertDialogViewportState
>((props) => useModalViewport(props, 'AlertDialog'))

export function AlertDialogViewport({
  render,
  ...other
}: AlertDialogViewportProps) {
  const props = useAlertDialogViewport(other)

  return createPrimitive('div', props, {
    render,
  })
}

AlertDialogViewport.displayName = 'AlertDialogViewport'

interface AlertDialogViewportOwnProps {}

export interface AlertDialogViewportState extends ModalViewportState {}

export type UseAlertDialogViewportProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AlertDialogViewportOwnProps>

export interface AlertDialogViewportProps extends UseAlertDialogViewportProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogViewportState>
}
