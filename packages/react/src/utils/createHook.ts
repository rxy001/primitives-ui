import type {
  MetadataProvider,
  MetadataState,
  WithMetadataResult,
  MetadataProps,
} from './metadata'
import type { HookProps, HTMLElements, Directory, HTMLProps } from './types'

type HookMetadataData<
  State extends MetadataState,
  HasProvider extends boolean,
> = { state: State } & (HasProvider extends true
  ? { provider: MetadataProvider }
  : {})

type HookResult<
  Props extends MetadataProps,
  State extends MetadataState,
  HasProvider extends boolean,
> = WithMetadataResult<Props, HookMetadataData<State, HasProvider>>

type HookImpl<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState,
  HasProvider extends boolean = false,
  Args extends unknown[] = [],
> = (
  props: HookProps<Element, OwnProps>,
  ...args: Args
) => HookResult<HTMLProps<Element>, State, HasProvider>

export type PolymorphicHookWithArgs<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState,
  HasProvider extends boolean = false,
  Args extends unknown[] = [],
> = <T extends HTMLElements = Element>(
  props: HookProps<T, OwnProps>,
  ...args: Args
) => HookResult<HTMLProps<T>, State, HasProvider>

export type PolymorphicHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState,
  HasProvider extends boolean = false,
> = <T extends HTMLElements = Element>(
  props: HookProps<T, OwnProps>,
) => HookResult<HTMLProps<T>, State, HasProvider>

type CreateHookResult<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState,
  HasProvider extends boolean,
  Args extends unknown[],
> = Args extends any[]
  ? Args['length'] extends 0
    ? PolymorphicHook<Element, OwnProps, State, HasProvider>
    : PolymorphicHookWithArgs<Element, OwnProps, State, HasProvider, Args>
  : never

export function createHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState,
  HasProvider extends boolean = false,
  Arg1 = never,
  Arg2 = never,
  Arg3 = never,
  Arg4 = never,
  Arg5 = never,
>(
  hook: HookImpl<
    Element,
    OwnProps,
    State,
    HasProvider,
    Filter<[Arg1, Arg2, Arg3, Arg4, Arg5]>
  >,
): CreateHookResult<
  Element,
  OwnProps,
  State,
  HasProvider,
  Filter<[Arg1, Arg2, Arg3, Arg4, Arg5]>
> {
  return hook as unknown as CreateHookResult<
    Element,
    OwnProps,
    State,
    HasProvider,
    Filter<[Arg1, Arg2, Arg3, Arg4, Arg5]>
  >
}

type Filter<T> = T extends [infer F, ...infer Rest]
  ? [F] extends [never]
    ? Filter<Rest>
    : [F, ...Filter<Rest>]
  : []
