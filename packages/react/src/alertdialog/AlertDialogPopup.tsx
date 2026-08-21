'use client'

import type { UseModalPopupProps, ModalPopupState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalPopup } from '../modal'
import { createHook, createPrimitive } from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAlertDialogPopup = createHook<
  'div',
  AlertDialogPopupOwnProps,
  AlertDialogPopupState
>((props) =>
  useModalPopup(
    {
      role: 'alertdialog',
      dismissOnPointerDownOutside: false,
      ...props,
    },
    'AlertDialog',
  ),
)

export function AlertDialogPopup({ render, ...other }: AlertDialogPopupProps) {
  const props = useAlertDialogPopup(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

AlertDialogPopup.displayName = 'AlertDialogPopup'

interface AlertDialogPopupOwnProps {
  dismissOnFocusOutside?: boolean

  dismissOnEscapeKeyDown?: UseModalPopupProps['dismissOnEscapeKeyDown']

  dismissOnPointerDownOutside?: UseModalPopupProps['dismissOnPointerDownOutside']

  onEscapeKeyDown?: UseModalPopupProps['onEscapeKeyDown']

  onPointerDownOutside?: UseModalPopupProps['onPointerDownOutside']

  onFocusOutside?: UseModalPopupProps['onFocusOutside']

  onDismiss?: UseModalPopupProps['onDismiss']

  initialFocus?: UseModalPopupProps['initialFocus']

  returnFocus?: UseModalPopupProps['returnFocus']

  preventScroll?: boolean
}

export interface AlertDialogPopupState extends ModalPopupState {}

export type UseAlertDialogPopupProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AlertDialogPopupOwnProps>

export interface AlertDialogPopupProps extends UseAlertDialogPopupProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogPopupState>
}
