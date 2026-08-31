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
import { usePopoverRootContext } from './PopoverContext'
import { popoverSelectors } from './store'

export const usePopoverTitle = createHook<
  'h2',
  PopoverTitleOwnProps,
  PopoverTitleState
>((props) => {
  const { store } = usePopoverRootContext()

  const id = useResolvedId(props.id)

  store.useSyncStateWithCleanup('popoverTitleId', id)

  if (__DEV__) {
    const registeredTitleId = store.useSelector(popoverSelectors.popoverTitleId)

    useEffect(() => {
      const currentTitleId = store.getState().popoverTitleId

      if (currentTitleId && currentTitleId !== id) {
        console.error(
          'Warning: Multiple Popover.Title components were detected. ' +
            'Popover should contain only one Popover.Title.',
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

export function PopoverTitle({ render, ...other }: PopoverTitleProps) {
  const props = usePopoverTitle(other)

  return createPrimitive('h2', props, { render })
}

PopoverTitle.displayName = 'PopoverTitle'

interface PopoverTitleOwnProps {}

export interface PopoverTitleState {}

export type UsePopoverTitleProps<Element extends HTMLElements = 'h2'> =
  HookProps<Element, PopoverTitleOwnProps>

export interface PopoverTitleProps extends UsePopoverTitleProps {
  render?: RenderProp<PopoverTitleState>
}
