'use client'

import type { HTMLElements, HookProps, RenderProp } from '../utils/types'
import type { CollectionStore } from './useCollectionStore'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { CollectionProvider, useCollectionContext } from './CollectionContext'

export const useCollectionRoot = createHook<
  'div',
  UseCollectionRootOwnProps,
  true
>(({ store, ...props }: UseCollectionRootProps) => {
  const context = useCollectionContext()

  return withMetadata(props, {
    provider: (element: React.ReactNode) => (
      <CollectionProvider value={store ?? context}>
        {element}
      </CollectionProvider>
    ),
  })
})

export function CollectionRoot({ render, ...other }: CollectionRootProps) {
  const props = useCollectionRoot(other)

  return createPrimitive('div', props, {
    render,
  })
}

CollectionRoot.displayName = 'CollectionRoot'

interface UseCollectionRootOwnProps {
  store?: CollectionStore
}

export type UseCollectionRootProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, UseCollectionRootOwnProps>

export interface CollectionRootProps extends UseCollectionRootProps {
  render?: RenderProp
}
