'use client'

import { __DEV__ } from '@primitives-ui/utils'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalDescription } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useAlertDialogDescription = createHook<
  'p',
  AlertDialogDescriptionOwnProps,
  AlertDialogDescriptionState
>((props) => useModalDescription(props))

export function AlertDialogDescription({
  render,
  ...other
}: AlertDialogDescriptionProps) {
  const props = useAlertDialogDescription(other)

  return createPrimitive('p', props, {
    render,
  })
}

AlertDialogDescription.displayName = 'AlertDialogDescription'

interface AlertDialogDescriptionOwnProps {}

export interface AlertDialogDescriptionState {}

export type UseAlertDialogDescriptionProps<Element extends HTMLElements = 'p'> =
  HookProps<Element, AlertDialogDescriptionOwnProps>

export interface AlertDialogDescriptionProps extends UseAlertDialogDescriptionProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogDescriptionState>
}
