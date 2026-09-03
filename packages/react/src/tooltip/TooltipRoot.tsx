'use client'

import { useMemo } from 'react'
import type { TooltipStore } from './store'
import type { TooltipOpenChangeDetails } from './store'
import type { TooltipRootContextValue } from './TooltipContext'
import { withMetadata, getMetadataProvider } from '../utils'
import { useTooltipStore } from './store'
import { TooltipRootProvider } from './TooltipContext'

export const useTooltipRoot = ({
  defaultTriggerId,
  defaultOpen = false,
  triggerId: triggerIdProp,
  open: openProp,
  store: storeProp,
  onOpenChange: onOpenChangeProp,
  ...props
}: UseTooltipRootProps) => {
  const store = useTooltipStore({
    externalStore: storeProp,
    initialState: {
      openProp,
      triggerIdProp,
      open: defaultOpen,
      triggerId: defaultTriggerId,
    },
  })

  store.useControlledState('openProp', openProp)
  store.useSyncState('triggerIdProp', triggerIdProp)
  store.useSyncContext('onOpenChangeProp', onOpenChangeProp)

  const context = useMemo<TooltipRootContextValue>(() => ({ store }), [store])

  return withMetadata(props, {
    provider: (element) => (
      <TooltipRootProvider value={context}>{element}</TooltipRootProvider>
    ),
  })
}

export function TooltipRoot({ children, ...other }: TooltipRootProps) {
  const props = useTooltipRoot(other)
  const provider = getMetadataProvider(props)

  return provider(children)
}

TooltipRoot.displayName = 'TooltipRoot'

export interface TooltipRootState {}

export interface UseTooltipRootProps {
  open?: boolean

  defaultOpen?: boolean

  onOpenChange?: (open: boolean, details: TooltipOpenChangeDetails) => void

  triggerId?: string

  defaultTriggerId?: string

  store?: TooltipStore
}

export interface TooltipRootProps extends UseTooltipRootProps {
  children?: React.ReactNode
}
