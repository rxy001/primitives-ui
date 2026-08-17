import { createContext } from '@primitives-ui/utils'

interface PortalContextValue {
  parentPortalNode?: HTMLElement | null
}

export const [PortalProvider, usePortalContext] =
  createContext<PortalContextValue>({
    contextName: 'PortalContext',
    hookName: 'usePortalContext',
    strict: false,
  })
