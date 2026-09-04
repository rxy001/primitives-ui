import { clamp } from '@primitives-ui/utils'
import type { MiddlewareState, Middleware } from '../types'
import { detectOverflow } from '../detectOverflow'
import {
  getSideAxis,
  getOppositeAxis,
  getAxisLength,
  getAlignment,
} from '../utils'

export function shift(): Middleware {
  return {
    name: 'shift',
    fn: (state: MiddlewareState) => {
      const { placement, rects } = state

      const overflow = detectOverflow(state)
      const mainAxis = getSideAxis(placement)
      const alignment = getAlignment(placement)
      const crossAxis = getOppositeAxis(mainAxis)
      const crossAxisLength = getAxisLength(crossAxis)
      const minSide = mainAxis === 'y' ? 'left' : 'top'
      const maxSide = mainAxis === 'y' ? 'right' : 'bottom'
      const mainAxisCoord = rects.floating[mainAxis]

      let positiveMaxOverflow: number
      let negativeMaxOverflow: number

      switch (alignment) {
        case 'start':
          positiveMaxOverflow = rects.reference[crossAxisLength]
          negativeMaxOverflow = rects.floating[crossAxisLength]
          break
        case 'end':
          positiveMaxOverflow = rects.floating[crossAxisLength]
          negativeMaxOverflow = rects.reference[crossAxisLength]
          break
        default:
          positiveMaxOverflow =
            rects.reference[crossAxisLength] +
            rects.reference[crossAxis] -
            rects.floating[crossAxis]
          negativeMaxOverflow = positiveMaxOverflow
      }

      // When moving in the positive cross-axis direction, offset is determined by the minimum boundary
      // When moving in the negative cross-axis direction, offset is determined by the maximum boundary
      const crossAxisCoord = clamp(
        rects.floating[crossAxis],
        rects.floating[crossAxis] +
          Math.min(overflow[minSide], positiveMaxOverflow),
        rects.floating[crossAxis] -
          Math.min(overflow[maxSide], negativeMaxOverflow),
      )

      return {
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord,
        data: {
          [mainAxis]: mainAxisCoord - rects.floating[mainAxis],
          [crossAxis]: crossAxisCoord - rects.floating[crossAxis],
        },
      }
    },
  }
}
