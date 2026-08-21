'use client'

import { useEvent } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import type { UsePortalProps, PortalState } from '../portal'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { usePortal } from '../portal'
import { createHook, withMetadata } from '../utils'
import { ModalPortalProvider, useModalRootContext } from './ModalContext'
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
  true,
  ModalRootContextValue['component']
>(({ children, ...props }, componentName) => {
  const { store, component } = useModalRootContext()
  const modal = store.useSelector(modalSelectors.modal)
  const open = store.useSelector(modalSelectors.open)

  if (__DEV__) {
    if (component !== componentName) {
      console.error(
        'Warning: %s.Portal cannot be used with %s.Root.',
        componentName,
        component,
      )
    }
  }

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

  return withMetadata(portalProps, {
    provider: (element: React.ReactNode) => (
      <ModalPortalProvider value={1}>{element}</ModalPortalProvider>
    ),
  })
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
