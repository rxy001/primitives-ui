import type { CHANGE_REASONS, ChangeDetails } from '../createChangeDetails'
import type { StoreSelector } from '../createStore'

export type StoreContext = {
  triggerElements: HTMLElement[]
}

export type StoreState = {
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

export type FloatingStore = {
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
