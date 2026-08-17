'use client'

import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { createHook, createPrimitive, withMetadata } from '../utils'

export const useAlertDialogViewport = createHook<
  'h2',
  AlertDialogViewportOwnProps,
  AlertDialogViewportState
>((props) =>
  withMetadata(props, {
    state: {},
  }),
)

export function AlertDialogViewport({
  render,
  ...other
}: AlertDialogViewportProps) {
  const props = useAlertDialogViewport(other)

  return createPrimitive('h2', props, {
    render,
  })
}

AlertDialogViewport.displayName = 'AlertDialogViewport'

interface AlertDialogViewportOwnProps {}

export interface AlertDialogViewportState {}

export type UseAlertDialogViewportProps<Element extends HTMLElements = 'h2'> =
  HookProps<Element, AlertDialogViewportOwnProps>

export interface AlertDialogViewportProps extends UseAlertDialogViewportProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogViewportState>
}
