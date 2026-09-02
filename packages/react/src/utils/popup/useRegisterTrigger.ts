import { useEvent } from '@primitives-ui/hooks'
import { useRef } from 'react'
import type { PopupStore } from './store'
import { popupSelectors } from './store'

type UseRegisterTriggerProps = {
  store: PopupStore
}

export function useRegisterTrigger(props: UseRegisterTriggerProps) {
  const { store } = props
  const triggerRef = useRef<HTMLElement>(null)

  const open = store.useSelector(popupSelectors.open)
  const activeTriggerId = store.useSelector(popupSelectors.activeTriggerId)

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
    open && activeTriggerId === triggerRef.current?.id

  return [isMountedByThisTrigger, register] as const
}
