'use client'

import {
  createContext as createReactContext,
  useContext as useReactContext,
} from 'react'

interface CreateContextOptions<T> {
  contextName?: string
  hookName?: string
  providerName?: string
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
    providerName = 'Provider',
    strict = true,
  } = options
  const Context = createReactContext<T | undefined>(defaultValue)

  Context.displayName = contextName

  function useContext() {
    const context = useReactContext(Context)

    if (context === undefined && strict) {
      const error = new Error(getErrorMessage(hookName, providerName))
      error.name = 'ContextError'
      throw error
    }

    return context
  }

  return [Context.Provider, useContext, Context]
}

function getErrorMessage(hook: string, provider: string) {
  return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`
}
