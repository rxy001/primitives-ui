/**
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */

import { CollapsiblePanel, useCollapsiblePanel } from './CollapsiblePanel'
import { CollapsibleRoot, useCollapsibleRoot } from './CollapsibleRoot'
import { CollapsibleTrigger, useCollapsibleTrigger } from './CollapsibleTrigger'

export {
  CollapsibleRootProvider,
  useCollapsibleRootContext,
} from './CollapsibleContext'

const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Panel: CollapsiblePanel,
}

export {
  Collapsible,
  useCollapsibleRoot,
  useCollapsibleTrigger,
  useCollapsiblePanel,
}

export type {
  CollapsibleRootProps,
  CollapsibleRootState,
  UseCollapsibleRootProps,
} from './CollapsibleRoot'
export type {
  CollapsibleTriggerProps,
  CollapsibleTriggerState,
  UseCollapsibleTriggerProps,
} from './CollapsibleTrigger'
export type {
  CollapsiblePanelProps,
  CollapsiblePanelState,
  UseCollapsiblePanelProps,
} from './CollapsiblePanel'
export type { CollapsibleRootContextValue } from './CollapsibleContext'
