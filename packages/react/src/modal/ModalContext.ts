import { createContext } from '@primitives-ui/utils'
import type { ModalBoundStore } from './store'

export interface ModalRootContextValue {
  store: ModalBoundStore
}

export const [ModalRootProvider, useModalRootContext, ModalRootContext] =
  createContext<ModalRootContextValue>({
    contextName: 'ModalRootContext',
    hookName: 'useModalRootContext',
    strict: true,
  })
