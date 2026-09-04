'use client'

import { useMemo, useRef } from 'react'
import type { FloatingState, Placement, UseFloatingProps } from '../floating'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useFloating } from '../floating'
import {
  withMetadata,
  createHook,
  createPrimitive,
  getMetadataState,
} from '../utils'
import {
  PopoverPositionerProvider,
  usePopoverRootContext,
} from './PopoverContext'

export const usePopoverPositioner = createHook<
  'div',
  PopoverPositionerOwnProps,
  PopoverPositionerState,
  true
>((props) => {
  const { store } = usePopoverRootContext()
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
      <PopoverPositionerProvider value={context}>
        {element}
      </PopoverPositionerProvider>
    ),
  })
})

export function PopoverPositioner({
  render,
  ...other
}: PopoverPositionerProps) {
  const props = usePopoverPositioner(other)

  return createPrimitive('div', props, { render })
}

PopoverPositioner.displayName = 'PopoverPositioner'

interface PopoverPositionerOwnProps {
  placement?: Placement

  shift?: boolean

  flip?: UseFloatingProps['flip']

  offset?: UseFloatingProps['offset']

  hide?: UseFloatingProps['hide']

  strategy?: UseFloatingProps['strategy']
}

export interface PopoverPositionerState extends FloatingState {}

export type UsePopoverPositionerProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, PopoverPositionerOwnProps>

export interface PopoverPositionerProps extends UsePopoverPositionerProps {
  render?: RenderProp<PopoverPositionerState>
}
