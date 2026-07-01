import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { useCallback, useSyncExternalStore } from 'react'
import type { Directory } from './types'

type StoreSelector<State, Value = any> = (state: State) => Value

type Listener<State> = (state: State) => void

type Options<
  State extends Directory,
  Context extends Directory,
  Selectors extends Directory<StoreSelector<State>>,
> = {
  state: State
  context?: Context
  selectors?: Selectors
}

type Store<
  State extends Directory,
  Context extends Directory = Record<string, never>,
  Selectors extends Directory<StoreSelector<State>> = Record<string, never>,
> = {
  getSnapshot: () => State
  setState: (nextState: State) => void
  subscribe: (listener: Listener<State>) => () => void
  useSelector: <Key extends keyof Selectors>(
    key: Key,
  ) => ReturnType<Selectors[Key]>
  useSyncedValue: <Key extends keyof State>(key: Key, value: State[Key]) => void
  useSyncedValueWithCleanup: <Key extends keyof State>(
    key: Key,
    value: State[Key],
  ) => void
}

function useStoreSelector<State extends Directory, Value>(
  store: Pick<Store<State>, 'getSnapshot' | 'subscribe'>,
  selector: StoreSelector<State, Value>,
) {
  const getSnapshot = useCallback(
    () => selector(store.getSnapshot()),
    [store, selector],
  )

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}

export function createStore<
  State extends Directory,
  Context extends Directory,
  Selectors extends Directory<StoreSelector<State>>,
>(
  options: Options<State, Context, Selectors>,
): Store<State, Context, Selectors> {
  let state = { ...options.state }

  const listeners = new Set<Listener<State>>()

  const setState = (nextState: State) => {
    if (Object.is(state, nextState)) return

    if (
      !Object.keys(nextState).some(
        (key) => !Object.is(nextState[key], state[key]),
      )
    ) {
      return
    }

    state = {
      ...state,
      ...nextState,
    }
    listeners.forEach((listener) => listener({ ...state }))
  }

  const getSnapshot = () => ({ ...state })

  const subscribe = (listener: Listener<State>) => {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }

  const useSelector = <Key extends keyof Selectors>(key: Key) =>
    useStoreSelector<State, ReturnType<Selectors[Key]>>(
      {
        getSnapshot,
        subscribe,
      },
      options.selectors![key],
    )

  const useSyncedValue = <Key extends keyof State>(
    key: Key,
    value: State[Key],
  ) => {
    useIsoLayoutEffect(() => {
      if (state[key] !== value) {
        setState({
          ...state,
          [key]: value,
        })
      }
    }, [key, value, state])
  }

  const useSyncedValueWithCleanup = <Key extends keyof State>(
    key: Key,
    value: State[Key],
  ) => {
    useIsoLayoutEffect(() => {
      if (state[key] !== value) {
        setState({
          ...state,
          [key]: value,
        })
      }

      return () => {
        setState({
          ...state,
          [key]: undefined,
        })
      }
    }, [key, value, state])
  }

  return {
    setState,
    getSnapshot,
    subscribe,
    useSelector,
    useSyncedValue,
    useSyncedValueWithCleanup,
  }
}
