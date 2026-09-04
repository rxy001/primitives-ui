'use client'

import { useEvent } from '@primitives-ui/hooks'
import type { UsePortalProps, PortalState } from '../portal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { usePortal } from '../portal'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { PopoverPortalProvider, usePopoverRootContext } from './PopoverContext'
import { popoverSelectors } from './store'

const pointerEventBlockerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  userSelect: 'none',
}

export const usePopoverPortal = createHook<
  'div',
  PopoverPortalOwnProps,
  PopoverPortalState,
  true
>(({ children, ...props }) => {
  const { store } = usePopoverRootContext()
  const modal = store.useSelector(popoverSelectors.modal)
  const open = store.useSelector(popoverSelectors.open)

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
      <PopoverPortalProvider value={1}>{element}</PopoverPortalProvider>
    ),
  })
})

export function PopoverPortal({
  render,
  keepMounted = false,
  ...other
}: PopoverPortalProps) {
  const { store } = usePopoverRootContext()
  const props = usePopoverPortal(other)
  const open = store.useSelector(popoverSelectors.open)

  return createPrimitive('div', props, {
    render,
    shouldRender: open || keepMounted,
  })
}

PopoverPortal.displayName = 'PopoverPortal'

interface PopoverPortalOwnProps {
  /**
   * The element that receives the portal. By default, nested portals use their
   * parent portal and top-level portals use `document.body`. Pass `null` to
   * prevent the portal from rendering.
   */
  container?: UsePortalProps['container']

  keepMounted?: boolean
}

export interface PopoverPortalState extends PortalState {}

export type UsePopoverPortalProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, PopoverPortalOwnProps>

export interface PopoverPortalProps extends UsePopoverPortalProps {
  render?: RenderProp<PopoverPortalState>
}
