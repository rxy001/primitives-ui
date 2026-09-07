'use client'

import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { useMemo } from 'react'
import type { TooltipStore } from './store'
import type { TooltipOpenChangeDetails } from './store'
import type { TooltipRootContextValue } from './TooltipContext'
import { withMetadata, getMetadataProvider } from '../utils'
import { tooltipSelectors, useTooltipStore } from './store'
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

  useIsoLayoutEffect(() => {
    const context = store.getContext()
    const state = store.getState()

    // Handle default opening: treat the first registered Trigger as the active trigger.
    if (
      tooltipSelectors.open(state) &&
      !tooltipSelectors.activeTriggerId(state)
    ) {
      store.setState({
        triggerId: context.triggerElements[0]?.id,
      })
    }
  }, [])

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
