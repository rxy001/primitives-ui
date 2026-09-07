'use client'

import type { UsePortalProps, PortalState } from '../portal'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { usePortal } from '../portal'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { tooltipSelectors } from './store'
import { TooltipPortalProvider, useTooltipRootContext } from './TooltipContext'

export const useTooltipPortal = createHook<
  'div',
  TooltipPortalOwnProps,
  TooltipPortalState,
  true
>((props) => {
  const portalProps = usePortal(props)

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
