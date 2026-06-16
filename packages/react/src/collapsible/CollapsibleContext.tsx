import { createContext } from '@primitives-ui/utils'
import type { CollapsibleRootState } from './CollapsibleRoot'

export interface CollapsibleRootContextValue {
  open: boolean
  disabled: boolean
  setOpen: (open: boolean) => void
  panelId: string | undefined
  setPanelId: React.Dispatch<React.SetStateAction<string | undefined>>
  state: CollapsibleRootState
}

export const [CollapsibleRootProvider, useCollapsibleRootContext] =
  createContext<CollapsibleRootContextValue>({
    contextName: 'CollapsibleRootContext',
    hookName: 'useCollapsibleRootContext',
    providerName: 'CollapsibleRootProvider',
    strict: true,
  })
