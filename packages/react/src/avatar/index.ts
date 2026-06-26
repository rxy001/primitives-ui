import { AvatarFallback, useAvatarFallback } from './AvatarFallback'
import { AvatarImage, useAvatarImage } from './AvatarImage'
import { AvatarRoot, useAvatarRoot } from './AvatarRoot'

const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
}

export { Avatar, useAvatarFallback, useAvatarImage, useAvatarRoot }

export type {
  UseAvatarRootProps,
  AvatarRootProps,
  AvatarRootState,
} from './AvatarRoot'
export type {
  UseAvatarImageProps,
  AvatarImageProps,
  AvatarImageState,
} from './AvatarImage'
export type {
  UseAvatarFallbackProps,
  AvatarFallbackProps,
  AvatarFallbackState,
} from './AvatarFallback'
