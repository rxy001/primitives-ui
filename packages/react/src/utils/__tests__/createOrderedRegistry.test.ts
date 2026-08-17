import { createOrderedRegistry } from '../createOrderedRegistry'

interface Entry {
  name: string
  parent?: Entry
  elementRef: React.RefObject<HTMLElement | null>
}

function createEntry(name: string, parent?: Entry): Entry {
  return {
    name,
    parent,
    elementRef: { current: document.createElement('div') },
  }
}

describe('createOrderedRegistry', () => {
  it('stores the topmost entry first', () => {
    const registry = createOrderedRegistry<Entry>()
    const first = createEntry('first')
    const second = createEntry('second')

    registry.register(first)
    registry.register(second)

    expect(registry.getEntries()).toEqual([second, first])
    expect(registry.getTopmost()).toBe(second)
  })

  it('stores children before parents', () => {
    const registry = createOrderedRegistry<Entry>()
    const parent = createEntry('parent')
    const child = createEntry('child', parent)

    registry.register(parent)
    registry.register(child)

    expect(registry.getEntries()).toEqual([child, parent])
  })

  it('reserves a parent position when children register first', () => {
    const registry = createOrderedRegistry<Entry>()
    const previous = createEntry('previous')
    const parent = createEntry('parent')
    const firstChild = createEntry('first child', parent)
    const secondChild = createEntry('second child', parent)

    registry.register(previous)
    registry.register(firstChild)
    registry.register(secondChild)
    registry.register(parent)

    expect(registry.getEntries()).toEqual([
      secondChild,
      firstChild,
      parent,
      previous,
    ])
  })

  it('reserves a parent position before the parent ref is attached', () => {
    const registry = createOrderedRegistry<Entry>()
    const parent = createEntry('parent')
    const child = createEntry('child', parent)
    parent.elementRef.current = null

    registry.register(child)
    parent.elementRef.current = document.createElement('div')
    registry.register(parent)

    expect(registry.getEntries()).toEqual([child, parent])
    expect(registry.getTopmost()).toBe(child)
  })

  it('keeps a reserved parent position when an earlier entry unregisters', () => {
    const registry = createOrderedRegistry<Entry>()
    const first = createEntry('first')
    const second = createEntry('second')
    const parent = createEntry('parent')
    const child = createEntry('child', parent)

    registry.register(first)
    registry.register(second)
    registry.register(child)
    registry.unregister(second)
    registry.register(parent)

    expect(registry.getEntries()).toEqual([child, parent, first])
  })
})
