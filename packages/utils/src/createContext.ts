'use client'

import {
  createContext as createReactContext,
  useContext as useReactContext,
} from 'react'

interface CreateContextOptions<T> {
  contextName?: string
  hookName?: string
  defaultValue?: T
  strict?: boolean
}

export type CreateContextReturn<T> = [
  React.Provider<T>,
  () => T,
  React.Context<T | undefined>,
]

export function createContext<T>(
  options: CreateContextOptions<T> & { strict?: true },
): CreateContextReturn<T>
export function createContext<T>(
  options: CreateContextOptions<T> & { strict: false; defaultValue: T },
): CreateContextReturn<T>
export function createContext<T>(
  options: CreateContextOptions<T> & {
    strict: false
    defaultValue?: undefined
  },
): CreateContextReturn<T | undefined>
export function createContext<T>(options: CreateContextOptions<T>) {
  const {
    defaultValue,
    contextName,
    hookName = 'useContext',
    strict = true,
  } = options
  const Context = createReactContext<T | undefined>(defaultValue)

  Context.displayName = contextName

  function useContext() {
    const context = useReactContext(Context)

    if (context === undefined && strict) {
      const error = new Error(
        `${hookName} returned \`undefined\`. Seems you forgot to wrap component within ${contextName}.Provider`,
      )
      error.name = 'ContextError'
      throw error
    }

    return context
  }
  return [Context.Provider, useContext, Context]
}
