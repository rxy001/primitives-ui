import type { StoreSelector } from '../createStore'

interface StoreContext {
  triggerElements: HTMLElement[]
}

interface StoreState {
  open: boolean
  openProp: boolean | undefined
  triggerId: string | undefined
  triggerIdProp: string | undefined
}

export interface FloatingStore {
  useSelector<Value>(selector: StoreSelector<StoreState, Value>): Value
  getState: () => Readonly<StoreState>
  getContext: () => Readonly<StoreContext>
}

export const selectors = {
  open: (state: StoreState) => state.openProp ?? state.open,
  activeTriggerId: (state: StoreState) =>
    state.triggerIdProp ?? state.triggerId,
}
