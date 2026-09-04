import { createContext } from '@primitives-ui/utils'
import type { Placement } from '../utils'
import type { TooltipBoundStore } from './store'

export interface TooltipRootContextValue {
  store: TooltipBoundStore
}

export const [TooltipRootProvider, useTooltipRootContext, TooltipRootContext] =
  createContext<TooltipRootContextValue>({
    contextName: 'TooltipRootContext',
    hookName: 'useTooltipRootContext',
    strict: true,
  })

export const [TooltipPortalProvider, useTooltipPortalContext] =
  createContext<number>({
    contextName: 'TooltipPortalContext',
    hookName: 'useTooltipPortalContext',
    strict: false,
  })

export interface TooltipPositionerContextValue {
  placement: Placement
  arrowRef: React.RefObject<HTMLElement | null>
}

export const [TooltipPositionerProvider, useTooltipPositionerContext] =
  createContext<TooltipPositionerContextValue>({
    contextName: 'TooltipPositionerContext',
    hookName: 'useTooltipPositionerContext',
    strict: false,
  })
