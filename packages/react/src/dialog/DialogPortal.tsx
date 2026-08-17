'use client'

import type { UseModalPortalProps, ModalPortalState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalPortal, useModalRootContext } from '../modal'
import { modalSelectors } from '../modal/store'
import { createHook, createPrimitive } from '../utils'

export const useDialogPortal = createHook<
  'div',
  DialogPortalOwnProps,
  DialogPortalState,
  true
>((props) => useModalPortal(props))

export function DialogPortal({
  render,
  keepMounted = false,
  ...other
}: DialogPortalProps) {
  const { store } = useModalRootContext()
  const props = useDialogPortal(other)
  const open = store.useSelector(modalSelectors.open)

  return createPrimitive('div', props, {
    render,
    shouldRender: open || keepMounted,
  })
}

DialogPortal.displayName = 'DialogPortal'

interface DialogPortalOwnProps {
  /**
   * The element that receives the portal. By default, nested portals use their
   * parent portal and top-level portals use `document.body`. Pass `null` to
   * prevent the portal from rendering.
   */
  container?: UseModalPortalProps['container']

  keepMounted?: boolean
}

export interface DialogPortalState extends ModalPortalState {}

export type UseDialogPortalProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, DialogPortalOwnProps>

export interface DialogPortalProps extends UseDialogPortalProps {
  /**
   * Whether to keep the portal mounted in the DOM while the modal is closed.
   * @defaultValue `false`
   */
  keepMounted?: boolean

  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<DialogPortalState>
}
