/**
 * Stores entries in topmost-first, child-before-parent order.
 *
 * Unrelated entries are ordered from most to least recently registered. Parent
 * positions may be reserved when React layout effects register children before
 * their parents.
 */

export type OrderedRegistryEntry<Entry> = {
  parent?: Entry
  elementRef: React.RefObject<HTMLElement | null>
}

export class OrderedRegistry<Entry extends OrderedRegistryEntry<Entry>> {
  readonly #entries: Entry[] = []
  readonly #pendingEntryIndex = new Map<Entry, number>()
  readonly #registeredParent = new WeakMap<Entry, Entry>()

  getEntries(): readonly Entry[] {
    return this.#entries
  }

  getSize() {
    return this.#entries.length
  }

  getTopmost() {
    return this.#entries[0]
  }

  #resolveParent(entry?: Entry) {
    const parent = entry?.parent
    const element = entry?.elementRef.current
    const parentElement = parent?.elementRef.current

    if (
      !parent ||
      !element ||
      (parentElement && element.ownerDocument !== parentElement.ownerDocument)
    ) {
      return undefined
    }

    return parent
  }

  register(entry: Entry) {
    if (this.#entries.includes(entry)) {
      return false
    }

    const parent = this.#resolveParent(entry)

    if (parent) {
      this.#registeredParent.set(entry, parent)
    }

    const insertionIndex = this.#pendingEntryIndex.get(entry) ?? 0

    this.#pendingEntryIndex.forEach((index, pendingEntry) => {
      if (pendingEntry !== entry && index >= insertionIndex) {
        this.#pendingEntryIndex.set(pendingEntry, index + 1)
      }
    })

    this.#entries.splice(insertionIndex, 0, entry)
    this.#pendingEntryIndex.delete(entry)

    if (
      parent &&
      !this.#entries.includes(parent) &&
      !this.#pendingEntryIndex.has(parent)
    ) {
      this.#pendingEntryIndex.set(parent, insertionIndex + 1)
    }

    return true
  }

  unregister(entry: Entry) {
    const index = this.#entries.lastIndexOf(entry)

    if (index === -1) {
      return false
    }

    const parent = this.#registeredParent.get(entry)

    this.#entries.splice(index, 1)
    this.#pendingEntryIndex.delete(entry)
    this.#registeredParent.delete(entry)

    this.#pendingEntryIndex.forEach((pendingIndex, pendingEntry) => {
      if (pendingIndex > index) {
        this.#pendingEntryIndex.set(pendingEntry, pendingIndex - 1)
      }
    })

    if (
      parent &&
      !this.#entries.includes(parent) &&
      !this.#entries.some(
        (candidate) => this.#registeredParent.get(candidate) === parent,
      )
    ) {
      this.#pendingEntryIndex.delete(parent)
    }

    return true
  }
}

export function createOrderedRegistry<
  Entry extends OrderedRegistryEntry<Entry>,
>() {
  return new OrderedRegistry<Entry>()
}
