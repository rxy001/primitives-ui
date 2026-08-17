// oxlint-disable react-hooks/exhaustive-deps
import { useIsoLayoutEffect } from '@primitives-ui/hooks'
import { ownerDocument, ownerWindow } from '@primitives-ui/utils'

interface ScrollLockState {
  count: number
  originalStyles: {
    overflow: string
    overflowX: string
    overflowY: string
    paddingInlineEnd: string
    scrollbarGutter: string
  }
}

function createScrollLockState() {
  return {
    count: 1,
    originalStyles: {
      overflow: '',
      overflowX: '',
      overflowY: '',
      paddingInlineEnd: '',
      scrollbarGutter: '',
    },
  }
}

const scrollLockStateByDocument = new WeakMap<Document, ScrollLockState>()

export function useScrollLock(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useIsoLayoutEffect(() => {
    if (enabled && ref.current) {
      const doc = ownerDocument(ref.current)
      const html = doc.documentElement
      const win = ownerWindow(html)
      {
        let lockState = scrollLockStateByDocument.get(doc)

        if (!lockState) {
          const bodyStyles = win.getComputedStyle(doc.body)
          const htmlStyles = win.getComputedStyle(html)

          // If the site author already hid overflow on <html>, respect it and bail out.
          if (
            htmlStyles.overflowY === 'hidden' ||
            htmlStyles.overflowY === 'clip'
          ) {
            return
          }

          lockState = createScrollLockState()

          scrollLockStateByDocument.set(doc, lockState)

          lockState.originalStyles.overflow = doc.body.style.overflow
          lockState.originalStyles.overflowX = doc.body.style.overflowX
          lockState.originalStyles.overflowY = doc.body.style.overflowY
          lockState.originalStyles.paddingInlineEnd =
            doc.body.style.paddingInlineEnd

          lockState.originalStyles.scrollbarGutter = html.style.scrollbarGutter

          // Is vertical scrollbar displayed?
          if (isOverflowing(doc.body)) {
            // Avoid scroll content jumping.
            const isSupportScrollbarGutter =
              win.CSS?.supports?.('scrollbar-gutter', 'stable') ?? false

            if (isSupportScrollbarGutter) {
              html.style.scrollbarGutter = 'stable'
            } else {
              const scrollBarWidth = getScrollBarWidth(doc.body)

              doc.body.style.paddingInlineEnd = `${parseFloat(bodyStyles.paddingInlineEnd || '0') + scrollBarWidth}px`
            }
          }
          doc.body.style.overflow = 'hidden'
        } else {
          lockState.count += 1
        }
      }

      return () => {
        const lockState = scrollLockStateByDocument.get(doc)

        if (!lockState) return

        lockState.count -= 1

        if (lockState.count === 0) {
          const styles = lockState.originalStyles
          doc.body.style.overflow = styles.overflow
          doc.body.style.overflowX = styles.overflowX
          doc.body.style.overflowY = styles.overflowY
          doc.body.style.paddingInlineEnd = styles.paddingInlineEnd
          html.style.scrollbarGutter = styles.scrollbarGutter

          scrollLockStateByDocument.delete(doc)
        }
      }
    }
  }, [enabled, ref])
}

function isOverflowing(container: Element): boolean {
  const doc = ownerDocument(container)

  if (doc.body === container) {
    return ownerWindow(container).innerWidth > doc.documentElement.clientWidth
  }

  return container.scrollHeight > container.clientHeight
}

export function getScrollBarWidth(container: HTMLElement): number {
  const doc = ownerDocument(container)
  const win = ownerWindow(container)

  if (doc.body === container) {
    return Math.max(0, win.innerWidth - doc.documentElement.clientWidth)
  }

  return container.offsetWidth - container.clientWidth
}
