'use client'

import { useControlledState } from '@primitives-ui/utils'
import { useMemo, useState } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { withMetadata, createHook, createPrimitive } from '../utils'
import { CollapsibleRootProvider } from './CollapsibleContext'
import { openStateAttributeMapping } from './stateAttributeMapping'

export const useCollapsibleRoot = createHook<
  'div',
  CollapsibleRootOwnProps,
  CollapsibleRootState,
  true
>(function useCollapsibleRoot({
  disabled = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: UseCollapsibleRootProps) {
  const [open, setOpen] = useControlledState(
    openProp,
    defaultOpen,
    onOpenChange,
  )

  const [panelId, setPanelId] = useState<string>()

  const state: CollapsibleRootState = useMemo(
    () => ({ open, disabled }),
    [open, disabled],
  )

  const context = useMemo(
    () => ({ open, disabled, setOpen, panelId, setPanelId, state }),
    [disabled, open, panelId, setOpen, state],
  )

  return withMetadata(props, {
    state,
    provider: (element: React.ReactNode) => (
      <CollapsibleRootProvider value={context}>
        {element}
      </CollapsibleRootProvider>
    ),
  })
})

export function CollapsibleRoot({ render, ...other }: CollapsibleRootProps) {
  const props = useCollapsibleRoot(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping: {
      open: openStateAttributeMapping,
    },
  })
}

interface CollapsibleRootOwnProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export type UseCollapsibleRootProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, CollapsibleRootOwnProps>

export interface CollapsibleRootState {
  open: boolean
  disabled: boolean
}

export interface CollapsibleRootProps extends UseCollapsibleRootProps {
  render?: RenderProp<CollapsibleRootState>
}
