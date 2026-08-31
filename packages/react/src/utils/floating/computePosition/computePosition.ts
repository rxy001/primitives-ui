import { isPlainObject } from '@primitives-ui/utils'
import type {
  ArrowOptions,
  OffsetOptions,
  FlipOptions,
  HideOptions,
} from './middleware/'
import type {
  Placement,
  Middleware,
  MiddlewareData,
  MiddlewareState,
  Strategy,
} from './types'
import { computeCoordinatesByPlacement } from './computeCoordinatesByPlacement'
import { getElementRects } from './getElementRects'
import { flip, arrow, offset, shift, hide } from './middleware'

export function computePosition(
  reference: Element,
  floating: Element,
  options?: ComputePositionOptions,
) {
  const {
    placement = 'bottom',
    shift: shiftOption,
    offset: offsetOption,
    flip: flipOption,
    arrow: arrowOption = false,
    hide: hideOptions = false,
    strategy = 'absolute',
  } = options ?? {}

  const middlewareOptions: [unknown, (...rest: any[]) => Middleware][] = [
    [offsetOption, offset],
    [flipOption, flip],
    [shiftOption, shift],
    [arrowOption, arrow],
    [hideOptions, hide],
  ]

  const middlewareList = middlewareOptions
    .filter(([option]) => option !== false)
    .map(([option, fn]) => fn(option))

  const rects = getElementRects({
    reference,
    floating,
    strategy,
  })

  const coordinates = computeCoordinatesByPlacement(rects, placement)

  let middlewareData: MiddlewareData = {}

  let state: MiddlewareState = {
    strategy,
    rects: {
      floating: {
        ...rects.floating,
        x: coordinates.x,
        y: coordinates.y,
      },
      reference: { ...rects.reference },
    },
    elements: {
      reference,
      floating,
    },
    placement,
    middlewareData,
    initialPlacement: placement,
    cache: {
      overflowAncestors: new WeakMap(),
      offsetParent: new WeakMap(),
    },
  }

  for (let i = 0; i < middlewareList.length; i++) {
    const middleware = middlewareList[i]

    let nextX, nextY

    const { x, y, overrides, data } = middleware.fn(state)

    nextX = x
    nextY = y

    if (data) {
      middlewareData = {
        ...middlewareData,
        [middleware.name]: {
          ...middlewareData[middleware.name],
          ...data,
        },
      }
    }

    let placementOverride: Placement | undefined

    if (isPlainObject(overrides)) {
      if (overrides?.placement && overrides.placement !== state.placement) {
        placementOverride = overrides.placement
        ;({ x: nextX, y: nextY } = computeCoordinatesByPlacement(
          rects,
          placementOverride,
        ))
      }
      i = -1
    }

    state = {
      ...state,
      rects: {
        ...state.rects,
        floating: {
          ...state.rects.floating,
          x: nextX ?? state.rects.floating.x,
          y: nextY ?? state.rects.floating.y,
        },
      },
      middlewareData,
      placement: placementOverride ?? state.placement,
    }
  }

  return {
    x: state.rects.floating.x,
    y: state.rects.floating.y,
    placement: state.placement,
    middlewareData: state.middlewareData,
  }
}

export interface ComputePositionOptions {
  placement?: Placement
  strategy?: Strategy
  offset?: OffsetOptions | false
  flip?: FlipOptions | false
  arrow?: ArrowOptions | false
  shift?: boolean
  hide?: HideOptions | false
}
