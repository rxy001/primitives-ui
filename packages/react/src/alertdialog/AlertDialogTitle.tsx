'use client'

import { __DEV__ } from '@primitives-ui/utils'
import type { ModalTitleState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalTitle } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useAlertDialogTitle = createHook<
  'h2',
  AlertDialogTitleOwnProps,
  AlertDialogTitleState
>((props) => useModalTitle(props, 'AlertDialog'))

export function AlertDialogTitle({ render, ...other }: AlertDialogTitleProps) {
  const props = useAlertDialogTitle(other)

  return createPrimitive('h2', props, {
    render,
  })
}

AlertDialogTitle.displayName = 'AlertDialogTitle'

interface AlertDialogTitleOwnProps {}

export interface AlertDialogTitleState extends ModalTitleState {}

export type UseAlertDialogTitleProps<Element extends HTMLElements = 'h2'> =
  HookProps<Element, AlertDialogTitleOwnProps>

export interface AlertDialogTitleProps extends UseAlertDialogTitleProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogTitleState>
}
