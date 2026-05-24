'use client'

import { useCallback } from 'react'
import { mergeRefs } from './mergeRefs'
import { useLatest } from './useLatest'

export function useMergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  const latest = useLatest(refs)

  return useCallback(
    (node: T | null) => mergeRefs(...latest.current)(node),
    [latest],
  )
}
