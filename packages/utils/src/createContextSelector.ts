'use client'

import type { RefObject } from 'react'
import {
  createElement,
  useRef,
  useLayoutEffect,
  createContext as createReactContext,
  useContext as useReactContext,
  useEffect,
  useReducer,
} from 'react'

export const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

interface ContextOptions<Value> {
  contextName?: string
  hookName?: string
  providerName?: string
  defaultValue?: Value
  strict?: boolean
}

interface ContextValue<Value> {
  value: RefObject<Value>
  listeners: Set<Function>
}

export type ContextSelector<Value, SelectedValue> = (
  value: Value,
) => SelectedValue

export type CreateContextReturn<Value> = [
  React.Provider<Value>,
  <T>(selector: ContextSelector<Value, T>) => T,
]

export function createContextSelector<Value>(
  options: ContextOptions<Value> & { strict?: true },
): CreateContextReturn<Value>
export function createContextSelector<Value>(
  options: ContextOptions<Value> & { strict: false; defaultValue: Value },
): CreateContextReturn<Value>
export function createContextSelector<Value>(
  options: ContextOptions<Value> & {
    strict: false
    defaultValue?: undefined
  },
): CreateContextReturn<Value | undefined>
export function createContextSelector<Value>(options: ContextOptions<Value>) {
  const {
    defaultValue,
    contextName,
    hookName = 'useContext',
    providerName = 'Provider',
    strict = true,
  } = options

  const Context = createReactContext<ContextValue<Value | undefined>>({
    value: { current: defaultValue },
    listeners: new Set(),
  })

  Context.displayName = contextName

  function useContext<T>(selector: ContextSelector<Value | undefined, T>) {
    const context = useReactContext(Context)

    if (context.value?.current === undefined && strict) {
      const error = new Error(getErrorMessage(hookName, providerName))
      error.name = 'ContextError'
      throw error
    }

    return useContextSelector(context, selector)
  }

  return [createProvider(Context.Provider), useContext]
}

function createProvider<Value>(Original: React.Provider<ContextValue<Value>>) {
  const Provider = (props: React.ProviderProps<Value>) => {
    const valueRef = useRef(props.value)

    const context = useRef<ContextValue<Value>>(null)

    if (!context.current) {
      context.current = {
        value: valueRef,
        listeners: new Set([]),
      }
    }

    useIsoLayoutEffect(() => {
      valueRef.current = props.value

      context.current?.listeners?.forEach((listener) => {
        listener(props.value)
      })
    }, [props.value])

    return createElement(Original, { value: context.current }, props.children)
  }

  return Provider as React.Provider<ContextValue<Value>>
}

function useContextSelector<Value, SelectedValue>(
  context: ContextValue<Value | undefined>,
  selector: ContextSelector<Value | undefined, SelectedValue>,
): SelectedValue {
  const { value: valueRef, listeners } = context

  const value = selector(valueRef.current)

  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  const selectorRef = useRef(selector)
  const lastValue = useRef(value)

  useIsoLayoutEffect(() => {
    selectorRef.current = selector
    lastValue.current = value
  })

  useIsoLayoutEffect(() => {
    const listener = (payload: Value) => {
      // Selectors can throw on transiently-inconsistent inputs (stale props vs. newer context value). Swallow so a
      // single consumer's throw doesn't abort the provider's `listeners.forEach`.
      try {
        const nextValue = selectorRef.current(payload)

        if (!Object.is(lastValue.current, nextValue)) {
          forceUpdate()
        }
      } catch {
        // ignored (stale props or similar — heals on the next parent-driven render)
      }
    }

    listeners.add(listener)

    return () => {
      if (listeners.has(listener)) {
        listeners.delete(listener)
      }
    }
  }, [listeners, valueRef])

  return value
}

function getErrorMessage(hook: string, provider: string) {
  return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`
}
