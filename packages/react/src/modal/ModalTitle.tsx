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

export const useModalTitle = createHook<
  'h2',
  ModalTitleOwnProps,
  ModalTitleState
>((props) => {
  const { store } = useModalRootContext()

  const id = useResolvedId(props.id)

  store.useSyncValueWithCleanup('modalTitleId', id)

  if (__DEV__) {
    const registeredTitleId = store.useSelector(modalSelectors.modalTitleId)

    useEffect(() => {
      const currentTitleId = store.getState().modalTitleId

      if (currentTitleId && currentTitleId !== id) {
        console.error(
          'Warning: Multiple Modal.Title components were detected. ' +
            'Modal should contain only one Modal.Title.',
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

export function ModalTitle({ render, ...other }: ModalTitleProps) {
  const props = useModalTitle(other)

  return createPrimitive('h2', props, {
    render,
  })
}

ModalTitle.displayName = 'ModalTitle'

interface ModalTitleOwnProps {}

export interface ModalTitleState {}

export type UseModalTitleProps<Element extends HTMLElements = 'h2'> = HookProps<
  Element,
  ModalTitleOwnProps
>

export interface ModalTitleProps extends UseModalTitleProps {
  /**
   * A function or JSX element that replaces the component's rendered element.
   */
  render?: RenderProp<ModalTitleState>
}
