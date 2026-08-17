'use client'

import type { ModalTriggerState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { DialogBoundStore } from './store'
import { useModalTrigger } from '../modal'
import { createHook, createPrimitive } from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useDialogTrigger = createHook<
  'button',
  DialogTriggerOwnProps,
  DialogTriggerState
>((props) => useModalTrigger(props))

export function DialogTrigger({ render, ...other }: DialogTriggerProps) {
  const props = useDialogTrigger(other)

  return createPrimitive('button', props, {
    render,
    stateAttributesMapping,
  })
}

DialogTrigger.displayName = 'DialogTrigger'

export interface DialogTriggerState extends ModalTriggerState {}

interface DialogTriggerOwnProps {
  store?: DialogBoundStore

  nativeButton?: boolean
}

export type UseDialogTriggerProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, DialogTriggerOwnProps>

export interface DialogTriggerProps extends UseDialogTriggerProps {
  render?: RenderProp<DialogTriggerState>
}
