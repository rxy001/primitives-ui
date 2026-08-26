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
  useResolvedId,
} from '../utils'
import { ModalRootContext } from './ModalContext'
import { modalSelectors, useModalStore } from './store'

export const useModalTrigger = createHook<
  'button',
  ModalTriggerOwnProps,
  ModalTriggerState,
  false,
  ModalRootContextValue['component']
>(({ nativeButton, store: storeProp, ...props }, componentName) => {
  const context = useContext(ModalRootContext)

  if (!storeProp && !context?.store) {
    throw new Error(
      `${componentName}.Trigger must be used within ${componentName}.Root or provided a store prop.`,
    )
  }

  const store = useModalStore({
    externalStore: storeProp ?? context?.store,
  })

  const id = useResolvedId(props.id)

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
    id,
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
  nativeButton?: boolean

  store?: ModalStore
}

export type UseModalTriggerProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, ModalTriggerOwnProps>
