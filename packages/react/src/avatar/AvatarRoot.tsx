'use client'

import { useMemo, useState } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { ImageLoadingStatus } from './AvatarContext'
import { createHook, createPrimitive, withMetadata } from '../utils'
import { AvatarRootProvider } from './AvatarContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAvatarRoot = createHook<
  'div',
  AvatarRootOwnProps,
  AvatarRootState
>((props: UseAvatarRootProps) => {
  const [imageLoadingStatus, setImageLoadingStatus] =
    useState<ImageLoadingStatus>('idle')

  const state = useMemo(() => ({ imageLoadingStatus }), [imageLoadingStatus])

  const context = useMemo(
    () => ({
      state,
      imageLoadingStatus,
      setImageLoadingStatus,
    }),
    [imageLoadingStatus, state],
  )

  return withMetadata(props, {
    provider: (element: React.ReactNode) => (
      <AvatarRootProvider value={context}>{element}</AvatarRootProvider>
    ),
    state: {
      imageLoadingStatus,
    },
  })
})

export function AvatarRoot({ render, ...other }: AvatarRootProps) {
  const props = useAvatarRoot(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

interface AvatarRootOwnProps {}

export interface AvatarRootState {
  imageLoadingStatus: ImageLoadingStatus
}

export type UseAvatarRootProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AvatarRootOwnProps>

export interface AvatarRootProps extends UseAvatarRootProps {
  render?: RenderProp<AvatarRootState>
}
