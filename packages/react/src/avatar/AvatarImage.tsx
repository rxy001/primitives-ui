'use client'

import { useEvent } from '@primitives-ui/hooks'
import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { useState } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { ImageLoadingStatus } from './AvatarContext'
import type { AvatarRootState } from './AvatarRoot'
import {
  createHook,
  createPrimitive,
  getMetadataState,
  withMetadata,
} from '../utils'
import { useAvatarRootContext } from './AvatarContext'
import { stateAttributesMapping } from './stateAttributesMapping'

interface UseLoadedProps {
  src?: string
  referrerPolicy?: React.HTMLAttributeReferrerPolicy
  crossOrigin?: React.ImgHTMLAttributes<HTMLImageElement>['crossOrigin']
  sizes?: React.ImgHTMLAttributes<HTMLImageElement>['sizes']
  srcSet?: React.ImgHTMLAttributes<HTMLImageElement>['srcSet']
}

function useLoaded({
  src,
  srcSet,
  referrerPolicy,
  crossOrigin,
  sizes,
}: UseLoadedProps) {
  const [loadingStatus, setLoadingStatus] = useState<ImageLoadingStatus>('idle')

  useIsoLayoutEffect(() => {
    if (!src && !srcSet) {
      setLoadingStatus('idle')
      return
    }

    setLoadingStatus('loading')

    let active = true
    const image = new Image()
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy
    }
    if (crossOrigin) {
      image.crossOrigin = crossOrigin
    }
    if (sizes) {
      image.sizes = sizes
    }
    image.onload = () => {
      if (!active) {
        return
      }
      setLoadingStatus('loaded')
    }

    image.onerror = () => {
      if (!active) {
        return
      }

      setLoadingStatus('error')
    }

    if (srcSet) {
      image.srcset = srcSet
    }
    if (src) {
      image.src = src
    }

    if (image.complete) {
      setLoadingStatus(image.naturalWidth > 0 ? 'loaded' : 'error')
    }

    return () => {
      active = false
    }
  }, [src, srcSet, sizes, crossOrigin, referrerPolicy])

  return loadingStatus
}

export const useAvatarImage = createHook<
  'img',
  AvatarImageOwnProps,
  AvatarImageState
>(({ onLoadingStatusChange, ...props }) => {
  const imageLoadingStatus = useLoaded(props)
  const rootContext = useAvatarRootContext()

  const handleLoadingStatusChange = useEvent((status: ImageLoadingStatus) => {
    onLoadingStatusChange?.(status)
    rootContext.setImageLoadingStatus(status)
  })

  useIsoLayoutEffect(() => {
    if (imageLoadingStatus !== rootContext.imageLoadingStatus) {
      handleLoadingStatusChange(imageLoadingStatus)
    }
  }, [
    imageLoadingStatus,
    rootContext.imageLoadingStatus,
    handleLoadingStatusChange,
  ])

  useIsoLayoutEffect(() => () => rootContext.setImageLoadingStatus('idle'), [])

  return withMetadata(props, {
    state: rootContext.state,
  })
})

export function AvatarImage({ render, ...other }: AvatarImageProps) {
  const props = useAvatarImage(other)

  const state = getMetadataState(props)

  return createPrimitive('img', props, {
    render,
    shouldRender: state.imageLoadingStatus === 'loaded',
    stateAttributesMapping,
  })
}

interface AvatarImageOwnProps {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void
}

export interface AvatarImageState extends AvatarRootState {}

export type UseAvatarImageProps<Element extends HTMLElements = 'img'> =
  HookProps<Element, AvatarImageOwnProps>

export interface AvatarImageProps extends UseAvatarImageProps {
  render?: RenderProp<AvatarImageState>
}
