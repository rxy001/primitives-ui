import { ownerWindow, clamp } from '@primitives-ui/utils'
import type { MiddlewareState, Middleware } from '../types'
import {
  getAlignmentAxis,
  getAlignment,
  getAxisLength,
  getSideAxis,
} from '../utils'

export interface ArrowOptions {
  element?: HTMLElement | null
}

export function arrow(options: ArrowOptions): Middleware {
  const { element } = options

  return {
    name: 'arrow',
    fn: (state: MiddlewareState) => {
      if (!element) {
        return {}
      }

      const { placement, rects } = state
      const mainAxis = getSideAxis(placement)
      const crossAxis = getAlignmentAxis(placement)
      const crossAxisLength = getAxisLength(crossAxis)
      const mainAxisLength = getAxisLength(mainAxis)
      const alignment = getAlignment(placement)
      const arrowRect = element.getBoundingClientRect()
      const arrowHalfSize = arrowRect[mainAxisLength] / 2
      const min = 0
      const max = rects.floating[crossAxisLength] - arrowRect[crossAxisLength]
      const floatingBorderWidth =
        parseFloat(
          ownerWindow(element).getComputedStyle(element).borderWidth,
        ) || 0
      const mainAxisCoord = rects.floating[mainAxis]
      const crossAxisCoord = rects.floating[crossAxis]

      // The position of the arrow is calculated relative to the floating.
      let mainAxisPosition = -arrowHalfSize - floatingBorderWidth

      if (mainAxisCoord < rects.reference[mainAxis]) {
        mainAxisPosition += rects.floating[mainAxisLength]
      }

      let crossAxisPosition =
        rects.reference[crossAxis] - crossAxisCoord - arrowHalfSize

      if (!alignment) {
        crossAxisPosition += rects.reference[crossAxisLength] / 2
      } else if (alignment === 'start') {
        crossAxisPosition += rects.reference[crossAxisLength] / 4
      } else if (alignment === 'end') {
        crossAxisPosition += (rects.reference[crossAxisLength] / 4) * 3
      }

      return {
        data: {
          [mainAxis]: mainAxisPosition,
          [crossAxis]: clamp(crossAxisPosition, min, max),
        },
      }
    },
  }
}
