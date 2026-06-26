'use client'

import { useId, useMemo, useState } from 'react'
import type { CollapsibleRootState } from '../collapsible'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { AccordionItemContextValue } from './AccordionContext'
import type { AccordionRootState } from './AccordionRoot'
import { useCollapsibleRoot } from '../collapsible'
import {
  createHook,
  createPrimitive,
  getMetadataState,
  withMetadata,
} from '../utils'
import {
  AccordionItemProvider,
  useAccordionRootContext,
} from './AccordionContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAccordionItem = createHook<
  'div',
  AccordionItemOwnProps,
  AccordionItemState
>(
  ({
    onOpenChange,
    disabled: disabledProp,
    value: valueProp,
    ...props
  }: UseAccordionItemProps) => {
    const rootContext = useAccordionRootContext()
    const defaultValue = useId()
    const defaultTriggerId = useId()

    const value = valueProp ?? defaultValue
    const disabled = disabledProp || rootContext.disabled
    const [triggerId, setTriggerId] = useState<string>()

    const open = useMemo(() => {
      if (!rootContext.value.length) return false

      return rootContext.value.includes(value)
    }, [rootContext.value, value])

    const handleOpenChange = (nextOpen: boolean) => {
      onOpenChange?.(nextOpen)

      rootContext.handleValueChange(value, nextOpen)
    }

    const collapsibleRootProps = useCollapsibleRoot({
      open,
      disabled,
      onOpenChange: handleOpenChange,
      ...props,
    })

    const collapsibleRootState = getMetadataState(collapsibleRootProps)

    const state: AccordionItemState = useMemo(
      () => ({
        ...rootContext.state,
        ...collapsibleRootState,
      }),
      [rootContext.state, collapsibleRootState],
    )

    const itemContext: AccordionItemContextValue = useMemo(
      () => ({
        state,
        setTriggerId,
        triggerId: triggerId ?? defaultTriggerId,
      }),
      [state, triggerId, defaultTriggerId],
    )

    return withMetadata(collapsibleRootProps, {
      state,
      provider: (element) => (
        <AccordionItemProvider value={itemContext}>
          {element}
        </AccordionItemProvider>
      ),
    })
  },
)

export function AccordionItem({ render, ...other }: AccordionItemProps) {
  const props = useAccordionItem(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

AccordionItem.displayName = 'AccordionItem'

interface AccordionItemOwnProps {
  value?: any
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface AccordionItemState<Value = any>
  extends CollapsibleRootState, AccordionRootState<Value> {}

export type UseAccordionItemProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AccordionItemOwnProps>

export interface AccordionItemProps extends UseAccordionItemProps {
  render?: RenderProp<AccordionItemState>
}
