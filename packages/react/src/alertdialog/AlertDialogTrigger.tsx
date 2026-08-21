'use client'

import type { ModalTriggerState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { AlertDialogStore } from './store'
import { useModalTrigger } from '../modal'
import { createHook, createPrimitive } from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAlertDialogTrigger = createHook<
  'button',
  AlertDialogTriggerOwnProps,
  AlertDialogTriggerState
>((props) => useModalTrigger(props, 'AlertDialog'))

export function AlertDialogTrigger({
  render,
  ...other
}: AlertDialogTriggerProps) {
  const props = useAlertDialogTrigger(other)

  return createPrimitive('button', props, {
    render,
    stateAttributesMapping,
  })
}

AlertDialogTrigger.displayName = 'AlertDialogTrigger'

export interface AlertDialogTriggerState extends ModalTriggerState {}

interface AlertDialogTriggerOwnProps {
  store?: AlertDialogStore

  nativeButton?: boolean
}

export type UseAlertDialogTriggerProps<
  Element extends HTMLElements = 'button',
> = HookProps<Element, AlertDialogTriggerOwnProps>

export interface AlertDialogTriggerProps extends UseAlertDialogTriggerProps {
  render?: RenderProp<AlertDialogTriggerState>
}
