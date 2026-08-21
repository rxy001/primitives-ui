'use client'

import { __DEV__ } from '@primitives-ui/utils'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalDescription } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useDialogDescription = createHook<
  'p',
  DialogDescriptionOwnProps,
  DialogDescriptionState
>((props) => useModalDescription(props, 'Dialog'))

export function DialogDescription({
  render,
  ...other
}: DialogDescriptionProps) {
  const props = useDialogDescription(other)

  return createPrimitive('p', props, {
    render,
  })
}

DialogDescription.displayName = 'DialogDescription'

interface DialogDescriptionOwnProps {}

export interface DialogDescriptionState {}

export type UseDialogDescriptionProps<Element extends HTMLElements = 'p'> =
  HookProps<Element, DialogDescriptionOwnProps>

export interface DialogDescriptionProps extends UseDialogDescriptionProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogDescriptionState>
}
