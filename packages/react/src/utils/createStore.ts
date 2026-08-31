import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { __DEV__, isFunction } from '@primitives-ui/utils'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import type { Directory, Noop } from './types'

type Observer<State> = (
  state: Readonly<State>,
  previousState: Readonly<State>,
) => void

type Subscriber = () => void

export type StoreSelector<State, Value> = (state: Readonly<State>) => Value

type KeysAllowingUndefined<State> = {
  [Key in keyof State]-?: undefined extends State[Key] ? Key : never
}[keyof State]

type ControlledProp = {
  owner: object
  controlled: boolean
}

type StateUpdate<State> =
  | Partial<State>
  | ((state: Readonly<State>) => Partial<State>)

type SetState<State> = (update: StateUpdate<State>) => void

type SetContext<Context> = (context: Partial<Context>) => void

type StoreActions = Directory<Noop>

type UseSyncState<State> = <Key extends keyof State>(
  key: Key,
  value: State[Key],
) => void

type UseSyncContext<Context> = <Key extends keyof Context>(
  key: Key,
  value: Context[Key],
) => void

type UseSelector<State> = <Value>(
  selector: StoreSelector<State, Value>,
) => Value

type UseSyncStateWithCleanup<State> = <
  Key extends KeysAllowingUndefined<State>,
>(
  key: Key,
  value: State[Key],
) => void

type UseControlledState<State> = <Key extends keyof State>(
  key: Key,
  value?: State[Key],
) => void

type IsValueControlled<State> = (key: keyof State) => boolean

const STORE_INTERNAL_KEY: unique symbol = Symbol('STORE_INTERNAL_KEY')

const controlledPropsByStore = new WeakMap<
  object,
  Map<PropertyKey, ControlledProp>
>()

type StoreInternals<State, Context> = {
  commitState: SetState<State>
  commitContext: SetContext<Context>
  subscribe: (subscriber: Subscriber) => () => void
}

export type Store<State extends Directory, Context extends Directory = {}> = {
  getState: () => Readonly<State>
  getContext: () => Readonly<Context>
  getInitialState: () => Readonly<State>
  observe: (observer: Observer<State>) => () => void
}

export type BoundStore<
  State extends Directory,
  Context extends Directory = {},
  Actions extends StoreActions = {},
> = Store<State, Context> &
  Actions & {
    setState: SetState<State>
    setContext: SetContext<Context>
    useSelector: UseSelector<State>
    useSyncState: UseSyncState<State>
    useSyncStateWithCleanup: UseSyncStateWithCleanup<State>
    useControlledState: UseControlledState<State>
    useSyncContext: UseSyncContext<Context>
    isValueControlled: IsValueControlled<State>
  }

type StoreInstance<State extends Directory, Context extends Directory> = Store<
  State,
  Context
> & {
  readonly [STORE_INTERNAL_KEY]: StoreInternals<State, Context>
}

export type StoreScope<
  State extends Directory,
  Context extends Directory,
> = Store<State, Context> & {
  setState: SetState<State>
  setContext: SetContext<Context>
  isValueControlled: IsValueControlled<State>
}

type StoreOptions<State extends Directory, Context extends Directory> = {
  state: State
  context: Context
}

type UseStoreOptions<
  State extends Directory,
  Context extends Directory,
  Actions extends StoreActions,
> = StoreOptions<State, Context> & {
  actions?: (scope: StoreScope<State, Context>) => Actions
}

function getStoreInternals<State extends Directory, Context extends Directory>(
  store: Store<State, Context>,
) {
  const instance = store as StoreInstance<State, Context>
  const internals = instance[STORE_INTERNAL_KEY]

  if (!internals) {
    throw new Error('Invalid store. Stores must be created with createStore().')
  }

  return internals
}

function getControlledProps<State extends Directory, Context extends Directory>(
  store: Store<State, Context>,
) {
  const internals = getStoreInternals(store)
  let controlledProps = controlledPropsByStore.get(internals)

  if (!controlledProps) {
    controlledProps = new Map()
    controlledPropsByStore.set(internals, controlledProps)
  }

  return controlledProps as Map<keyof State, ControlledProp>
}

export function createStore<
  State extends Directory,
  Context extends Directory = {},
>(options: StoreOptions<State, Context>): Store<State, Context> {
  let { state, context } = options
  const initialState = state
  const subscribers = new Set<Subscriber>()
  const observers = new Set<Observer<State>>()
  const pendingUpdates: StateUpdate<State>[] = []

  const getState = () => state as Readonly<State>
  const getContext = () => context as Readonly<Context>
  const getInitialState = () => initialState as Readonly<State>

  const subscribe = (subscriber: Subscriber) => {
    subscribers.add(subscriber)
    return () => {
      subscribers.delete(subscriber)
    }
  }

  const observe = (observer: Observer<State>) => {
    observers.add(observer)
    return () => {
      observers.delete(observer)
    }
  }

  let isFlushing = false

  const commitState: SetState<State> = (update) => {
    pendingUpdates.push(update)

    if (isFlushing) {
      return
    }

    function workloop() {
      let updateIndex = 0
      let hasStateChanged = false

      while (updateIndex < pendingUpdates.length) {
        const queuedUpdate = pendingUpdates[updateIndex]
        updateIndex += 1

        const previousState = state

        const partial = isFunction(queuedUpdate)
          ? queuedUpdate(previousState)
          : queuedUpdate

        const patch: Partial<State> = {}

        Object.keys(partial).forEach((key: keyof State) => {
          const value = partial[key]

          if (!Object.is(previousState[key], value)) {
            patch[key] = value
          }
        })

        if (Object.keys(patch).length === 0) {
          continue
        }

        const nextState: State = {
          ...previousState,
          ...patch,
        }

        state = nextState
        hasStateChanged = true

        const observerSnapshot = Array.from(observers)

        observerSnapshot.forEach((observer) => {
          if (!observers.has(observer)) {
            return
          }
          observer(nextState, previousState)
        })
      }

      pendingUpdates.splice(0, updateIndex)

      if (!hasStateChanged) {
        return
      }

      const subscriberSnapshot = Array.from(subscribers)

      subscriberSnapshot.forEach((subscriber) => {
        if (!subscribers.has(subscriber)) {
          return
        }
        subscriber()
      })

      if (pendingUpdates.length > 0) {
        workloop()
      }
    }

    try {
      isFlushing = true
      workloop()
    } finally {
      pendingUpdates.splice(0, pendingUpdates.length)
      isFlushing = false
    }
  }

  const commitContext: SetContext<Context> = (partial) => {
    const patch: Partial<Context> = {}

    Object.keys(partial).forEach((key: keyof Context) => {
      const value = partial[key]

      if (!Object.is(context[key], value)) {
        patch[key] = value
      }
    })

    if (Object.keys(patch).length > 0) {
      context = {
        ...context,
        ...patch,
      }
    }
  }

  const internals: StoreInternals<State, Context> = {
    commitState,
    commitContext,
    subscribe,
  }

  const store: StoreInstance<State, Context> = {
    observe,
    getState,
    getContext,
    getInitialState,
    [STORE_INTERNAL_KEY]: internals,
  }

  return store
}

function useStore<
  State extends Directory,
  Context extends Directory,
  Actions extends StoreActions = {},
>(
  store: Store<State, Context>,
  createActions?: (scope: StoreScope<State, Context>) => Actions,
): BoundStore<State, Context, Actions> {
  const { commitState, commitContext: setContext } = getStoreInternals(store)
  const controlledProps = getControlledProps(store)

  const setState = useCallback<SetState<State>>(
    (update) => {
      commitState((currentState) => {
        const partial = isFunction(update) ? update(currentState) : update

        const patch: Partial<State> = {}

        Object.keys(partial).forEach((key: keyof State) => {
          const value = partial[key]

          if (Object.is(currentState[key], value)) {
            return
          }

          const controlledRegistration = controlledProps.get(key)

          if (controlledRegistration?.controlled) {
            return
          }

          patch[key] = value
        })

        return patch
      })
    },
    [commitState, controlledProps],
  )

  const isValueControlled = useCallback(
    (key: keyof State) => !!controlledProps.get(key)?.controlled,
    [controlledProps],
  )

  const scope = useMemo<StoreScope<State, Context>>(
    () => ({
      setState,
      setContext,
      isValueControlled,
      ...store,
    }),
    [setState, setContext, isValueControlled, store],
  )
  const actions = useMemo(
    () => createActions?.(scope) ?? ({} as Actions),
    [createActions, scope],
  )

  return useMemo(() => {
    const useSelector: UseSelector<State> = (selector) =>
      useStoreSelector(store, selector)
    const useSyncState: UseSyncState<State> = (key, value) =>
      useStoreSyncState(store, key, value)
    const useSyncStateWithCleanup: UseSyncStateWithCleanup<State> = (
      key,
      value,
    ) => useStoreSyncStateWithCleanup(store, key, value)
    const useControlledState: UseControlledState<State> = (key, value) =>
      useStoreControlledState(store, key, value)
    const useSyncContext: UseSyncContext<Context> = (key, value) =>
      useStoreSyncContext(store, key, value)

    return {
      ...store,
      ...actions,
      isValueControlled,
      setState,
      setContext,
      useSelector,
      useSyncState,
      useSyncStateWithCleanup,
      useControlledState,
      useSyncContext,
    }
  }, [actions, setContext, setState, isValueControlled, store])
}

function useStoreSelector<
  State extends Directory,
  Context extends Directory,
  Value,
>(store: Store<State, Context>, selector: StoreSelector<State, Value>): Value {
  const { subscribe } = getStoreInternals(store)

  const getServerSnapshot = useCallback(
    () => selector(store.getInitialState()),
    [selector, store],
  )

  const getSnapshot = useCallback(
    () => selector(store.getState()),
    [selector, store],
  )

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function useStoreSyncState<
  State extends Directory,
  Context extends Directory,
  Key extends keyof State,
>(store: Store<State, Context>, key: Key, value: State[Key]) {
  useIsoLayoutEffect(() => {
    if (!Object.is(store.getState()[key], value)) {
      const { commitState } = getStoreInternals(store)
      const patch: Partial<State> = {}
      patch[key] = value
      commitState(patch)
    }
  }, [key, store, value])
}

function useStoreSyncStateWithCleanup<
  State extends Directory,
  Context extends Directory,
  Key extends KeysAllowingUndefined<State>,
>(store: Store<State, Context>, key: Key, value: State[Key]) {
  useStoreSyncState(store, key, value)

  useIsoLayoutEffect(
    () => () => {
      const { commitState } = getStoreInternals(store)
      const patch: Partial<State> = {}
      patch[key] = undefined as State[Key]
      commitState(patch)
    },
    [store, key],
  )
}

function useStoreControlledState<
  State extends Directory,
  Context extends Directory,
  Key extends keyof State,
>(store: Store<State, Context>, key: Key, value?: State[Key]) {
  const ownerRef = useRef<object>({})
  const controlledProps = getControlledProps(store)

  const controlled = value !== undefined

  if (__DEV__) {
    const previousControlledRef = useRef(controlled)

    useEffect(() => {
      const previousControlled = previousControlledRef.current

      if (previousControlled !== controlled) {
        console.error(
          `Warning: A component changed from ${
            previousControlled ? 'controlled' : 'uncontrolled'
          } to ${controlled ? 'controlled' : 'uncontrolled'}.`,
        )
      }

      previousControlledRef.current = controlled
    }, [controlled])
  }

  useIsoLayoutEffect(() => {
    const existing = controlledProps.get(key)

    if (existing && existing.owner !== ownerRef.current) {
      if (__DEV__) {
        console.error(
          `Warning: Multiple components are controlling the "${String(
            key,
          )}" state of the same store. A store state key can only have one controlled owner. Create a separate store for each component root.`,
        )
      }

      return
    }

    const registration: ControlledProp = {
      owner: ownerRef.current,
      controlled,
    }

    controlledProps.set(key, registration)

    return () => {
      if (controlledProps.get(key) === registration) {
        controlledProps.delete(key)
      }
    }
  }, [controlled, controlledProps, key])

  useIsoLayoutEffect(() => {
    if (controlled && controlledProps.get(key)?.owner === ownerRef.current) {
      const { commitState } = getStoreInternals(store)
      const patch: Partial<State> = {}
      patch[key] = value
      commitState(patch)
    }
  }, [controlled, controlledProps, key, value])
}

function useStoreSyncContext<
  State extends Directory,
  Context extends Directory,
  Key extends keyof Context,
>(store: Store<State, Context>, key: Key, value: Context[Key]) {
  useIsoLayoutEffect(() => {
    if (!Object.is(store.getContext()[key], value)) {
      const { commitContext } = getStoreInternals(store)
      const patch: Partial<Context> = {}
      patch[key] = value
      commitContext(patch)
    }
  }, [key, store, value])
}

type UseStoreProps<State extends Directory, Context extends Directory> = {
  externalStore?: Store<State, Context>
  initialState?: Partial<State>
}

export function createUseStore<
  State extends Directory,
  Context extends Directory = {},
  Actions extends StoreActions = {},
>(createOptions: () => UseStoreOptions<State, Context, Actions>) {
  return (
    props: UseStoreProps<State, Context>,
  ): BoundStore<State, Context, Actions> => {
    const optionsRef = useRef<UseStoreOptions<State, Context, Actions>>(null)

    if (!optionsRef.current) {
      optionsRef.current = createOptions()
    }

    const options = optionsRef.current
    const { initialState, externalStore } = props

    const internalStoreRef = useRef<Store<State, Context>>(null)

    if (!externalStore && !internalStoreRef.current) {
      internalStoreRef.current = createStore({
        state: {
          ...options.state,
          ...initialState,
        },
        context: options.context,
      })
    }

    const store = externalStore ?? internalStoreRef.current!

    if (__DEV__) {
      const previousStoreRef = useRef(store)
      useEffect(() => {
        if (!Object.is(previousStoreRef.current, store)) {
          console.error(
            'Warning: A component changed the store passed to useStore after initialization. The store must remain stable for the lifetime of the component.',
          )
        }

        previousStoreRef.current = store
      }, [store])
    }

    return useStore(store, options.actions)
  }
}
