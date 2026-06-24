'use client'

import type { ButtonState } from '../button'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { CollapsibleRootState } from './CollapsibleRoot'
import { useButton } from '../button'
import { withMetadata, createHook, createPrimitive } from '../utils'
import { useCollapsibleRootContext } from './CollapsibleContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useCollapsibleTrigger = createHook<
  'button',
  CollapsibleTriggerOwnProps,
  CollapsibleTriggerState
>(function useCollapsibleTrigger(props: UseCollapsibleTriggerProps) {
  const rootContext = useCollapsibleRootContext()

  const { onClick, disabled } = props
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    rootContext.setOpen(!rootContext.open)
  }

  props = {
    ...props,
    'aria-controls': rootContext.open ? rootContext.panelId : undefined,
    'aria-expanded': rootContext.open,
    disabled: disabled || rootContext.disabled,
    onClick: handleClick,
  }

  const buttonProps = useButton({
    ...props,
    focusableWhenDisabled: true,
  })

  return withMetadata(buttonProps, {
    state: rootContext.state,
  })
})

export function CollapsibleTrigger({
  render,
  ...other
}: CollapsibleTriggerProps) {
  const props = useCollapsibleTrigger(other)

  return createPrimitive('button', props, {
    render,
    stateAttributesMapping,
  })
}

CollapsibleTrigger.displayName = 'CollapsibleTrigger'

interface CollapsibleTriggerOwnProps {
  nativeButton?: boolean
}

export interface CollapsibleTriggerState
  extends CollapsibleRootState, ButtonState {}

export type UseCollapsibleTriggerProps<
  Element extends HTMLElements = 'button',
> = HookProps<Element, CollapsibleTriggerOwnProps>

export interface CollapsibleTriggerProps extends UseCollapsibleTriggerProps {
  render?: RenderProp<CollapsibleTriggerState>
}
