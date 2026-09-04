'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { useContext } from 'react'
import type { ButtonState } from '../button'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { PopoverStore } from './store'
import { useButton } from '../button'
import { useClick, useRegisterTrigger } from '../popup'
import {
  createHook,
  withMetadata,
  createPrimitive,
  useResolvedId,
} from '../utils'
import { PopoverRootContext } from './PopoverContext'
import { stateAttributesMapping } from './stateAttributesMapping'
import { popoverSelectors, usePopoverStore } from './store'

export const usePopoverTrigger = createHook<
  'button',
  PopoverTriggerOwnProps,
  PopoverTriggerState
>(({ nativeButton, store: storeProp, ...props }) => {
  const context = useContext(PopoverRootContext)

  if (!storeProp && !context?.store) {
    throw new Error(
      `Popover.Trigger must be used within Popover.Root or provided a store prop.`,
    )
  }

  const store = usePopoverStore({
    externalStore: storeProp ?? context?.store,
  })

  const id = useResolvedId(props.id)

  const [isMountedByThisTrigger, registerTrigger] = useRegisterTrigger({
    store,
  })
  const popoverPopupId = store.useSelector(popoverSelectors.popoverPopupId)
  const mergedRefs = useMergeRefs(props.ref, registerTrigger)

  props = useClick({
    ...props,
    store,
  })

  props = {
    'aria-haspopup': 'dialog',
    'aria-expanded': isMountedByThisTrigger,
    'aria-controls': (isMountedByThisTrigger && popoverPopupId) || undefined,
    ...props,
    id,
    ref: mergedRefs,
  }

  const buttonProps = useButton({
    ...props,
    nativeButton,
    focusableWhenDisabled: true,
  })

  return withMetadata(buttonProps, {
    state: {
      open: isMountedByThisTrigger,
    },
  })
})

export function PopoverTrigger({ render, ...other }: PopoverTriggerProps) {
  const props = usePopoverTrigger(other)

  return createPrimitive('button', props, {
    render,
    stateAttributesMapping,
  })
}

PopoverTrigger.displayName = 'PopoverTrigger'

export interface PopoverTriggerState extends ButtonState {
  open: boolean
}

interface PopoverTriggerOwnProps {
  store?: PopoverStore

  nativeButton?: boolean
}

export type UsePopoverTriggerProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, PopoverTriggerOwnProps>

export interface PopoverTriggerProps extends UsePopoverTriggerProps {
  render?: RenderProp<PopoverTriggerState>
}
