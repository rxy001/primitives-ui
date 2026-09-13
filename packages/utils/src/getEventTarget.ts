export function getEventTarget(event: Event) {
  return event.target as Node | null
}
