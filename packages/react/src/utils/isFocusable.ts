function isVisible(element: HTMLElement): boolean {
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility()
  }
  return (
    element.offsetWidth > 0 ||
    element.offsetHeight > 0 ||
    element.getClientRects().length > 0
  )
}

const focusableSelector =
  "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  'textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], ' +
  'summary, iframe, object, embed, area[href], audio[controls], ' +
  "video[controls], [contenteditable]:not([contenteditable='false'])"

export function isFocusable(element: HTMLElement): boolean {
  if (!element.matches(focusableSelector)) return false
  if (!isVisible(element)) return false
  if (element.closest('[inert]')) return false
  return true
}
