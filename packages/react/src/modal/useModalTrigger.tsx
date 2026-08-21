'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { useContext } from 'react'
import type { ButtonState } from '../button'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import type { ModalStore } from './store'
import { useButton } from '../button'
import {
  createHook,
  withMetadata,
  useRegisterTrigger,
  useTriggerClick,
} from '../utils'
import { ModalRootContext } from './ModalContext'
import { modalSelectors, useModalStore } from './store'

export const useModalTrigger = createHook<
  'button',
  ModalTriggerOwnProps,
  ModalTriggerState,
  false,
  ModalRootContextValue['component']
>(({ nativeButton, store: externalStore, ...props }, componentName) => {
  const context = useContext(ModalRootContext)

  if (!externalStore && !context?.store) {
    throw new Error(
      `${componentName}.Trigger must be used within ${componentName}.Root or provided a store prop.`,
    )
  }

  const store = useModalStore({
    externalStore: externalStore ?? context?.store,
  })

  const [isMountedByThisTrigger, registerTrigger] = useRegisterTrigger({
    store,
  })
  const modalPopupId = store.useSelector(modalSelectors.modalPopupId)
  const mergedRefs = useMergeRefs(props.ref, registerTrigger)

  props = useTriggerClick({
    ...props,
    store,
  })

  props = {
    'aria-haspopup': 'dialog',
    'aria-expanded': isMountedByThisTrigger,
    'aria-controls': (isMountedByThisTrigger && modalPopupId) || undefined,
    ...props,
    ref: mergedRefs,
  }

  const buttonProps = useButton({
    ...props,
    nativeButton,
    focusableWhenDisabled: true,
  })

  return withMetadata(buttonProps, {
    state: {
      open: isMountedByThisTrigger,
    },
  })
})

export interface ModalTriggerState extends ButtonState {
  open: boolean
}

interface ModalTriggerOwnProps {
  store?: ModalStore

  nativeButton?: boolean
}

export type UseModalTriggerProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, ModalTriggerOwnProps>
