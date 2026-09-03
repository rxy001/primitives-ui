import { Timeout } from '@primitives-ui/utils'
import type { PopupOpenChangeDetails, PopupStore } from './store'
import { CHANGE_REASONS, createChangeDetails } from '../createChangeDetails'
import { popupSelectors } from './store'

type UseTriggerClickProps = {
  store: PopupStore<PopupOpenChangeDetails<CHANGE_REASONS['triggerHover']>>
  onPointerEnter?: React.PointerEventHandler
  onPointerLeave?: React.PointerEventHandler
  openDelay?: number
  closeDelay?: number
}

class SharedContext {
  openChangeTimeout: Timeout

  constructor() {
    this.openChangeTimeout = Timeout.create()
  }

  clear() {
    this.openChangeTimeout.clear()
  }
}

function useSharedContext(store: PopupStore) {
  const context = store.getContext()
  if (!context.sharedContext) {
    // @ts-expect-error
    context.sharedContext = new SharedContext()
  }

  return context.sharedContext as SharedContext
}

export function useTriggerHover<P extends UseTriggerClickProps>({
  store,
  onPointerEnter,
  onPointerLeave,
  openDelay = 100,
  closeDelay = 100,
  ...props
}: P) {
  const open = store.useSelector(popupSelectors.open)
  const activeTriggerId = store.useSelector(popupSelectors.activeTriggerId)

  const sharedContext = useSharedContext(store)

  const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(event)

    sharedContext.openChangeTimeout.start(openDelay, () => {
      const details = createChangeDetails('trigger-hover', event.nativeEvent)

      store.open(details)
    })
  }

  const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(event)
  }

  return {
    ...props,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
  }
}
