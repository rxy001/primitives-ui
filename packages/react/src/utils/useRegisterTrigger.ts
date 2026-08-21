import { useEvent } from '@primitives-ui/hooks'
import { useRef } from 'react'
import type { StoreSelector } from './createStore'
import type { Trigger } from './resolveTrigger'
import { resolveTrigger } from './resolveTrigger'

type StoreState = {
  open: boolean
  activeTrigger: HTMLElement | undefined
  triggerProp: Trigger | undefined
}

type StoreContext = {
  triggerElements: HTMLElement[]
}

type UseRegisterTriggerProps = {
  store: {
    useSelector<Value>(selector: StoreSelector<StoreState, Value>): Value
    getContext: () => StoreContext
  }
}

const selectors = {
  open: (state: StoreState) => state.open,
  triggerProp: (state: StoreState) => state.triggerProp,
  activeTrigger: (state: StoreState) => state.activeTrigger,
}

export function useRegisterTrigger(props: UseRegisterTriggerProps) {
  const { store } = props
  const triggerRef = useRef<HTMLElement>(null)

  const open = store.useSelector(selectors.open)
  const triggerProp = store.useSelector(selectors.triggerProp)
  const activeTrigger = store.useSelector(selectors.activeTrigger)

  const register = useEvent((element: HTMLElement | null) => {
    const context = store.getContext()

    if (element === null) {
      const index = context.triggerElements.findIndex(
        (v) => v === triggerRef.current,
      )

      if (index >= 0) {
        context.triggerElements.splice(index, 1)
      }
    } else {
      context.triggerElements.push(element)
    }

    triggerRef.current = element
  })

  const isMountedByThisTrigger =
    open &&
    (resolveTrigger(triggerProp) ?? activeTrigger) === triggerRef.current

  return [isMountedByThisTrigger, register] as const
}
