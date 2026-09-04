'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import type { Placement } from '../utils'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'
import { tooltipSelectors } from './store'
import {
  useTooltipPositionerContext,
  useTooltipRootContext,
} from './TooltipContext'

export const useTooltipArrow = createHook<
  'div',
  TooltipArrowOwnProps,
  TooltipArrowState
>((props) => {
  const { store } = useTooltipRootContext()
  const positionerContext = useTooltipPositionerContext()

  if (__DEV__) {
    const isInPositioner = !!positionerContext
    if (!isInPositioner) {
      throw new Error(`Primitives UI: Tooltip.Positioner is missing.`)
    }
  }

  const { placement, arrowRef } = positionerContext!

  const open = store.useSelector(tooltipSelectors.open)

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

interface TooltipArrowOwnProps {}

export interface TooltipArrowState {
  open: boolean
  placement: Placement
}

export type UseTooltipArrowProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, TooltipArrowOwnProps>

export function TooltipArrow({ render, ...other }: TooltipArrowProps) {
  const props = useTooltipArrow(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

TooltipArrow.displayName = 'TooltipArrow'

interface TooltipArrowOwnProps {}

export interface TooltipArrowProps extends UseTooltipArrowProps {
  render?: RenderProp<TooltipArrowState>
}
