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

export const usePopoverDescription = createHook<
  'p',
  PopoverDescriptionOwnProps,
  PopoverDescriptionState
>((props) => {
  const { store } = usePopoverRootContext()

  const id = useResolvedId(props.id)

  store.useSyncStateWithCleanup('popoverDescriptionId', id)

  if (__DEV__) {
    const registeredTitleId = store.useSelector(
      popoverSelectors.popoverDescriptionId,
    )

    useEffect(() => {
      const currentDescriptionId = store.getState().popoverDescriptionId

      if (currentDescriptionId && currentDescriptionId !== id) {
        console.error(
          'Warning: Multiple Popover.Description components were detected. ' +
            'Popover should contain only one Popover.Description.',
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

export function PopoverDescription({
  render,
  ...other
}: PopoverDescriptionProps) {
  const props = usePopoverDescription(other)

  return createPrimitive('p', props, { render })
}

PopoverDescription.displayName = 'PopoverDescription'

interface PopoverDescriptionOwnProps {}

export interface PopoverDescriptionState {}

export type UsePopoverDescriptionProps<Element extends HTMLElements = 'p'> =
  HookProps<Element, PopoverDescriptionOwnProps>

export interface PopoverDescriptionProps extends UsePopoverDescriptionProps {
  render?: RenderProp<PopoverDescriptionState>
}
