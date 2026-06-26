'use client'

import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { AccordionItemState } from './AccordionItem'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { useAccordionItemContext } from './AccordionContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAccordionHeader = createHook<
  'h3',
  AccordionHeaderOwnProps,
  AccordionHeaderState
>((props: UseAccordionHeaderProps) => {
  const itemContext = useAccordionItemContext()

  return withMetadata(props, {
    state: itemContext.state,
  })
})

export function AccordionHeader({ render, ...other }: AccordionHeaderProps) {
  const props = useAccordionHeader(other)

  return createPrimitive('h3', props, {
    render,
    stateAttributesMapping,
  })
}

AccordionHeader.displayName = 'AccordionHeader'

interface AccordionHeaderOwnProps {}

export interface AccordionHeaderState<
  Value = any,
> extends AccordionItemState<Value> {}

export type UseAccordionHeaderProps<Element extends HTMLElements = 'h3'> =
  HookProps<Element, AccordionHeaderOwnProps>

export interface AccordionHeaderProps extends UseAccordionHeaderProps {
  render?: RenderProp<AccordionHeaderState>
}
