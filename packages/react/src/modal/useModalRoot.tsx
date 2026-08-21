'use client'

import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { useContext, useEffect, useMemo } from 'react'
import type { UsePopupProps } from '../popup'
import type { PopupDismissSource } from '../popup/PopupManager'
import type { ChangeDetails, CHANGE_REASONS } from '../utils'
import type { ModalRootContextValue } from './ModalContext'
import type { ModalStore } from './store'
import { withMetadata, resolveTrigger, createChangeDetails } from '../utils'
import { ModalRootContext, ModalRootProvider } from './ModalContext'
import { modalSelectors, useModalStore } from './store'

export const useModalRoot = (
  {
    trigger,
    defaultTrigger,
    modal = true,
    defaultOpen = false,
    store: externalStore,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    ...props
  }: UseModalRootProps,
  component: ModalRootContextValue['component'],
) => {
  const parentContext = useContext(ModalRootContext)
  const nested = !!parentContext

  const store = useModalStore({
    externalStore,
    initialState: {
      modal,
      nested,
      triggerProp: trigger ?? defaultTrigger,
      open: openProp ?? defaultOpen,
    },
  })

  const onOpenChange = (nextOpen: boolean) => {
    onOpenChangeProp?.(nextOpen, store.getContext().openChangeDetails!)
  }

  store.useSyncValue('modal', modal)
  store.useControlledValue('open', openProp, onOpenChange)
  store.useSyncValue('triggerProp', trigger)

  const open = store.useSelector(modalSelectors.open)

  useIsoLayoutEffect(() => {
    if (parentContext?.store && open) {
      return parentContext.store.subscribe((parentState) => {
        const state = store.getState()
        if (!parentState.open && state.open) {
          store.close(createChangeDetails('ancestor-close', null))
        }
      })
    }
  }, [open])

  useIsoLayoutEffect(() => {
    const context = store.getContext()
    const state = store.getState()

    // Handle default opening: treat the first registered Trigger as the active trigger.
    if (
      state.open &&
      !state.activeTrigger &&
      !resolveTrigger(state.triggerProp)
    ) {
      store.setState({
        activeTrigger: context.triggerElements[0],
      })
    }
  }, [])

  useEffect(() => {
    if (!open) {
      store.clearActiveTrigger()
    }
  }, [open, store])

  const context = useMemo<ModalRootContextValue>(
    () => ({ store, component }),
    [store, component],
  )

  return withMetadata(props, {
    provider: (element) => (
      <ModalRootProvider value={context}>{element}</ModalRootProvider>
    ),
  })
}

export interface ModalRootState {}

export type ModalOpenChangeReason =
  | CHANGE_REASONS['closePress']
  | CHANGE_REASONS['escapeKey']
  | CHANGE_REASONS['focusOutside']
  | CHANGE_REASONS['pointerDownOutside']
  | CHANGE_REASONS['triggerPress']
  | CHANGE_REASONS['ancestorClose']

export type ModalOpenChangeDetails = ChangeDetails<
  ModalOpenChangeReason,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

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
   * Called when the modal is opened or closed.
   */
  onOpenChange?: (open: boolean, details: ModalOpenChangeDetails) => void

  /**
   * An external store used to control the modal and connect components that
   * are rendered outside this root.
   */
  store?: ModalStore

  /**
   * The initial trigger element used when `trigger` is uncontrolled.
   */
  defaultTrigger?: UsePopupProps['trigger']

  /**
   * The trigger element to associate with the modal. Focus returns to this
   * element when the modal closes.
   */
  trigger?: UsePopupProps['trigger']

  modal?: boolean
}
