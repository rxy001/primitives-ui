'use client'

import { __DEV__ } from '@primitives-ui/utils'
import { useEffect } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import {
  createHook,
  createPrimitive,
  useResolvedId,
  withMetadata,
} from '../utils'
import { useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

export const useModalDescription = createHook<
  'p',
  ModalDescriptionOwnProps,
  ModalDescriptionState
>((props) => {
  const { store } = useModalRootContext()

  const id = useResolvedId(props.id)

  store.useSyncValueWithCleanup('modalDescriptionId', id)

  if (__DEV__) {
    const registeredTitleId = store.useSelector(
      modalSelectors.modalDescriptionId,
    )

    useEffect(() => {
      const currentDescriptionId = store.getState().modalDescriptionId

      if (currentDescriptionId && currentDescriptionId !== id) {
        console.error(
          'Warning: Multiple Modal.Description components were detected. ' +
            'Modal should contain only one Modal.Description.',
        )
      }
    }, [id, registeredTitleId, store])
  }

  props = {
    ...props,
    id,
  }

  return withMetadata(props, {
    state: {},
  })
})

export function ModalDescription({ render, ...other }: ModalDescriptionProps) {
  const props = useModalDescription(other)

  return createPrimitive('p', props, {
    render,
  })
}

ModalDescription.displayName = 'ModalDescription'

interface ModalDescriptionOwnProps {}

export interface ModalDescriptionState {}

export type UseModalDescriptionProps<Element extends HTMLElements = 'p'> =
  HookProps<Element, ModalDescriptionOwnProps>

export interface ModalDescriptionProps extends UseModalDescriptionProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<ModalDescriptionState>
}
