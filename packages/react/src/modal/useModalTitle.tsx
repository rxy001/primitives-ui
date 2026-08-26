'use client'

import { __DEV__ } from '@primitives-ui/utils'
import { useEffect } from 'react'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { createHook, useResolvedId, withMetadata } from '../utils'
import { useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

export const useModalTitle = createHook<
  'h2',
  ModalTitleOwnProps,
  ModalTitleState,
  false,
  ModalRootContextValue['component']
>((props, componentName) => {
  const { store, component } = useModalRootContext()

  const id = useResolvedId(props.id)

  store.useSyncStateWithCleanup('modalTitleId', id)

  if (__DEV__) {
    const registeredTitleId = store.useSelector(modalSelectors.modalTitleId)

    if (component !== componentName) {
      console.error(
        'Warning: %s.Title cannot be used with %s.Root.',
        componentName,
        component,
      )
    }

    useEffect(() => {
      const currentTitleId = store.getState().modalTitleId

      if (currentTitleId && currentTitleId !== id) {
        console.error(
          'Warning: Multiple %s.Title components were detected. ' +
            '%s should contain only one %s.Title.',
          componentName,
          componentName,
          componentName,
        )
      }
    }, [id, registeredTitleId, componentName, store])
  }

  props = {
    ...props,
    id,
  }

  return withMetadata(props, {
    state: {},
  })
})

interface ModalTitleOwnProps {}

export interface ModalTitleState {}

export type UseModalTitleProps<Element extends HTMLElements = 'h2'> = HookProps<
  Element,
  ModalTitleOwnProps
>
