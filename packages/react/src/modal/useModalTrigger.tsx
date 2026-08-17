'use client'

import { useEvent, useMergeRefs } from '@primitives-ui/hooks'
import { useContext, useRef } from 'react'
import type { ButtonState } from '../button'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalBoundStore } from './store'
import { useButton } from '../button'
import { resolveTrigger } from '../popup/usePopup'
import { createChangeDetails, createHook, withMetadata } from '../utils'
import { ModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

function useRegisterTrigger(store: ModalBoundStore) {
  const triggerRef = useRef<HTMLElement>(null)

  const register = useEvent((element: HTMLElement | null) => {
    const context = store.getContext()

    if (element === null) {
      const index = context.triggerElements.findIndex(
        (v) => v === triggerRef.current,
      )

      if (index >= 0) {
        context.triggerElements.splice(index, 1)
      }
    } else {
      context.triggerElements.push(element)
    }

    triggerRef.current = element
  })

  return [triggerRef, register] as const
}

export const useModalTrigger = createHook<
  'button',
  ModalTriggerOwnProps,
  ModalTriggerState
>(({ nativeButton, store: externalStore, ...props }) => {
  const context = useContext(ModalRootContext)
  const store = externalStore ?? context?.store

  if (store === undefined) {
    throw new Error(
      'Modal.Trigger must be used within Modal.Root or provided a store prop.',
    )
  }

  const [triggerRef, registerTrigger] = useRegisterTrigger(store)
  const open = store.useSelector(modalSelectors.open)
  const triggerProp = store.useSelector(modalSelectors.triggerProp)
  const modalPopupId = store.useSelector(modalSelectors.modalPopupId)
  const activeTrigger = store.useSelector(modalSelectors.activeTrigger)
  const mergedRefs = useMergeRefs(props.ref, registerTrigger)

  const { onClick } = props
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)

    if (event.defaultPrevented) return

    const details = createChangeDetails('trigger-press', event.nativeEvent, {
      trigger: event.currentTarget,
    })

    if (open) {
      store.close(details)
    } else {
      store.open(details)
    }
  }

  const isMountedByThisTrigger =
    open &&
    (resolveTrigger(triggerProp) ?? activeTrigger) === triggerRef.current

  props = {
    'aria-haspopup': 'dialog',
    'aria-expanded': isMountedByThisTrigger,
    'aria-controls': (isMountedByThisTrigger && modalPopupId) || undefined,
    ...props,
    ref: mergedRefs,
    onClick: handleClick,
  }

  const buttonProps = useButton({
    ...props,
    nativeButton,
    focusableWhenDisabled: true,
  })

  return withMetadata(buttonProps, {
    state: {
      open: isMountedByThisTrigger && open,
    },
  })
})

export interface ModalTriggerState extends ButtonState {
  open: boolean
}

interface ModalTriggerOwnProps {
  store?: ModalBoundStore

  nativeButton?: boolean
}

export type UseModalTriggerProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, ModalTriggerOwnProps>
