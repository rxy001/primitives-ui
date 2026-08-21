'use client'

import { __DEV__ } from '@primitives-ui/utils'
import type { ModalTitleState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalTitle } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useDialogTitle = createHook<
  'h2',
  DialogTitleOwnProps,
  DialogTitleState
>((props) => useModalTitle(props, 'Dialog'))

export function DialogTitle({ render, ...other }: DialogTitleProps) {
  const props = useDialogTitle(other)

  return createPrimitive('h2', props, {
    render,
  })
}

DialogTitle.displayName = 'DialogTitle'

interface DialogTitleOwnProps {}

export interface DialogTitleState extends ModalTitleState {}

export type UseDialogTitleProps<Element extends HTMLElements = 'h2'> =
  HookProps<Element, DialogTitleOwnProps>

export interface DialogTitleProps extends UseDialogTitleProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogTitleState>
}
