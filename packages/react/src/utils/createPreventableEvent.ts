import type { Directory } from './types'

export function createPreventableEvent<
  OriginalEvent extends Event,
  Detail extends Directory,
>(
  originalEvent: OriginalEvent,
  detail: Detail,
): PreventableEvent<OriginalEvent, Detail> {
  let prevented = originalEvent.defaultPrevented

  return {
    ...detail,
    originalEvent,
    get defaultPrevented() {
      return prevented
    },
    preventDefault() {
      prevented = true
    },
  }
}

export type PreventableEvent<
  OriginalEvent extends Event,
  Detail extends Directory,
> = Readonly<Detail> & {
  readonly originalEvent: OriginalEvent
  readonly defaultPrevented: boolean
  preventDefault(): void
}
