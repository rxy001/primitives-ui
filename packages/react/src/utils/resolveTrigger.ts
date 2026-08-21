import { isFunction } from '@primitives-ui/utils'

export type Trigger =
  | null
  | HTMLElement
  | (() => HTMLElement | null | void)
  | React.RefObject<HTMLElement | null>

export function resolveTrigger(value: Trigger | undefined): HTMLElement | null {
  let trigger = isFunction(value) ? value() : value

  if (trigger == null) return null

  if ('current' in trigger) {
    trigger = trigger.current
  }

  if (!trigger?.isConnected) {
    return null
  }

  return trigger
}
