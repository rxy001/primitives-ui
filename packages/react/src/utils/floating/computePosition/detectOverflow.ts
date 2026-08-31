import { ownerWindow, isHTMLElement } from '@primitives-ui/utils'
import type { MiddlewareState } from './types'
import {
  getRectRelativeToViewport,
  toClientRect,
  getBoundingClientRect,
} from './dom'
import { getOffsetParent } from './getOffsetParent'
import { getOverflowAncestors } from './getOverflowAncestors'

interface DetectOverflowOptions {
  elementType?: 'floating' | 'reference'
}

export function detectOverflow(
  state: MiddlewareState,
  options?: DetectOverflowOptions,
) {
  const { elements, rects, strategy } = state

  const { elementType = 'floating' } = options ?? {}
  const element = elements[elementType]
  const elementRect = rects[elementType]

  const win = ownerWindow(element)

  const clippingAncestors = getOverflowAncestors(
    element,
    state.cache.overflowAncestors,
  ).filter(isHTMLElement)

  const clippingAncestorRects = clippingAncestors.map((el) =>
    toClientRect(getBoundingClientRect(el, el)),
  )

  const { visualViewport } = win

  if (visualViewport) {
    clippingAncestorRects.push(
      toClientRect({
        x: visualViewport.offsetLeft,
        y: visualViewport.offsetTop,
        width: visualViewport.width,
        height: visualViewport.height,
      }),
    )
  }

  // Compute the actually visible clipping region of the element under the combined effect
  // of all clipping ancestors by taking intersections sequentially.
  const clippingRect = clippingAncestorRects.reduce(
    (accRect, rect) => {
      accRect.top = Math.max(rect.top, accRect.top)
      accRect.right = Math.min(rect.right, accRect.right)
      accRect.bottom = Math.min(rect.bottom, accRect.bottom)
      accRect.left = Math.max(rect.left, accRect.left)
      return accRect
    },
    { top: -Infinity, right: Infinity, bottom: Infinity, left: -Infinity },
  )

  const clippingClientRect = toClientRect({
    x: clippingRect.left,
    y: clippingRect.top,
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
  })

  const elementClientRect = toClientRect(
    getRectRelativeToViewport(
      elementRect,
      // Both the reference and floating positions are relative to the floating offsetParent.
      getOffsetParent(elements.floating, state.cache.offsetParent),
      strategy,
    ),
  )

  // The overflow situation of the element in the four directions (top, bottom, left, right)
  // relative to the clipping boundary.
  return {
    top: clippingClientRect.top - elementClientRect.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom,
    left: clippingClientRect.left - elementClientRect.left,
    right: elementClientRect.right - clippingClientRect.right,
  }
}
