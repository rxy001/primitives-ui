'use client'

import { useEvent } from '@primitives-ui/hooks'
import type { UsePortalProps, PortalState } from '../portal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { usePortal } from '../portal'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { tooltipSelectors } from './store'
import { TooltipPortalProvider, useTooltipRootContext } from './TooltipContext'

const pointerEventBlockerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  userSelect: 'none',
}

export const useTooltipPortal = createHook<
  'div',
  TooltipPortalOwnProps,
  TooltipPortalState,
  true
>(({ children, ...props }) => {
  const { store } = useTooltipRootContext()
  const modal = store.useSelector(tooltipSelectors.modal)
  const open = store.useSelector(tooltipSelectors.open)

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
      <TooltipPortalProvider value={1}>{element}</TooltipPortalProvider>
    ),
  })
})

export function TooltipPortal({
  render,
  keepMounted = false,
  ...other
}: TooltipPortalProps) {
  const { store } = useTooltipRootContext()
  const props = useTooltipPortal(other)
  const open = store.useSelector(tooltipSelectors.open)

  return createPrimitive('div', props, {
    render,
    shouldRender: open || keepMounted,
  })
}

TooltipPortal.displayName = 'TooltipPortal'

interface TooltipPortalOwnProps {
  /**
   * The element that receives the portal. By default, nested portals use their
   * parent portal and top-level portals use `document.body`. Pass `null` to
   * prevent the portal from rendering.
   */
  container?: UsePortalProps['container']

  keepMounted?: boolean
}

export interface TooltipPortalState extends PortalState {}

export type UseTooltipPortalProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, TooltipPortalOwnProps>

export interface TooltipPortalProps extends UseTooltipPortalProps {
  render?: RenderProp<TooltipPortalState>
}
