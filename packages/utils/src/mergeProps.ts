import { mergeRefs } from './mergeRefs'

type Props = Record<string, any>
type NonNullableProps<T extends readonly unknown[]> = NonNullable<T[number]>
type UnionToIntersection<Union> = (
  Union extends unknown ? (value: Union) => void : never
) extends (value: infer Intersection) => void
  ? Intersection
  : never
type MergedProps<T extends readonly unknown[]> = UnionToIntersection<
  NonNullableProps<T>
>

function isEventHandler(
  key: string,
  value: unknown,
): value is (...args: any[]) => void {
  return /^on[A-Z]/.test(key) && typeof value === 'function'
}

export function mergeProps<T extends readonly object[]>(
  ...propsList: { [Index in keyof T]: T[Index] | null | undefined }
): MergedProps<T> {
  const merged: Props = {}

  propsList.forEach((props) => {
    if (!props) {
      return
    }

    Object.keys(props).forEach((key) => {
      const value = (props as Props)[key]

      if (value === undefined) {
        return
      }

      if (key === 'className') {
        merged.className = [merged.className, value].filter(Boolean).join(' ')
        return
      }

      if (key === 'style') {
        merged.style = {
          ...merged.style,
          ...value,
        }
        return
      }

      if (key === 'ref') {
        merged.ref = mergeRefs(merged.ref, value)
        return
      }

      if (isEventHandler(key, value) && isEventHandler(key, merged[key])) {
        const previous = merged[key]
        merged[key] = (...args: any[]) => {
          previous(...args)
          value(...args)
        }
        return
      }

      merged[key] = value
    })
  })

  return merged as MergedProps<T>
}
