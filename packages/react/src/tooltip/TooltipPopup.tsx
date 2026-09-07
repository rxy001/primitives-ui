'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import { useRef } from 'react'
import type { Placement } from '../floating'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useHoverPopup } from '../popup/useHover'
import {
  createHook,
  createPrimitive,
  useResolvedId,
  withMetadata,
} from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'
import { tooltipSelectors } from './store'
import {
  useTooltipPortalContext,
  useTooltipPositionerContext,
  useTooltipRootContext,
} from './TooltipContext'

export const useTooltipPopup = createHook<
  'div',
  TooltipPopupOwnProps,
  TooltipPopupState
>((props) => {
  const { store } = useTooltipRootContext()
  const positionerContext = useTooltipPositionerContext()

  if (__DEV__) {
    const isInPortal = !!useTooltipPortalContext()
    if (!isInPortal) {
      throw new Error(`Primitives UI: Tooltip.Portal is missing.`)
    }

    const isInPositioner = !!positionerContext
    if (!isInPositioner) {
      throw new Error(`Primitives UI: Tooltip.Positioner is missing.`)
    }
  }

  const { placement } = positionerContext!
  const open = store.useSelector(tooltipSelectors.open)
  const popupRef = useRef<HTMLDivElement>(null)
  const mergedRefs = useMergeRefs(popupRef, props.ref)
  const id = useResolvedId(props.id)

  props = {
    role: 'tooltip',
    hidden: !open,
    ...props,
    id,
    ref: mergedRefs,
  }

  props = useHoverPopup({
    ...props,
    store,
  })

  return withMetadata(props, {
    state: {
      open,
      placement,
    },
  })
})

export function TooltipPopup({ render, ...other }: TooltipPopupProps) {
  const props = useTooltipPopup(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

TooltipPopup.displayName = 'TooltipPopup'

interface TooltipPopupOwnProps {}

export interface TooltipPopupState {
  open: boolean
  placement: Placement
}

export type UseTooltipPopupProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, TooltipPopupOwnProps>

export interface TooltipPopupProps extends UseTooltipPopupProps {
  render?: RenderProp<TooltipPopupState>
}
