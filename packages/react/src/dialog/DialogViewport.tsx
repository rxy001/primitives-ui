'use client'

import type { ModalViewportState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalViewport } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useDialogViewport = createHook<
  'div',
  DialogViewportOwnProps,
  DialogViewportState
>((props) => useModalViewport(props, 'Dialog'))

export function DialogViewport({ render, ...other }: DialogViewportProps) {
  const props = useDialogViewport(other)

  return createPrimitive('div', props, {
    render,
  })
}

DialogViewport.displayName = 'DialogViewport'

interface DialogViewportOwnProps {}

export interface DialogViewportState extends ModalViewportState {}

export type UseDialogViewportProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, DialogViewportOwnProps>

export interface DialogViewportProps extends UseDialogViewportProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogViewportState>
}
