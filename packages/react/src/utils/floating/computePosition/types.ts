export type Alignment = 'start' | 'end'
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

export type Strategy = 'fixed' | 'absolute'

export interface Coordinates {
  x: number
  y: number
}

export interface Middleware {
  name: string
  fn: (state: MiddlewareState) => {
    x?: number
    y?: number
    data?: {}
    overrides?: {
      placement?: Placement
    }
  }
}

export interface MiddlewareData {
  flip?: {
    overflows: Array<{
      placement: Placement
      overflowsToCheck: number[]
    }>
    index: number
  }
  shift?: Coordinates
  arrow?: Coordinates
  offset?: Coordinates
  hide?: {
    referenceClippedOffsets?: SideObject
    referenceClipped?: boolean
    floatingEscapedOffsets?: SideObject
    floatingEscaped?: boolean
  }

  [key: string]: any
}

export interface MiddlewareState {
  placement: Placement
  strategy: Strategy
  middlewareData: MiddlewareData
  initialPlacement: Placement
  elements: {
    reference: Element
    floating: Element
  }
  rects: {
    reference: Rect
    floating: Rect
  }
  cache: {
    overflowAncestors: WeakMap<Element, (HTMLElement | Window)[]>
    offsetParent: WeakMap<Element, Element | Window>
  }
}

export interface Rect {
  width: number
  height: number
  x: number
  y: number
}

export type SideObject = { [key in Side]: number }

export type Axis = 'x' | 'y'

export type Length = 'width' | 'height'
