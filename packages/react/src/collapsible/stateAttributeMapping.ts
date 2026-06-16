import { Directory } from '../utils/types'

export const openStateAttributeMapping = (open: boolean): Directory<string> =>
  open ? { 'data-open': '' } : { 'data-closed': '' }
