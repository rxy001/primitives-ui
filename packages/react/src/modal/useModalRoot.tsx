'use client'

import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import { useContext, useMemo } from 'react'
import type { ModalRootContextValue } from './ModalContext'
import type { ModalOpenChangeDetails, ModalStore } from './store'
import { withMetadata, createChangeDetails } from '../utils'
import { ModalRootContext, ModalRootProvider } from './ModalContext'
import { modalSelectors, useModalStore } from './store'

export const useModalRoot = (
  {
    defaultTriggerId,
    modal = true,
    defaultOpen = false,
    store: storeProp,
    triggerId: triggerIdProp,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    ...props
  }: UseModalRootProps,
  component: ModalRootContextValue['component'],
) => {
  const parentContext = useContext(ModalRootContext)
  const nested = !!parentContext

  const store = useModalStore({
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

  const open = store.useSelector(modalSelectors.open)

  useIsoLayoutEffect(() => {
    if (parentContext?.store && open) {
      return parentContext.store.observe((currentState, previousState) => {
        const state = store.getState()
        if (!modalSelectors.open(state)) {
          return
        }
        if (
          modalSelectors.open(currentState) !==
          modalSelectors.open(previousState)
        ) {
          store.close(createChangeDetails('ancestor-close', null))
        }
      })
    }
  }, [open])

  useIsoLayoutEffect(() => {
    const context = store.getContext()
    const state = store.getState()

    // Handle default opening: treat the first registered Trigger as the active trigger.
    if (modalSelectors.open(state) && !modalSelectors.activeTriggerId(state)) {
      store.setState({
        triggerId: context.triggerElements[0]?.id,
      })
    }
  }, [])

  const context = useMemo<ModalRootContextValue>(
    () => ({ store, component, nested }),
    [store, component, nested],
  )

  return withMetadata(props, {
    provider: (element) => (
      <ModalRootProvider value={context}>{element}</ModalRootProvider>
    ),
  })
}

export interface ModalRootState {}

export interface UseModalRootProps {
  /**
   * Whether the modal is open.
   */
  open?: boolean

  /**
   * Whether the modal is initially open when uncontrolled.
   * @defaultValue `false`
   */
  defaultOpen?: boolean

  /**
   * Called when the modal is opened or closed. When `open` is controlled, you must keep the `open` state in sync.
   */
  onOpenChange?: (open: boolean, details: ModalOpenChangeDetails) => void

  triggerId?: string

  defaultTriggerId?: string

  modal?: boolean

  store?: ModalStore
}
