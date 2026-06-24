import type { CollectionStoreItem } from '@primitives-ui/react'
import type { Meta } from '@storybook/react-vite'
import { Collection, useCollectionStore } from '@primitives-ui/react'
import { useEffect, useState } from 'react'

const meta = {
  title: 'Components/Collection',
} satisfies Meta

export default meta

export function Default() {
  const collection = useCollectionStore()

  useEffect(() => {
    console.log(collection.getItems())
  }, [collection])

  return (
    <Collection.Root store={collection}>
      <Collection.Item>Item 1</Collection.Item>
      <Collection.Item>Item 2</Collection.Item>
      <Collection.Item>Item 3</Collection.Item>
    </Collection.Root>
  )
}

export function Controlled() {
  const [count, setCount] = useState(3)
  const [items, setItems] = useState<CollectionStoreItem[]>([])
  const collection = useCollectionStore({
    items,
    onItemsChange: setItems,
  })

  useEffect(() => {
    console.log(items)
  }, [items])

  return (
    <>
      <div className='flex gap-3'>
        <button onClick={() => setCount((prev) => Math.max(prev - 1, 0))}>
          Decrement
        </button>
        <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
      </div>
      <Collection.Root store={collection}>
        {Array(count)
          .fill(0)
          .map((_, index) => (
            <Collection.Item key={index}>Item {index + 1}</Collection.Item>
          ))}
      </Collection.Root>
    </>
  )
}
