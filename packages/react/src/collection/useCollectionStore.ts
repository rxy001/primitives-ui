'use client'

import { useEvent } from '@primitives-ui/utils'
import { useMemo, useRef } from 'react'
import type { Directory } from '../utils/types'

export type CollectionStoreItem<T extends Directory = Directory> = T & {
  id: string
  elementRef: React.RefObject<HTMLElement | null>
}

export interface CollectionStore<ItemData extends Directory = Directory> {
  getItems: () => CollectionStoreItem<ItemData>[]
  register: (item: CollectionStoreItem<ItemData>) => void
  unregister: (id: string) => void
}

export interface UseCollectionStoreProps<
  ItemData extends Directory = Directory,
> {
  items?: CollectionStoreItem<ItemData>[]
  onItemsChange?: (items: CollectionStoreItem<ItemData>[]) => void
}

export const useCollectionStore = <ItemData extends Directory = Directory>(
  props?: UseCollectionStoreProps<ItemData>,
): CollectionStore<ItemData> => {
  const { items, onItemsChange } = props ?? {}

  const itemsRef = useRef<CollectionStoreItem<ItemData>[]>([])

  const register = useEvent((item: CollectionStoreItem<ItemData>) => {
    const currentItems = items ?? itemsRef.current
    const nextItems = [...currentItems, item].sort(
      (a: CollectionStoreItem<ItemData>, b: CollectionStoreItem<ItemData>) =>
        !a.elementRef.current || !b.elementRef.current
          ? 0
          : isElementPreceding(a.elementRef.current, b.elementRef.current)
            ? -1
            : 1,
    )
    itemsRef.current = nextItems

    onItemsChange?.(nextItems)
  })

  const unregister = useEvent((id: string) => {
    const currentItems = items ?? itemsRef.current
    const nextItems = currentItems.filter((item) => item.id !== id)

    itemsRef.current = nextItems

    onItemsChange?.(nextItems)
  })

  const getItems = useEvent(() => items ?? itemsRef.current)

  return useMemo(
    () => ({
      register,
      unregister,
      getItems,
    }),
    [register, unregister, getItems],
  )
}

function isElementPreceding(a: HTMLElement, b: HTMLElement) {
  return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING)
}
