export function isNumber(value?: any): value is number {
  return typeof value === 'number'
}

export function isFunction(value?: any): value is (...args: any[]) => any {
  return (
    typeof value === 'function' &&
    !/^class\s/.test(Function.prototype.toString.call(value))
  )
}

export function isPlainObject(value: any): value is object {
  return (
    typeof value === 'object' &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

export function isString(value?: any): value is string {
  return typeof value === 'string'
}

export function isUndefined(value?: any): value is undefined {
  return typeof value === 'undefined'
}

export function isHTMLElement(
  element: Element | Window,
): element is HTMLElement {
  if (typeof window === 'undefined') {
    return false
  }

  return element instanceof HTMLElement
}

export function isSVGElement(element: Element): element is SVGElement {
  if (typeof window === 'undefined') {
    return false
  }

  return element instanceof SVGElement
}

export function isElement(node: unknown): node is Element {
  return node instanceof Element
}
