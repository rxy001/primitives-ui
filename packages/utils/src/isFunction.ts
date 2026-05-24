export function isFunction(value?: any): value is (...args: any[]) => any {
  return (
    typeof value === 'function' &&
    !/^class\s/.test(Function.prototype.toString.call(value))
  )
}
