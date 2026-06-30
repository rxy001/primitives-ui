'use client'

import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import type { CollapsibleTriggerState } from '../collapsible'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { AccordionItemState } from './AccordionItem'
import { useCollapsibleTrigger } from '../collapsible'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { useAccordionItemContext } from './AccordionContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAccordionTrigger = createHook<
  'button',
  AccordionTriggerOwnProps,
  AccordionTriggerState
>((props) => {
  const itemContext = useAccordionItemContext()
  useIsoLayoutEffect(() => {
    if (!props.id) return
    itemContext.setTriggerId(props.id)

    return () => itemContext.setTriggerId(undefined)
  }, [props.id])

  props = {
    ...props,
    id: itemContext.triggerId,
  }

  const collapsibleTriggerProps = useCollapsibleTrigger(props)

  return withMetadata(collapsibleTriggerProps, {
    state: itemContext.state,
  })
})

export function AccordionTrigger({ render, ...other }: AccordionTriggerProps) {
  const props = useAccordionTrigger(other)

  return createPrimitive('button', props, {
    render,
    stateAttributesMapping,
  })
}

AccordionTrigger.displayName = 'AccordionTrigger'

interface AccordionTriggerOwnProps {
  nativeButton?: boolean
}

export interface AccordionTriggerState<Value = any>
  extends CollapsibleTriggerState, AccordionItemState<Value> {}

export type UseAccordionTriggerProps<Element extends HTMLElements = 'button'> =
  HookProps<Element, AccordionTriggerOwnProps>

export interface AccordionTriggerProps extends UseAccordionTriggerProps {
  render?: RenderProp<AccordionTriggerState>
}
