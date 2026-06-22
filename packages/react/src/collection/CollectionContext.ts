import { createContext } from '@primitives-ui/utils'
import type { CollectionStore } from './useCollectionStore'

export const [CollectionProvider, useCollectionContext] =
  createContext<CollectionStore>({
    contextName: 'CollectionContext',
    hookName: 'useCollectionContext',
    providerName: 'CollectionProvider',
    strict: false,
  })
