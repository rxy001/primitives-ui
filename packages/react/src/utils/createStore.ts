import { useIsoLayoutEffect, useLatest } from '@primitives-ui/hooks'
import { __DEV__, isFunction } from '@primitives-ui/utils'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import type { Directory, Noop } from './types'

type Listener<T> = (state: T) => void

export type StoreSelector<State, Value> = (state: Readonly<State>) => Value

type KeysAllowingUndefined<State> = {
  [Key in keyof State]-?: undefined extends State[Key] ? Key : never
}[keyof State]

type ControlledProp = {
  owner: object
  controlled: boolean
  onChange?: (value: any) => void
}

type SetState<State> = (
  update: Partial<State> | ((state: Readonly<State>) => Partial<State>),
) => void

type SetContext<Context> = (context: Partial<Context>) => void

type StoreActions = Directory<Noop>

type SyncValue<State> = <Key extends keyof State>(
  key: Key,
  value: State[Key],
) => void

type UseSelector<State> = <Value>(
  selector: StoreSelector<State, Value>,
) => Value

type UseSyncValueWithCleanup<State> = <
  Key extends KeysAllowingUndefined<State>,
>(
  key: Key,
  value: State[Key],
) => void

type UseControlledValue<State> = <
  Key extends keyof State,
  onChange extends (value: State[Key], ...rest: any[]) => void,
>(
  key: Key,
  value?: State[Key],
  onChange?: onChange,
) => void

const STORE_HANDLE_KEY: unique symbol = Symbol('STORE_HANDLE_KEY')
const STORE_INTERNAL_KEY: unique symbol = Symbol('STORE_INTERNAL_KEY')

const controlledPropsByStore = new WeakMap<
  object,
  Map<PropertyKey, ControlledProp>
>()

type StoreInternals<State, Context> = {
  commitState: SetState<State>
  commitContext: SetContext<Context>
}

export type Store<State extends Directory, Context extends Directory = {}> = {
  readonly [STORE_HANDLE_KEY]: true
  getState: () => Readonly<State>
  getContext: () => Readonly<Context>
  subscribe: (listener: Listener<State>) => () => void
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
    useSyncValue: SyncValue<State>
    useSyncValueWithCleanup: UseSyncValueWithCleanup<State>
    useControlledValue: UseControlledValue<State>
  }

type StoreInstance<State extends Directory, Context extends Directory> = Store<
  State,
  Context
> & {
  readonly [STORE_INTERNAL_KEY]: StoreInternals<State, Context>
}

export type StoreScope<State extends Directory, Context extends Directory> = {
  getState: () => Readonly<State>
  getContext: () => Readonly<Context>
  setState: SetState<State>
  setContext: SetContext<Context>
}

type StoreOptions<State extends Directory, Context extends Directory> = {
  state: State
  context?: Context
}

type StoreHookOptions<
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
  let state = options.state
  let context = (options.context ?? {}) as Context
  const listeners = new Set<Listener<State>>()

  const getState = () => state as Readonly<State>
  const getContext = () => context as Readonly<Context>

  const subscribe = (listener: Listener<State>) => {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }

  const commitState: SetState<State> = (update) => {
    const partial = isFunction(update) ? update(state) : update
    const patch: Partial<State> = {}

    Object.keys(partial).forEach((key: keyof State) => {
      const value = partial[key]

      if (!Object.is(state[key], value)) {
        patch[key] = value
      }
    })

    if (Object.keys(patch).length > 0) {
      state = {
        ...state,
        ...patch,
      }
      const lastState = { ...state }
      listeners.forEach((listener) => listener(lastState))
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
  }

  const store: StoreInstance<State, Context> = {
    getState,
    getContext,
    subscribe,
    [STORE_HANDLE_KEY]: true,
    [STORE_INTERNAL_KEY]: internals,
  }

  return store
}

export function useStore<
  State extends Directory,
  Context extends Directory,
  Actions extends StoreActions = {},
>(
  store: Store<State, Context>,
  createActions?: (scope: StoreScope<State, Context>) => Actions,
): BoundStore<State, Context, Actions> {
  const { commitState, commitContext } = getStoreInternals(store)
  const controlledProps = getControlledProps(store)
  const setState = useCallback<SetState<State>>(
    (update) => {
      const state = store.getState()
      const partial = isFunction(update) ? update(state) : update
      const patch: Partial<State> = {}
      const callbacks: Array<() => void> = []

      Object.keys(partial).forEach((key: keyof State) => {
        const value = partial[key]

        if (!Object.is(state[key], value)) {
          const controlledProp = controlledProps.get(key)

          if (!controlledProp?.controlled) {
            patch[key] = value
          }

          if (controlledProp?.onChange) {
            callbacks.push(() => {
              controlledProp.onChange?.(value)
            })
          }
        }
      })

      commitState(patch)

      // Avoid calling setState repeatedly inside onChange to prevent data
      // inconsistency.
      callbacks.forEach((callback) => callback())
    },
    [commitState, controlledProps, store],
  )

  const scope = useMemo<StoreScope<State, Context>>(
    () => ({
      getState: store.getState,
      getContext: store.getContext,
      setState,
      setContext: commitContext,
    }),
    [commitContext, setState, store],
  )
  const actions = useMemo(
    () => createActions?.(scope) ?? ({} as Actions),
    [createActions, scope],
  )

  return useMemo(() => {
    const useSelector: UseSelector<State> = (selector) =>
      useStoreSelector(store, selector)
    const useSyncValue: SyncValue<State> = (key, value) =>
      useStoreSyncValue(store, commitState, key, value)
    const useSyncValueWithCleanup: UseSyncValueWithCleanup<State> = (
      key,
      value,
    ) => useStoreSyncValueWithCleanup(store, commitState, key, value)
    const useControlledValue: UseControlledValue<State> = (
      key,
      value,
      onChange,
    ) =>
      useStoreControlledValue(
        commitState,
        controlledProps,
        key,
        value,
        onChange,
      )

    return {
      ...store,
      ...actions,
      setState,
      setContext: commitContext,
      useSelector,
      useSyncValue,
      useSyncValueWithCleanup,
      useControlledValue,
    }
  }, [actions, commitContext, commitState, controlledProps, setState, store])
}

function useStoreSelector<
  State extends Directory,
  Context extends Directory,
  Value,
>(store: Store<State, Context>, selector: StoreSelector<State, Value>): Value {
  const getSelectedSnapshot = useCallback(
    () => selector(store.getState()),
    [selector, store],
  )

  return useSyncExternalStore(
    store.subscribe,
    getSelectedSnapshot,
    getSelectedSnapshot,
  )
}

function useStoreSyncValue<
  State extends Directory,
  Context extends Directory,
  Key extends keyof State,
>(
  store: Store<State, Context>,
  commitState: SetState<State>,
  key: Key,
  value: State[Key],
) {
  useIsoLayoutEffect(() => {
    if (!Object.is(store.getState()[key], value)) {
      const patch: Partial<State> = {}
      patch[key] = value
      commitState(patch)
    }
  }, [commitState, key, store, value])
}

function useStoreSyncValueWithCleanup<
  State extends Directory,
  Context extends Directory,
  Key extends KeysAllowingUndefined<State>,
>(
  store: Store<State, Context>,
  commitState: SetState<State>,
  key: Key,
  value: State[Key],
) {
  useStoreSyncValue(store, commitState, key, value)

  useIsoLayoutEffect(
    () => () => {
      const patch: Partial<State> = {}
      patch[key] = undefined as State[Key]
      commitState(patch)
    },
    [commitState, key],
  )
}

function useStoreControlledValue<
  State extends Directory,
  Key extends keyof State,
>(
  commitState: SetState<State>,
  controlledProps: Map<keyof State, ControlledProp>,
  key: Key,
  value?: State[Key],
  onChange?: (value: State[Key]) => void,
) {
  const onChangeRef = useLatest(onChange)
  const ownerRef = useRef<object>(null)

  if (!ownerRef.current) {
    ownerRef.current = {}
  }

  const owner = ownerRef.current
  const callback = useCallback(
    (nextValue: State[Key]) => onChangeRef.current?.(nextValue),
    [onChangeRef],
  )
  const controlled = value !== undefined
  const previousControlledRef = useRef(controlled)

  useIsoLayoutEffect(() => {
    const existing = controlledProps.get(key)

    if (existing && existing.owner !== owner) {
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
      owner,
      controlled,
      onChange: callback,
    }

    controlledProps.set(key, registration)

    return () => {
      if (controlledProps.get(key) === registration) {
        controlledProps.delete(key)
      }
    }
  }, [callback, controlled, controlledProps, key, owner])

  useIsoLayoutEffect(() => {
    if (controlled && controlledProps.get(key)?.owner === owner) {
      const patch: Partial<State> = {}
      patch[key] = value
      commitState(patch)
    }
  }, [commitState, controlled, controlledProps, key, owner, value])

  if (__DEV__) {
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
}

type UseStoreProps<State extends Directory, Context extends Directory> = {
  externalStore?: Store<State, Context>
  initialState?: Partial<State>
}

export function createStoreHook<
  State extends Directory,
  Context extends Directory = {},
  Actions extends StoreActions = {},
>(createOptions: () => StoreHookOptions<State, Context, Actions>) {
  return function useCreatedStore(
    props?: UseStoreProps<State, Context>,
  ): BoundStore<State, Context, Actions> {
    const optionsRef = useRef<StoreHookOptions<State, Context, Actions>>(null)

    if (!optionsRef.current) {
      optionsRef.current = createOptions()
    }

    const options = optionsRef.current
    const externalStore = props?.externalStore
    const internalStoreRef = useRef<Store<State, Context>>(null)

    if (!externalStore && !internalStoreRef.current) {
      internalStoreRef.current = createStore({
        state: {
          ...options.state,
          ...props?.initialState,
        },
        context: options.context,
      })
    }

    const store = externalStore ?? internalStoreRef.current!
    const previousStoreRef = useRef(store)

    if (__DEV__) {
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
