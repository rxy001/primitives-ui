'use client'

import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { CollapsibleRootState } from './CollapsibleRoot'
import {
  withMetadata,
  createHook,
  createPrimitive,
  getMetadataState,
} from '../utils'
import { useIsoLayoutEffect } from '../utils'
import { useCollapsibleRootContext } from './CollapsibleContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useCollapsiblePanel = createHook<
  'div',
  CollapsiblePanelOwnProps,
  CollapsiblePanelState
>(function useCollapsiblePanel(props: UseCollapsiblePanelProps) {
  const rootContext = useCollapsibleRootContext()

  useIsoLayoutEffect(() => {
    if (!props.id) return
    rootContext.setPanelId(props.id)

    return () => rootContext.setPanelId(undefined)
  }, [props.id])

  props = {
    ...props,
    id: props.id ?? rootContext.panelId,
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

  if (!keepMounted && !state.open) return null

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

CollapsiblePanel.displayName = 'CollapsiblePanel'

interface CollapsiblePanelOwnProps {}

export interface CollapsiblePanelProps extends UseCollapsiblePanelProps {
  render?: RenderProp<CollapsiblePanelState>

  keepMounted?: boolean
}

export interface CollapsiblePanelState extends CollapsibleRootState {}

export type UseCollapsiblePanelProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, CollapsiblePanelOwnProps>
