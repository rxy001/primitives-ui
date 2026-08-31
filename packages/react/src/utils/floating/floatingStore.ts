import type { CHANGE_REASONS, ChangeDetails } from '../createChangeDetails'
import type { StoreSelector } from '../createStore'

export interface StoreContext {
  triggerElements: HTMLElement[]
}

export interface StoreState {
  open: boolean
  openProp: boolean | undefined
  triggerId: string | undefined
  triggerIdProp: string | undefined
}

type OpenChangeReason = ChangeDetails<
  CHANGE_REASONS['triggerPress'],
  {
    trigger?: HTMLElement | undefined
  }
>

export interface FloatingStore {
  useSelector<Value>(selector: StoreSelector<StoreState, Value>): Value
  getState: () => Readonly<StoreState>
  getContext: () => Readonly<StoreContext>
  open(details: OpenChangeReason): void
  close(details: OpenChangeReason): void
}

export const selectors = {
  open: (state: StoreState) => state.openProp ?? state.open,
  activeTriggerId: (state: StoreState) =>
    state.triggerIdProp ?? state.triggerId,
}
