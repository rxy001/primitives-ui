'use client'

import { useEffect, useState } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import type { AvatarRootState } from './AvatarRoot'
import {
  createHook,
  createPrimitive,
  getMetadataState,
  useTimeout,
  withMetadata,
} from '../utils'
import { useAvatarRootContext } from './AvatarContext'
import { stateAttributesMapping } from './stateAttributesMapping'

export const useAvatarFallback = createHook<
  'div',
  AvatarFallbackOwnProps,
  AvatarFallbackState
>(({ delay, ...props }: UseAvatarFallbackProps) => {
  const rootContext = useAvatarRootContext()
  const [delayElapsed, setDelayElapsed] = useState(delay === undefined)
  const timeout = useTimeout()

  useEffect(() => {
    if (delay !== undefined) {
      timeout.start(() => setDelayElapsed(true), delay)
    } else {
      // When delay is removed before a pending delay elapses, the fallback becomes visible
      // immediately via the `delay === undefined` check below. Latch that visibility so
      // adding a numeric delay again does not hide the already-visible fallback.
      setDelayElapsed(true)
    }
    return timeout.clear
  }, [delay, timeout])

  return withMetadata(props, {
    state: {
      ...rootContext.state,
      delayElapsed,
    },
  })
})

export function AvatarFallback({ render, ...other }: AvatarFallbackProps) {
  const props = useAvatarFallback(other)

  const state = getMetadataState(props)

  return createPrimitive('div', props, {
    render,
    shouldRender: state.imageLoadingStatus !== 'loaded' && state.delayElapsed,
    stateAttributesMapping,
  })
}

interface AvatarFallbackOwnProps {
  delay?: number
}

export interface AvatarFallbackState extends AvatarRootState {
  delayElapsed: boolean
}

export type UseAvatarFallbackProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, AvatarFallbackOwnProps>

export interface AvatarFallbackProps extends UseAvatarFallbackProps {
  render?: RenderProp<AvatarFallbackState>
}
