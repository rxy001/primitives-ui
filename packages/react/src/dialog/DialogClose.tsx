'use client'

import type { UseModalCloseProps, ModalCloseState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalClose } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useDialogClose = createHook<
  'button',
  DialogCloseOwnProps,
  DialogCloseState
>((props) => useModalClose(props))

export function DialogClose({ render, ...other }: DialogCloseProps) {
  const props = useDialogClose(other)

  return createPrimitive('button', props, {
    render,
  })
}

DialogClose.displayName = 'DialogClose'

interface DialogCloseOwnProps {
  /**
   * Whether the rendered element is a native `<button>` element.
   * @defaultValue `true`
   */
  nativeButton?: UseModalCloseProps['nativeButton']
}

export interface DialogCloseState extends ModalCloseState {}

export type UseDialogCloseProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, DialogCloseOwnProps>

export interface DialogCloseProps extends UseDialogCloseProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogCloseState>
}
