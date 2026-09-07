import { Timeout } from '@primitives-ui/utils'
import type { PopupOpenChangeDetails, PopupStore } from './store'
import {
  CHANGE_REASONS,
  createChangeDetails,
} from '../utils/createChangeDetails'
import { popupSelectors } from './store'

type Store = PopupStore<PopupOpenChangeDetails<CHANGE_REASONS['triggerHover']>>

type UseHoverProps = {
  store: Store
  onMouseEnter?: React.MouseEventHandler
  onMouseLeave?: React.MouseEventHandler
  openDelay?: number
  closeDelay?: number
  disable?: boolean
}

class SharedContext {
  openChangeTimeout: Timeout
  closeDelay: number | undefined

  constructor() {
    this.openChangeTimeout = Timeout.create()
  }

  clear() {
    this.openChangeTimeout.clear()
  }
}

function useSharedContext(store: Store) {
  const context = store.getContext()
  if (!context.sharedContext.hover) {
    context.sharedContext.hover = new SharedContext()
  }

  return context.sharedContext.hover as SharedContext
}

export function useHover<P extends UseHoverProps>({
  store,
  disable,
  onMouseEnter,
  onMouseLeave,
  openDelay = 100,
  closeDelay = 100,
  ...props
}: P) {
  const open = store.useSelector(popupSelectors.open)
  const activeTriggerId = store.useSelector(popupSelectors.activeTriggerId)

  const sharedContext = useSharedContext(store)

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    onMouseEnter?.(event)
    sharedContext.openChangeTimeout.clear()

    if (disable) return

    const details = createChangeDetails(
      CHANGE_REASONS.triggerHover,
      event.nativeEvent,
      {
        trigger: event.currentTarget,
      },
    )

    sharedContext.closeDelay = closeDelay
    if (!open) {
      if (openDelay) {
        sharedContext.openChangeTimeout.start(() => {
          store.open(details)
        }, openDelay)
      } else {
        store.open(details)
      }

      return
    }

    const isOpenByThisTrigger = activeTriggerId === event.currentTarget.id
    if (!isOpenByThisTrigger) {
      store.open(details)
    }
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    onMouseLeave?.(event)
    sharedContext.openChangeTimeout.clear()

    if (!open || disable) {
      return
    }

    sharedContext.openChangeTimeout.clear()

    const details = createChangeDetails(
      CHANGE_REASONS.triggerHover,
      event.nativeEvent,
    )

    if (closeDelay) {
      sharedContext.openChangeTimeout.start(() => {
        store.close(details)
      }, closeDelay)
    } else {
      store.close(details)
    }
  }

  return {
    ...props,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }
}

type UseHoverPopupProps = {
  store: Store
  onMouseEnter?: React.MouseEventHandler
  onMouseLeave?: React.MouseEventHandler
}

export function useHoverPopup<Props extends UseHoverPopupProps>({
  store,
  onMouseEnter,
  onMouseLeave,
  ...props
}: Props) {
  const sharedContext = useSharedContext(store)

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    onMouseEnter?.(event)
    sharedContext.openChangeTimeout.clear()
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    onMouseLeave?.(event)

    if (!open) {
      return
    }

    const details = createChangeDetails(
      CHANGE_REASONS.triggerHover,
      event.nativeEvent,
    )

    if (sharedContext.closeDelay) {
      sharedContext.openChangeTimeout.start(() => {
        store.close(details)
      }, sharedContext.closeDelay)
    } else {
      sharedContext.openChangeTimeout.clear()
      store.close(details)
    }
  }

  return {
    ...props,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }
}
