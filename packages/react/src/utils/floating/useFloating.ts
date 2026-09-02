import { useIsoLayoutEffect, useMergeRefs } from '@primitives-ui/hooks'
import { ownerWindow, addEventListener, chain } from '@primitives-ui/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ComputePositionOptions, Placement } from './computePosition'
import type { FloatingStore } from './store'
import { withMetadata } from '../metadata'
import { computePosition } from './computePosition'
import { selectors } from './store'

const DEFAULT_POSITION = {
  top: -9999,
  left: -9999,
}
const DEFAULT_FLIP_OPTIONS = { mainAxis: true, crossAxis: true }
const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/

export function useFloating<Props extends UseFloatingProps>({
  store,
  arrow,
  flip = DEFAULT_FLIP_OPTIONS,
  offset = 5,
  shift = true,
  hide = false,
  placement = 'bottom',
  strategy = 'absolute',
  ...props
}: Props) {
  const [position, setPositionImpl] = useState<Position>(DEFAULT_POSITION)
  const [computedPlacement, setComputedPlacement] =
    useState<Placement>(placement)
  const [visibility, setVisibility] = useState<'hidden' | 'visible'>('visible')
  const [arrowPosition, setArrowPosition] = useState<Position | undefined>()

  // To avoid multiple calculations on the initial render,
  // because ResizeObserver is triggered when observing starts.
  const initialRender = useRef(true)
  const frameRef = useRef<number | null>(null)
  const ref = useRef<HTMLElement>(null)
  const mergeRefs = useMergeRefs(ref, props.ref)

  const activeTriggerId = store.useSelector(selectors.activeTriggerId)
  const open = store.useSelector(selectors.open)

  const activeTrigger = useMemo(
    () =>
      store
        .getContext()
        .triggerElements.find((element) => element.id === activeTriggerId),
    [store, activeTriggerId],
  )

  const setPosition = useCallback(() => {
    if (!activeTrigger || !ref.current) return

    const {
      x,
      y,
      placement: newComputedPlacement,
      middlewareData,
    } = computePosition(activeTrigger, ref.current, {
      placement,
      offset,
      flip,
      shift,
      hide,
      strategy,
      arrow: arrow ? { element: arrow } : undefined,
    })

    setVisibility(
      middlewareData.hide?.referenceClipped ||
        middlewareData.hide?.floatingEscaped
        ? 'hidden'
        : 'visible',
    )

    if (middlewareData.arrow) {
      setArrowPosition({
        left: middlewareData.arrow.x,
        top: middlewareData.arrow.y,
      })
    } else {
      setArrowPosition(undefined)
    }
    setComputedPlacement(newComputedPlacement)
    setPositionImpl({
      top: y,
      left: x,
    })
  }, [activeTrigger, arrow, strategy, placement, offset, flip, shift, hide])

  const resetPosition = useCallback(() => {
    if (frameRef.current !== null) return

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      if (!activeTrigger || !ref.current) {
        setPositionImpl(DEFAULT_POSITION)
        return
      }

      setPosition()
    })
  }, [setPosition, activeTrigger])

  const observeElementResizeChanges = useCallback(() => {
    if (!activeTrigger || !ref.current) return

    const ResizeObserver = ownerWindow(ref.current).ResizeObserver

    const resizeObserver = new ResizeObserver((entries) => {
      if (initialRender.current) {
        initialRender.current = false
        return
      }
      for (const entry of entries) {
        if (entry.target === activeTrigger || entry.target === ref.current) {
          resetPosition()
        }
      }
    })

    resizeObserver.observe(activeTrigger)
    resizeObserver.observe(ref.current)
    return () => {
      resizeObserver.disconnect()
      initialRender.current = true
    }
  }, [resetPosition, activeTrigger])

  const subscribeAncestorScrollEvents = useCallback(() => {
    if (!ref.current || !activeTrigger) return

    const ancestors = [
      ...new Set([
        ...getScrollableAncestors(ref.current),
        ...getScrollableAncestors(activeTrigger),
      ]),
    ]

    const unsubscribeScroll = ancestors.map((ancestor) =>
      addEventListener(ancestor, 'scroll', resetPosition),
    )

    return () => {
      unsubscribeScroll.forEach((unsub) => unsub())
    }
  }, [resetPosition, activeTrigger])

  const subscribeWindowResizeEvent = useCallback(() => {
    if (!ref.current) return

    const win = ownerWindow(ref.current)

    return addEventListener(win, 'resize', resetPosition)
  }, [resetPosition])

  useIsoLayoutEffect(() => {
    if (open) {
      setPosition()
    }
  }, [open, setPosition])

  useEffect(() => {
    if (!open) return

    return chain(
      observeElementResizeChanges(),
      subscribeAncestorScrollEvents(),
      subscribeWindowResizeEvent(),
    )
  }, [
    open,
    observeElementResizeChanges,
    subscribeAncestorScrollEvents,
    subscribeWindowResizeEvent,
  ])

  return withMetadata(
    {
      ...props,
      ref: mergeRefs,
      style: {
        ...props.style,
        position: strategy,
        visibility,
        ...position,
        '--arrow-x': `${arrowPosition?.left}px`,
        '--arrow-y': `${arrowPosition?.top}px`,
      },
    },
    {
      state: {
        placement: computedPlacement,
      },
    },
  )
}

function getScrollableAncestors(element: Element): (Element | Window)[] {
  const win = ownerWindow(element)
  const scrollableAncestors: (Element | Window)[] = []
  let ancestor = element.parentElement

  while (ancestor) {
    const styles = win.getComputedStyle(ancestor)
    const overflow = `${styles.overflow}${styles.overflowX}${styles.overflowY}`

    if (SCROLLABLE_OVERFLOW_PATTERN.test(overflow)) {
      scrollableAncestors.push(ancestor)
    }

    ancestor = ancestor.parentElement
  }

  scrollableAncestors.push(win)
  return scrollableAncestors
}
export interface UseFloatingProps {
  placement?: Placement

  flip?: ComputePositionOptions['flip']

  shift?: boolean

  offset?: ComputePositionOptions['offset']

  hide?: ComputePositionOptions['hide']

  store: FloatingStore

  strategy?: ComputePositionOptions['strategy']

  arrow?: HTMLElement | null

  style?: React.CSSProperties

  ref?: React.Ref<HTMLElement | null>
}

export interface FloatingState {
  placement: Placement
}

interface Position {
  top: number
  left: number
}
