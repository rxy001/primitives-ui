'use client'

import type { UseModalPortalProps, ModalPortalState } from '../modal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useModalPortal, useModalRootContext } from '../modal'
import { modalSelectors } from '../modal/store'
import { createHook, createPrimitive } from '../utils'

export const useAlertDialogPortal = createHook<
  'div',
  AlertDialogPortalOwnProps,
  AlertDialogPortalState,
  true
>((props) => useModalPortal(props, 'AlertDialog'))

export function AlertDialogPortal({
  render,
  keepMounted = false,
  ...other
}: AlertDialogPortalProps) {
  const { store } = useModalRootContext()
  const props = useAlertDialogPortal(other)
  const open = store.useSelector(modalSelectors.open)

  return createPrimitive('div', props, {
    render,
    shouldRender: open || keepMounted,
  })
}

AlertDialogPortal.displayName = 'AlertDialogPortal'

interface AlertDialogPortalOwnProps {
  /**
   * The element that receives the portal. By default, nested portals use their
   * parent portal and top-level portals use `document.body`. Pass `null` to
   * prevent the portal from rendering.
   */
  container?: UseModalPortalProps['container']

  keepMounted?: boolean
}

export interface AlertDialogPortalState extends ModalPortalState {}

export type UseAlertDialogPortalProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AlertDialogPortalOwnProps>

export interface AlertDialogPortalProps extends UseAlertDialogPortalProps {
  /**
   * Whether to keep the portal mounted in the DOM while the modal is closed.
   * @defaultValue `false`
   */
  keepMounted?: boolean

  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<AlertDialogPortalState>
}
