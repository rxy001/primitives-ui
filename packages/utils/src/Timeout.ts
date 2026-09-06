export class Timeout {
  static create() {
    return new Timeout()
  }

  #currentId: ReturnType<typeof globalThis.setTimeout> | undefined

  start(fn: () => void, delay: number) {
    this.clear()

    this.#currentId = globalThis.setTimeout(() => {
      this.#currentId = undefined
      fn()
    }, delay)
  }

  isStarted() {
    return this.#currentId !== undefined
  }

  clear = () => {
    if (this.#currentId === undefined) {
      return
    }

    globalThis.clearTimeout(this.#currentId)
    this.#currentId = undefined
  }
}
