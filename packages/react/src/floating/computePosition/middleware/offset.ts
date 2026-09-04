import type { MiddlewareState, Middleware } from '../types'
import { getSideAxis, getSide, getAlignment, getAlignmentAxis } from '../utils'

export function offset(options: OffsetOptions = 5): Middleware {
  const offsetValue =
    typeof options === 'number'
      ? {
          mainAxis: options,
          crossAxis: 0,
        }
      : {
          mainAxis: options.mainAxis ?? 0,
          crossAxis: options.crossAxis ?? 0,
        }

  return {
    name: 'offset',
    fn: (state: MiddlewareState) => {
      const { placement, rects } = state

      const side = getSide(placement)
      const alignment = getAlignment(placement)
      const mainAxis = getSideAxis(placement)
      const crossAxis = getAlignmentAxis(placement)

      const mainAxisFactor = ['left', 'top'].includes(side) ? -1 : 1
      const crossAxisFactor = alignment === 'end' ? -1 : 1

      const mainAxisOffset = offsetValue.mainAxis
      const crossAxisOffset = offsetValue.crossAxis

      const coordinates = {
        [mainAxis]: rects.floating[mainAxis] + mainAxisOffset * mainAxisFactor,
        [crossAxis]:
          rects.floating[crossAxis] + crossAxisOffset * crossAxisFactor,
      }

      return {
        ...coordinates,
        data: {
          x: coordinates.x - rects.floating.x,
          y: coordinates.y - rects.floating.y,
        },
      }
    },
  }
}

export type OffsetOptions = number | { mainAxis?: number; crossAxis?: number }
