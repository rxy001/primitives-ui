'use client'

import { useId, useLayoutEffect } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { CollapsibleRootState } from './CollapsibleRoot'
import {
  withMetadata,
  createHook,
  createPrimitive,
  getMetadataState,
} from '../utils'
import { useCollapsibleRootContext } from './CollapsibleContext'
import { openStateAttributeMapping } from './stateAttributeMapping'

export const useCollapsiblePanel = createHook<
  'div',
  CollapsiblePanelOwnProps,
  CollapsiblePanelState
>(function useCollapsiblePanel(props: UseCollapsiblePanelProps) {
  const rootContext = useCollapsibleRootContext()
  const defaultId = useId()

  const { setPanelId } = rootContext

  useLayoutEffect(() => {
    setPanelId(props.id || defaultId)

    return () => setPanelId(undefined)
  }, [setPanelId, defaultId, props.id])

  props = {
    id: rootContext.panelId,
    ...props,
  }

  return withMetadata(props, {
    state: rootContext.state,
  })
})

export function CollapsiblePanel({
  render,
  keepMounted = false,
  ...other
}: CollapsiblePanelProps) {
  const props = useCollapsiblePanel(other)
  const state = getMetadataState(props)

  if (!keepMounted && !state?.open) return null

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping: {
      open: openStateAttributeMapping,
    },
  })
}

interface CollapsiblePanelOwnProps {
  keepMounted?: boolean
}

export interface CollapsiblePanelProps extends UseCollapsiblePanelProps {
  render?: RenderProp<CollapsiblePanelState>
}

export interface CollapsiblePanelState extends CollapsibleRootState {}

export type UseCollapsiblePanelProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, CollapsiblePanelOwnProps>
