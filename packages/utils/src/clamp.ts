export function clamp(value: number, min: number, max: number): number {
  assertOrderedNumber(value, 'value')
  assertOrderedNumber(min, 'min')
  assertOrderedNumber(max, 'max')

  if (min > max) {
    throw new RangeError(
      `clamp: min (${String(min)}) must be less than or equal to max (${String(max)})`,
    )
  }

  if (value < min) return min
  if (value > max) return max
  return value
}

function assertOrderedNumber(value: number, name: string): void {
  if (typeof value !== 'number') {
    throw new TypeError(`clamp: ${name} must be a number`)
  }

  if (Number.isNaN(value)) {
    throw new TypeError(`clamp: ${name} must not be NaN`)
  }
}
