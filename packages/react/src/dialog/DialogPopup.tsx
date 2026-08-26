'use client'

import type { UseModalPopupProps, ModalPopupState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalPopup } from '../modal'
import { createHook, createPrimitive } from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useDialogPopup = createHook<
  'div',
  DialogPopupOwnProps,
  DialogPopupState
>((props) => useModalPopup(props, 'Dialog'))

export function DialogPopup({ render, ...other }: DialogPopupProps) {
  const props = useDialogPopup(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

DialogPopup.displayName = 'DialogPopup'

interface DialogPopupOwnProps {
  dismissOnFocusOutside?: boolean

  dismissOnEscapeKeyDown?: UseModalPopupProps['dismissOnEscapeKeyDown']

  dismissOnPointerDownOutside?: UseModalPopupProps['dismissOnPointerDownOutside']

  initialFocus?: UseModalPopupProps['initialFocus']

  returnFocus?: UseModalPopupProps['returnFocus']

  preventScroll?: boolean
}

export interface DialogPopupState extends ModalPopupState {}

export type UseDialogPopupProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, DialogPopupOwnProps>

export interface DialogPopupProps extends UseDialogPopupProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogPopupState>
}
