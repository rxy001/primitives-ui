'use client'

import type { UseModalCloseProps, ModalCloseState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalClose } from '../modal'
import { createHook, createPrimitive } from '../utils'

export const useAlertDialogClose = createHook<
  'button',
  AlertDialogCloseOwnProps,
  AlertDialogCloseState
>((props) => useModalClose(props))

export function AlertDialogClose({ render, ...other }: AlertDialogCloseProps) {
  const props = useAlertDialogClose(other)

  return createPrimitive('button', props, {
    render,
  })
}

AlertDialogClose.displayName = 'AlertDialogClose'

interface AlertDialogCloseOwnProps {
  /**
   * Whether the rendered element is a native `<button>` element.
   * @defaultValue `true`
   */
  nativeButton?: UseModalCloseProps['nativeButton']
}

export interface AlertDialogCloseState extends ModalCloseState {}

export type UseAlertDialogCloseProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, AlertDialogCloseOwnProps>

export interface AlertDialogCloseProps extends UseAlertDialogCloseProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogCloseState>
}
