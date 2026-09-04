import type { MiddlewareState, Middleware, SideObject, Rect } from '../types'
import { detectOverflow } from '../detectOverflow'
import { sides } from '../utils'

function getSideOffsets(overflow: SideObject, rect: Rect) {
  return {
    top: overflow.top - rect.height,
    right: overflow.right - rect.width,
    bottom: overflow.bottom - rect.height,
    left: overflow.left - rect.width,
  }
}

function isAnySideFullyClipped(overflow: SideObject) {
  return sides.some((side) => overflow[side] >= 0)
}

export function hide(options: HideOptions = {}): Middleware {
  const { strategy = 'referenceClipped' } = options

  return {
    name: 'hide',
    fn: (state: MiddlewareState) => {
      switch (strategy) {
        case 'referenceClipped': {
          const overflow = detectOverflow(state, {
            elementType: 'reference',
          })

          const offsets = getSideOffsets(overflow, state.rects.reference)

          return {
            data: {
              referenceClippedOffsets: offsets,
              referenceClipped: isAnySideFullyClipped(offsets),
            },
          }
        }
        case 'floatingEscaped': {
          const overflow = detectOverflow(state, {
            elementType: 'floating',
          })

          const offsets = getSideOffsets(overflow, state.rects.floating)

          return {
            data: {
              floatingEscapedOffsets: offsets,
              floatingEscaped: isAnySideFullyClipped(offsets),
            },
          }
        }
        default: {
          return {}
        }
      }
    },
  }
}

export interface HideOptions {
  strategy?: 'referenceClipped' | 'floatingEscaped'
}
