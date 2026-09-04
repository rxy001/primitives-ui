import type { Rect, Strategy } from './types'
import { getRectRelativeToOffsetParent, getDimensions } from './dom'
import { getOffsetParent } from './getOffsetParent'

interface Options {
  reference: Element
  floating: Element
  strategy: Strategy
}

export function getElementRects({ reference, floating, strategy }: Options): {
  floating: Rect
  reference: Rect
} {
  const floatingRect = getDimensions(floating)
  const offsetParent = getOffsetParent(floating)

  /**
   * The returned reference position is relative to the floating offsetParent.
   */
  const referenceRect = getRectRelativeToOffsetParent(
    reference,
    offsetParent,
    strategy,
  )

  return {
    floating: {
      width: floatingRect.width,
      height: floatingRect.height,
      x: 0,
      y: 0,
    },
    reference: {
      ...referenceRect,
    },
  }
}
