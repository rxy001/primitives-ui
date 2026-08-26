import { createContext } from '@primitives-ui/utils'
import type { ModalBoundStore } from './store'

export interface ModalRootContextValue {
  store: ModalBoundStore
  component: 'Drawer' | 'Dialog' | 'AlertDialog'
  nested: boolean
}

export const [ModalRootProvider, useModalRootContext, ModalRootContext] =
  createContext<ModalRootContextValue>({
    contextName: 'ModalRootContext',
    hookName: 'useModalRootContext',
    strict: true,
  })

export const [ModalPortalProvider, useModalPortalContext] =
  createContext<number>({
    contextName: 'ModalPortalContext',
    hookName: 'useModalPortalContext',
    strict: false,
  })
