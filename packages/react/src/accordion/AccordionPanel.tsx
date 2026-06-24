'use client'

import type { CollapsiblePanelState } from '../collapsible'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { AccordionItemState } from './AccordionItem'
import { useCollapsiblePanel } from '../collapsible'
import {
  createHook,
  createPrimitive,
  getMetadataState,
  withMetadata,
} from '../utils'
import {
  useAccordionItemContext,
  useAccordionPanelDefaultsContext,
} from './AccordionContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAccordionPanel = createHook<
  'div',
  AccordionPanelOwnProps,
  AccordionPanelState
>((props: UseAccordionPanelProps) => {
  const itemContext = useAccordionItemContext()

  props = {
    ...props,
    'aria-labelledby': itemContext.triggerId,
    role: 'region',
  }

  const collapsiblePanelProps = useCollapsiblePanel(props)

  return withMetadata(collapsiblePanelProps, {
    state: itemContext.state,
  })
})

export function AccordionPanel({
  render,
  keepMounted = false,
  ...other
}: AccordionPanelProps) {
  const props = useAccordionPanel(other)
  const state = getMetadataState(props)
  const context = useAccordionPanelDefaultsContext()

  if (!(keepMounted || context.keepMounted) && !state.open) return null

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

AccordionPanel.displayName = 'AccordionPanel'

interface AccordionPanelOwnProps {}

export interface AccordionPanelState<Value = any>
  extends CollapsiblePanelState, AccordionItemState<Value> {}

export type UseAccordionPanelProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AccordionPanelOwnProps>

export interface AccordionPanelProps extends UseAccordionPanelProps {
  render?: RenderProp<AccordionPanelState>

  keepMounted?: boolean
}
