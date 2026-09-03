'use client'

import { useMemo, useRef } from 'react'
import type { FloatingState, Placement, UseFloatingProps } from '../utils'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import {
  withMetadata,
  createHook,
  createPrimitive,
  useFloating,
  getMetadataState,
} from '../utils'
import {
  TooltipPositionerProvider,
  useTooltipRootContext,
} from './TooltipContext'

export const useTooltipPositioner = createHook<
  'div',
  TooltipPositionerOwnProps,
  TooltipPositionerState,
  true
>((props) => {
  const { store } = useTooltipRootContext()
  const arrowRef = useRef<HTMLElement>(null)

  const floatingProps = useFloating({
    store,
    arrow: arrowRef.current,
    ...props,
  })

  const placement = getMetadataState(floatingProps).placement

  const context = useMemo(
    () => ({ arrowRef, placement: placement }),
    [placement],
  )

  return withMetadata(floatingProps, {
    provider: (element: React.ReactNode) => (
      <TooltipPositionerProvider value={context}>
        {element}
      </TooltipPositionerProvider>
    ),
  })
})

export function TooltipPositioner({
  render,
  ...other
}: TooltipPositionerProps) {
  const props = useTooltipPositioner(other)

  return createPrimitive('div', props, { render })
}

TooltipPositioner.displayName = 'TooltipPositioner'

interface TooltipPositionerOwnProps {
  placement?: Placement

  shift?: boolean

  flip?: UseFloatingProps['flip']

  offset?: UseFloatingProps['offset']

  hide?: UseFloatingProps['hide']

  strategy?: UseFloatingProps['strategy']
}

export interface TooltipPositionerState extends FloatingState {}

export type UseTooltipPositionerProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, TooltipPositionerOwnProps>

export interface TooltipPositionerProps extends UseTooltipPositionerProps {
  render?: RenderProp<TooltipPositionerState>
}
