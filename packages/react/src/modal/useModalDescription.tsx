'use client'

import { __DEV__ } from '@primitives-ui/utils'
import { useEffect } from 'react'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { createHook, useResolvedId, withMetadata } from '../utils'
import { useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

export const useModalDescription = createHook<
  'p',
  ModalDescriptionOwnProps,
  ModalDescriptionState,
  false,
  ModalRootContextValue['component']
>((props, componentName) => {
  const { store, component } = useModalRootContext()

  const id = useResolvedId(props.id)

  store.useSyncStateWithCleanup('modalDescriptionId', id)

  if (__DEV__) {
    if (component !== componentName) {
      console.error(
        'Warning: %s.Description cannot be used with %s.Root.',
        componentName,
        component,
      )
    }

    const registeredTitleId = store.useSelector(
      modalSelectors.modalDescriptionId,
    )

    useEffect(() => {
      const currentDescriptionId = store.getState().modalDescriptionId

      if (currentDescriptionId && currentDescriptionId !== id) {
        console.error(
          'Warning: Multiple %s.Description components were detected. ' +
            '%s should contain only one %s.Description.',
          componentName,
          componentName,
          componentName,
        )
      }
    }, [id, registeredTitleId, store, componentName])
  }

  props = {
    ...props,
    id,
  }

  return withMetadata(props, {
    state: {},
  })
})

interface ModalDescriptionOwnProps {}

export interface ModalDescriptionState {}

export type UseModalDescriptionProps<Element extends HTMLElements = 'p'> =
  HookProps<Element, ModalDescriptionOwnProps>
