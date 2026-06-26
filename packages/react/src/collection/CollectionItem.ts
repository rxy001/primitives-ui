'use client'

import { useMergeRefs } from '@primitives-ui/utils'
import { useId, useRef } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { CollectionStore } from './useCollectionStore'
import { createHook, createPrimitive, useIsoLayoutEffect } from '../utils'
import { useCollectionContext } from './CollectionContext'

export const useCollectionItem = createHook<'div', UseCollectionItemOwnProps>(
  ({ getItem, store, ...props }: UseCollectionItemProps) => {
    const context = useCollectionContext()
    const { register, unregister } = store ?? context ?? {}

    const ref = useRef(null)
    const defaultId = useId()
    const id = props.id || defaultId
    const mergedRefs = useMergeRefs(ref, props.ref)

    useIsoLayoutEffect(() => {
      register?.({
        ...getItem?.(),
        id,
        elementRef: ref,
      })

      return () => {
        unregister?.(id)
      }
    }, [getItem, id, register, unregister])

    props = {
      ...props,
      ref: mergedRefs,
    }

    return props
  },
)

export function CollectionItem({ render, ...other }: CollectionItemProps) {
  const props = useCollectionItem(other)

  return createPrimitive('div', props, {
    render,
  })
}

interface UseCollectionItemOwnProps {
  getItem?: () => Record<string, any>

  store?: CollectionStore
}

export type UseCollectionItemProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, UseCollectionItemOwnProps>

export interface CollectionItemProps extends UseCollectionItemProps {
  render?: RenderProp
}
