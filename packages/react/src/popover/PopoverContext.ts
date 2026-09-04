import { createContext } from '@primitives-ui/utils'
import type { Placement } from '../floating'
import type { PopoverBoundStore } from './store'

export interface PopoverRootContextValue {
  store: PopoverBoundStore
}

export const [PopoverRootProvider, usePopoverRootContext, PopoverRootContext] =
  createContext<PopoverRootContextValue>({
    contextName: 'PopoverRootContext',
    hookName: 'usePopoverRootContext',
    strict: true,
  })

export const [PopoverPortalProvider, usePopoverPortalContext] =
  createContext<number>({
    contextName: 'PopoverPortalContext',
    hookName: 'usePopoverPortalContext',
    strict: false,
  })

export interface PopoverPositionerContextValue {
  placement: Placement
  arrowRef: React.RefObject<HTMLElement | null>
}

export const [PopoverPositionerProvider, usePopoverPositionerContext] =
  createContext<PopoverPositionerContextValue>({
    contextName: 'PopoverPositionerContext',
    hookName: 'usePopoverPositionerContext',
    strict: false,
  })
