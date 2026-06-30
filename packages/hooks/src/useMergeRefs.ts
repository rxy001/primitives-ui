'use client'

import { mergeRefs } from '@primitives-ui/utils'
import { useCallback } from 'react'
import { useLatest } from './useLatest'

export function useMergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  const latest = useLatest(refs)

  return useCallback(
    (node: T | null) => mergeRefs(...latest.current)(node),
    [latest],
  )
}
