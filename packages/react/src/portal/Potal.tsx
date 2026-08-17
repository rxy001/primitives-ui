'use client'

import { useIsoLayoutEffect, useMergeRefs } from '@primitives-ui/hooks'
import { isFunction } from '@primitives-ui/utils'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { HookProps, HTMLElements } from '../utils/types'
import { createHook, withMetadata, resolveRef } from '../utils'
import { PortalProvider, usePortalContext } from './PortalContext'

export const usePortal = createHook<'div', PortalOwnProps, PortalState, true>(
  ({ container: containerProp, children, ...props }) => {
    const [container, setContainer] = useState<HTMLElement | null>(null)
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null)
    const mergedRefs = useMergeRefs(props.ref, setPortalNode)

    const portalContext = usePortalContext()

    useIsoLayoutEffect(() => {
      const resolvedContainer = isFunction(containerProp)
        ? containerProp()
        : containerProp

      if (resolvedContainer === null) {
        setPortalNode(null)
        setContainer(null)
        return
      }

      setContainer(
        resolveRef(
          resolvedContainer ?? portalContext?.parentPortalNode ?? document.body,
        ),
      )
    }, [containerProp, portalContext?.parentPortalNode])

    props = {
      ...props,
      ref: mergedRefs,
      'data-primitives-ui-portal': '',
    }

    const context = useMemo(
      () => ({ parentPortalNode: portalNode }),
      [portalNode],
    )

    return withMetadata(props, {
      state: {},
      provider: (element: React.ReactNode) => (
        <>
          {container ? createPortal(element, container) : null}
          {portalNode ? (
            <PortalProvider value={context}>
              {createPortal(children, portalNode)}
            </PortalProvider>
          ) : null}
        </>
      ),
    })
  },
)

interface PortalOwnProps {
  container?:
    | React.RefObject<HTMLElement>
    | HTMLElement
    | null
    | (() => HTMLElement | null | void)
}

export interface PortalState {}

export type UsePortalProps<Element extends HTMLElements = 'div'> = HookProps<
  Element,
  PortalOwnProps
>
