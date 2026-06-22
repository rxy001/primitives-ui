import type {
  MetadataProvider,
  MetadataState,
  WithMetadataResult,
  MetadataProps,
} from './metadata'
import type { HookProps, HTMLElements, Directory } from './types'

type HookMetadataData<
  State extends MetadataState | undefined,
  HasProvider extends boolean,
> = ([NonNullable<State>] extends [never] ? {} : { state: State }) &
  (HasProvider extends true ? { provider: MetadataProvider } : {})

type HookResult<
  Props extends MetadataProps,
  State extends MetadataState | undefined,
  HasProvider extends boolean,
> = WithMetadataResult<Props, HookMetadataData<State, HasProvider>>

type HookImpl<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState | undefined = undefined,
  HasProvider extends boolean = false,
> = (
  props: HookProps<Element, OwnProps>,
) => HookResult<HookProps<Element, OwnProps>, State, HasProvider>

export type PolymorphicHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState | undefined = undefined,
  HasProvider extends boolean = false,
> = <T extends HTMLElements = Element>(
  props: HookProps<T, OwnProps>,
) => HookResult<HookProps<T, OwnProps>, State, HasProvider>

export function createHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
>(hook: HookImpl<Element, OwnProps>): PolymorphicHook<Element, OwnProps>
export function createHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
  HasProvider extends boolean = false,
>(
  hook: HookImpl<Element, OwnProps, undefined, HasProvider>,
): PolymorphicHook<Element, OwnProps, undefined, HasProvider>
export function createHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState,
>(
  hook: HookImpl<Element, OwnProps, State>,
): PolymorphicHook<Element, OwnProps, State>
export function createHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState,
  HasProvider extends boolean,
>(
  hook: HookImpl<Element, OwnProps, State, HasProvider>,
): PolymorphicHook<Element, OwnProps, State, HasProvider>
export function createHook<
  Element extends HTMLElements,
  OwnProps extends Directory,
  State extends MetadataState | undefined = undefined,
  HasProvider extends boolean = false,
>(
  hook: HookImpl<Element, OwnProps, State, HasProvider>,
): PolymorphicHook<Element, OwnProps, State, HasProvider> {
  return hook as unknown as PolymorphicHook<
    Element,
    OwnProps,
    State,
    HasProvider
  >
}
