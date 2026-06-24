'use client'

import { useControlledState, useEvent } from '@primitives-ui/utils'
import { useMemo } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type {
  AccordionPanelDefaultsContextValue,
  AccordionRootContextValue,
} from './AccordionContext'
import { createPrimitive, withMetadata } from '../utils'
import {
  AccordionRootProvider,
  AccordionPanelDefaultsProvider,
} from './AccordionContext'
import { stateAttributesMapping } from './stateAttributesMapping'

/**
 * https://github.com/w3c/aria-practices/pull/3434
 * Keyboard navigation is no longer supported.
 */

export function useAccordionRoot<
  Value = any,
  Element extends HTMLElements = 'div',
>({
  onValueChange,
  multiple,
  value: valueProp,
  defaultValue = [],
  disabled = false,
  ...props
}: UseAccordionRootProps<Value, Element>) {
  const [value, setValue] = useControlledState(
    valueProp,
    defaultValue,
    onValueChange,
  )

  const handleValueChange = useEvent((newValue: Value, nextOpen: boolean) => {
    if (!multiple) {
      const nextValue = nextOpen ? [newValue] : []
      setValue(nextValue)
      return
    }

    if (nextOpen) {
      setValue([...value, newValue])
    } else {
      setValue(value.filter((v) => v !== newValue))
    }
  })

  const state = useMemo<AccordionRootState>(
    () => ({
      value,
      disabled,
    }),
    [disabled, value],
  )

  const rootContext = useMemo<AccordionRootContextValue>(
    () => ({
      value,
      disabled,
      handleValueChange,
      state,
    }),
    [disabled, value, handleValueChange, state],
  )

  return withMetadata(props, {
    state,
    provider: (element) => (
      <AccordionRootProvider value={rootContext}>
        {element}
      </AccordionRootProvider>
    ),
  })
}

export function AccordionRoot({
  render,
  keepMounted = false,
  ...ohter
}: AccordionRootProps) {
  const props = useAccordionRoot(ohter)

  const context = useMemo<AccordionPanelDefaultsContextValue>(
    () => ({ keepMounted }),
    [keepMounted],
  )

  return (
    <AccordionPanelDefaultsProvider value={context}>
      {createPrimitive('div', props, {
        render,
        stateAttributesMapping,
      })}
    </AccordionPanelDefaultsProvider>
  )
}

AccordionRoot.displayName = 'AccordionRoot'

interface AccordionRootOwnProps<Value> {
  value?: Value[]
  defaultValue?: Value[]
  onValueChange?: (value: Value[]) => void
  multiple?: boolean
  disabled?: boolean
}

export interface AccordionRootState<Value = any> {
  value: Value[]
  disabled: boolean
}

export type UseAccordionRootProps<
  Value = any,
  Element extends HTMLElements = 'div',
> = HookProps<Element, AccordionRootOwnProps<Value>>

export interface AccordionRootProps<
  Value = any,
> extends UseAccordionRootProps<Value> {
  render?: RenderProp<AccordionRootState<Value>>

  keepMounted?: boolean
}
