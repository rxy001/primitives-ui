import { CollectionItem, useCollectionItem } from './CollectionItem'
import { CollectionRoot, useCollectionRoot } from './CollectionRoot'

const Collection = {
  Root: CollectionRoot,
  Item: CollectionItem,
}

export {
  Collection,
  CollectionRoot,
  CollectionItem,
  useCollectionRoot,
  useCollectionItem,
}

export { CollectionProvider, useCollectionContext } from './CollectionContext'

export { useCollectionStore } from './useCollectionStore'

export type {
  UseCollectionRootProps,
  CollectionRootProps,
} from './CollectionRoot'

export type {
  UseCollectionItemProps,
  CollectionItemProps,
} from './CollectionItem'

export type { CollectionStoreItem } from './useCollectionStore'
