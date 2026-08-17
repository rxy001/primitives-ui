'use client'

import { useEvent } from '@primitives-ui/hooks'
import type { UsePortalProps, PortalState } from '../portal'
import type { HookProps, HTMLElements } from '../utils/types'
import { usePortal } from '../portal'
import { createHook } from '../utils'
import { useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

const pointerEventBlockerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  userSelect: 'none',
}

export const useModalPortal = createHook<
  'div',
  ModalPortalOwnProps,
  ModalPortalState,
  true
>(({ children, ...props }) => {
  const { store } = useModalRootContext()
  const modal = store.useSelector(modalSelectors.modal)
  const open = store.useSelector(modalSelectors.open)

  const handlePointerDown = useEvent((event: React.PointerEvent) =>
    event.stopPropagation(),
  )

  const portalProps = usePortal({
    hidden: !open,
    ...props,
    children: (
      <>
        {open && modal && (
          <div
            onPointerDown={handlePointerDown}
            role='presentation'
            aria-hidden='true'
            style={pointerEventBlockerStyle}
          />
        )}
        {children}
      </>
    ),
  })

  return portalProps
})

interface ModalPortalOwnProps {
  /**
   * The element that receives the portal. By default, nested portals use their
   * parent portal and top-level portals use `document.body`. Pass `null` to
   * prevent the portal from rendering.
   */
  container?: UsePortalProps['container']
}

export interface ModalPortalState extends PortalState {}

export type UseModalPortalProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, ModalPortalOwnProps>
