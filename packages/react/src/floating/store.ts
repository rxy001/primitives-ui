import type { CHANGE_REASONS, ChangeDetails, StoreSelector } from '../utils'

interface StoreContext {
  triggerElements: HTMLElement[]
}

interface StoreState {
  open: boolean
  openProp: boolean | undefined
  triggerId: string | undefined
  triggerIdProp: string | undefined
}

type OpenChangeDetails = ChangeDetails<
  CHANGE_REASONS['triggerPress'],
  {
    trigger?: HTMLElement | undefined
  }
>

export interface FloatingStore {
  useSelector<Value>(selector: StoreSelector<StoreState, Value>): Value
  getState: () => Readonly<StoreState>
  getContext: () => Readonly<StoreContext>
  open(details: OpenChangeDetails): void
  close(details: OpenChangeDetails): void
}

export const selectors = {
  open: (state: StoreState) => state.openProp ?? state.open,
  activeTriggerId: (state: StoreState) =>
    state.triggerIdProp ?? state.triggerId,
}
