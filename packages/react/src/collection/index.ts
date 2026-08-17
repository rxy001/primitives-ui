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

export { useCollectionStore } from './useCollectionStore'

export type {
  UseCollectionRootProps,
  CollectionRootProps,
  CollectionRootState,
} from './CollectionRoot'

export type {
  UseCollectionItemProps,
  CollectionItemProps,
  CollectionItemState,
} from './CollectionItem'

export type { CollectionStoreItem } from './useCollectionStore'
