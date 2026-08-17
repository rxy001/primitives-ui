'use client'

import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { createHook, createPrimitive, withMetadata } from '../utils'

export const useDialogViewport = createHook<
  'h2',
  DialogViewportOwnProps,
  DialogViewportState
>((props) =>
  withMetadata(props, {
    state: {},
  }),
)

export function DialogViewport({ render, ...other }: DialogViewportProps) {
  const props = useDialogViewport(other)

  return createPrimitive('h2', props, {
    render,
  })
}

DialogViewport.displayName = 'DialogViewport'

interface DialogViewportOwnProps {}

export interface DialogViewportState {}

export type UseDialogViewportProps<Element extends HTMLElements = 'h2'> =
  HookProps<Element, DialogViewportOwnProps>

export interface DialogViewportProps extends UseDialogViewportProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogViewportState>
}
