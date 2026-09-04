'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import type { Placement } from '../floating'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { createHook, createPrimitive, withMetadata } from '../utils'
import {
  usePopoverPositionerContext,
  usePopoverRootContext,
} from './PopoverContext'
import { stateAttributesMapping } from './stateAttributesMapping'
import { popoverSelectors } from './store'

export const usePopoverArrow = createHook<
  'div',
  PopoverArrowOwnProps,
  PopoverArrowState
>((props) => {
  const { store } = usePopoverRootContext()
  const positionerContext = usePopoverPositionerContext()

  if (__DEV__) {
    const isInPositioner = !!positionerContext
    if (!isInPositioner) {
      throw new Error(`Primitives UI: Popover.Positioner is missing.`)
    }
  }

  const { placement, arrowRef } = positionerContext!

  const open = store.useSelector(popoverSelectors.open)

  const mergeRefs = useMergeRefs(props.ref, arrowRef)

  props = {
    ...props,
    style: {
      ...props.style,
      left: 'var(--arrow-x, -9999px)',
      top: 'var(--arrow-y, -9999px)',
    },
    ref: mergeRefs,
    'aria-hidden': true,
    role: 'presentation',
  }

  return withMetadata(props, {
    state: { open, placement },
  })
})

interface PopoverArrowOwnProps {}

export interface PopoverArrowState {
  open: boolean
  placement: Placement
}

export type UsePopoverArrowProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, PopoverArrowOwnProps>

export function PopoverArrow({ render, ...other }: PopoverArrowProps) {
  const props = usePopoverArrow(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

PopoverArrow.displayName = 'PopoverArrow'

interface PopoverArrowOwnProps {}

export interface PopoverArrowProps extends UsePopoverArrowProps {
  render?: RenderProp<PopoverArrowState>
}
