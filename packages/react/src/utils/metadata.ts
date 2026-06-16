import type { Directory } from './types'

const METADATA_STATE = '__metadata-state__'

const METADATA_PROVIDER = '__metadata-provider__'

export type MetadataProvider = (element: React.ReactNode) => React.ReactNode

export type MetadataState = Directory

type MetadataStateProps<State extends MetadataState | undefined> = [
  NonNullable<State>,
] extends [never]
  ? {}
  : { [METADATA_STATE]: State }

type MetadataProviderProps<Provider extends MetadataProvider | undefined> = [
  NonNullable<Provider>,
] extends [never]
  ? {}
  : { [METADATA_PROVIDER]: Provider }

export type MetadataData = {
  state?: MetadataState
  provider?: MetadataProvider
}

export type InferMetadataStateFromProps<Props extends MetadataProps> =
  Props extends {
    [METADATA_STATE]: infer State
  }
    ? NonNullable<State>
    : undefined

export type InferMetadataStateFromData<Data extends MetadataData> =
  Data extends {
    state: infer State
  }
    ? NonNullable<State>
    : undefined

type MergeMetadataState<
  Previous extends MetadataState | undefined,
  Current extends MetadataState | undefined,
> = [Previous] extends [undefined]
  ? Current
  : [Current] extends [undefined]
    ? Previous
    : Previous & Current

type InferMetadataProviderFromData<Data extends MetadataData> = Data extends {
  provider: infer Provider
}
  ? Provider
  : undefined

type InferMetadataProviderFromProps<Props extends MetadataProps> =
  Props extends {
    [METADATA_PROVIDER]: infer Provider
  }
    ? Provider
    : undefined

export type MetadataProps<
  Props extends Directory = Directory,
  State extends MetadataState = MetadataState,
  Provider extends MetadataProvider = MetadataProvider,
> = Props & {
  [METADATA_PROVIDER]?: Provider
  [METADATA_STATE]?: State
}

type MetadataElementProps<Props extends MetadataProps> = Omit<
  Props,
  typeof METADATA_STATE | typeof METADATA_PROVIDER
>

export type WithMetadataResult<
  Props extends MetadataProps,
  Data extends MetadataData,
> = MetadataElementProps<Props> &
  MetadataStateProps<
    MergeMetadataState<
      InferMetadataStateFromProps<Props>,
      InferMetadataStateFromData<Data>
    >
  > &
  MetadataProviderProps<
    InferMetadataProviderFromProps<Props> | InferMetadataProviderFromData<Data>
  >

export function withMetadata<
  Props extends MetadataProps,
  Data extends MetadataData,
>(props: Props, metadata: Data): WithMetadataResult<Props, Data> {
  const previousState = getMetadataState(props)
  const previousProvider = getMetadataProvider(props)
  const nextState = mergeState(previousState, metadata.state)
  const nextProvider = mergeProvider(previousProvider, metadata.provider)

  const nextProps = { ...props }

  if (nextState) {
    nextProps[METADATA_STATE] = nextState
  }

  if (nextProvider) {
    nextProps[METADATA_PROVIDER] = nextProvider
  }

  return nextProps as unknown as WithMetadataResult<Props, Data>
}

export function getMetadataState<Props extends MetadataProps>(
  props: Props,
): InferMetadataStateFromProps<Props>
export function getMetadataState(
  props: MetadataProps,
): MetadataState | undefined {
  return props[METADATA_STATE]
}

export function getMetadataProvider<Props extends MetadataProps>(
  props: Props,
): InferMetadataProviderFromProps<Props>
export function getMetadataProvider(
  props: MetadataProps,
): MetadataProvider | undefined {
  return props[METADATA_PROVIDER]
}

export function getMetadataProps<Props extends MetadataProps>(
  props: Props,
): MetadataElementProps<Props> {
  const {
    [METADATA_STATE]: _,
    [METADATA_PROVIDER]: __,
    ...elementProps
  } = props

  return elementProps
}

function mergeState(previous?: MetadataState, current?: MetadataState) {
  if (previous == null) return current
  if (current == null) return previous

  return {
    ...previous,
    ...current,
  }
}

function mergeProvider(
  previous?: MetadataProvider,
  current?: MetadataProvider,
) {
  if (!previous) return current
  if (!current) return previous

  return (element: React.ReactNode) => current(previous(element))
}
