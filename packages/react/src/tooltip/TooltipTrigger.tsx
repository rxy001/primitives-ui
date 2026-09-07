'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { useContext } from 'react'
import type { ButtonState } from '../button'
import type {
  HTMLProps,
  HookProps,
  HTMLElements,
  RenderProp,
} from '../utils/types'
import type { TooltipStore } from './store'
import { useButton } from '../button'
import { useHover, useRegisterTrigger } from '../popup'
import {
  createHook,
  withMetadata,
  createPrimitive,
  useResolvedId,
} from '../utils'
import { stateAttributesMapping } from './stateAttributesMapping'
import { useTooltipStore } from './store'
import { TooltipRootContext } from './TooltipContext'

export const useTooltipTrigger = createHook<
  'button',
  TooltipTriggerOwnProps,
  TooltipTriggerState
>(({ nativeButton, store: storeProp, openDelay, closeDelay, ...props }) => {
  const context = useContext(TooltipRootContext)

  if (!storeProp && !context?.store) {
    throw new Error(
      `Tooltip.Trigger must be used within Tooltip.Root or provided a store prop.`,
    )
  }

  const store = useTooltipStore({
    externalStore: storeProp ?? context?.store,
  })

  const id = useResolvedId(props.id)

  const [isOpenByThisTrigger, registerTrigger] = useRegisterTrigger({
    store,
  })
  const mergedRefs = useMergeRefs(props.ref, registerTrigger)

  props = {
    ...props,
    id,
    ref: mergedRefs,
  }
  props = useHover({
    ...props,
    openDelay,
    closeDelay,
    store,
  })

  const buttonProps = useButton({
    ...props,
    nativeButton,
    focusableWhenDisabled: true,
  })

  return withMetadata(buttonProps, {
    state: {
      open: isOpenByThisTrigger,
    },
  })
})

export function TooltipTrigger({ render, ...other }: TooltipTriggerProps) {
  const props = useTooltipTrigger(other)

  return createPrimitive('button', props, {
    render,
    stateAttributesMapping,
  })
}

TooltipTrigger.displayName = 'TooltipTrigger'

export interface TooltipTriggerState extends ButtonState {
  open: boolean
}

interface TooltipTriggerOwnProps {
  store?: TooltipStore

  nativeButton?: boolean

  openDelay?: number

  closeDelay?: number

  closeOnClick?: boolean
}

export type UseTooltipTriggerProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, TooltipTriggerOwnProps>

export interface TooltipTriggerProps extends UseTooltipTriggerProps {
  render?: RenderProp<TooltipTriggerState, HTMLProps<'button'>>
}
