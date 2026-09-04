'use client'

import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { useMemo } from 'react'
import type { PopoverRootContextValue } from './PopoverContext'
import type { PopoverStore } from './store'
import type { PopoverOpenChangeDetails } from './store'
import { withMetadata, getMetadataProvider } from '../utils'
import { PopoverRootProvider } from './PopoverContext'
import { popoverSelectors, usePopoverStore } from './store'

export const usePopoverRoot = ({
  defaultTriggerId,
  modal = false,
  defaultOpen = false,
  triggerId: triggerIdProp,
  open: openProp,
  store: storeProp,
  onOpenChange: onOpenChangeProp,
  ...props
}: UsePopoverRootProps) => {
  const store = usePopoverStore({
    externalStore: storeProp,
    initialState: {
      modal,
      openProp,
      triggerIdProp,
      open: defaultOpen,
      triggerId: defaultTriggerId,
    },
  })

  store.useSyncState('modal', modal)
  store.useControlledState('openProp', openProp)
  store.useSyncState('triggerIdProp', triggerIdProp)
  store.useSyncContext('onOpenChangeProp', onOpenChangeProp)

  useIsoLayoutEffect(() => {
    const context = store.getContext()
    const state = store.getState()

    // Handle default opening: treat the first registered Trigger as the active trigger.
    if (
      popoverSelectors.open(state) &&
      !popoverSelectors.activeTriggerId(state)
    ) {
      store.setState({
        triggerId: context.triggerElements[0]?.id,
      })
    }
  }, [])

  const context = useMemo<PopoverRootContextValue>(() => ({ store }), [store])

  return withMetadata(props, {
    provider: (element) => (
      <PopoverRootProvider value={context}>{element}</PopoverRootProvider>
    ),
  })
}

export function PopoverRoot({ children, ...other }: PopoverRootProps) {
  const props = usePopoverRoot(other)
  const provider = getMetadataProvider(props)

  return provider(children)
}

PopoverRoot.displayName = 'PopoverRoot'

export interface PopoverRootState {}

export interface UsePopoverRootProps {
  open?: boolean

  defaultOpen?: boolean

  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void

  triggerId?: string

  defaultTriggerId?: string

  modal?: boolean

  store?: PopoverStore
}

export interface PopoverRootProps extends UsePopoverRootProps {
  children?: React.ReactNode
}
