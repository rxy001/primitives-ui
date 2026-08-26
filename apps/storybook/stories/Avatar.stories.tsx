import type { Meta } from '@storybook/react-vite'
import { Avatar } from '@primitives-ui/react'
import { avatarClassNames } from './styles'

const meta = {
  title: 'Components/Avatar',
} satisfies Meta

export default meta

export function Default() {
  return (
    <Avatar.Root className={avatarClassNames.root}>
      <Avatar.Image
        src='https://avatars.githubusercontent.com/u/25546323?v=4'
        width='48'
        height='48'
        className={avatarClassNames.image}
      />
      <Avatar.Fallback className={avatarClassNames.fallback}>
        X1ngYu
      </Avatar.Fallback>
    </Avatar.Root>
  )
}

export function Fallback() {
  return (
    <Avatar.Root className={avatarClassNames.root}>
      <Avatar.Image
        src=''
        width='48'
        height='48'
        className={avatarClassNames.image}
      />
      <Avatar.Fallback className={avatarClassNames.fallback}>
        X1ngYu
      </Avatar.Fallback>
    </Avatar.Root>
  )
}
