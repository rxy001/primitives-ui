import { createContext } from '@primitives-ui/utils'
import type { PopupEntry } from './PopupManager'

export interface PopupContextValue {
  entry: PopupEntry
}

export const [PopupProvider, usePopupContext] =
  createContext<PopupContextValue>({
    contextName: 'PopupContext',
    hookName: 'usePopupContext',
    strict: false,
  })
