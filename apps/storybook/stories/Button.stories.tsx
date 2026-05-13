import type { Meta } from '@storybook/react-vite'
import { Button } from '@primitives-ui/react/button'

const meta = {
  title: 'Components/Button',
} satisfies Meta

export default meta

export function Basic() {
  return <Button className='bg-blue-500 text-white px-4 py-2 rounded'>Button</Button>
}
