const EMPTY = 0 as unknown as NodeJS.Timeout

export class Timeout {
  static create() {
    return new Timeout()
  }

  currentId: NodeJS.Timeout = EMPTY

  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(fn: Function, delay: number) {
    this.clear()
    this.currentId = setTimeout(() => {
      this.currentId = EMPTY
      fn()
    }, delay)
  }

  isStarted() {
    return this.currentId !== EMPTY
  }

  clear = () => {
    if (this.currentId !== EMPTY) {
      clearTimeout(this.currentId)
      this.currentId = EMPTY
    }
  }
}
