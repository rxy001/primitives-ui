import type { Directory } from '../utils/types'

export const stateAttributesMapping = {
  open: (open: boolean): Directory<string> =>
    open ? { 'data-open': '' } : { 'data-closed': '' },
}
