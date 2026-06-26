import { createContext } from '@primitives-ui/utils'

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarRootContextValue {
  imageLoadingStatus: ImageLoadingStatus
  setImageLoadingStatus: React.Dispatch<
    React.SetStateAction<ImageLoadingStatus>
  >
  state: {
    imageLoadingStatus: ImageLoadingStatus
  }
}

export const [AvatarRootProvider, useAvatarRootContext] =
  createContext<AvatarRootContextValue>({
    contextName: 'AvatarRootContext',
    hookName: 'useAvatarRootContext',
    providerName: 'AvatarRootProvider',
    strict: true,
  })
