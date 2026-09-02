import { visuallyHidden } from '../visuallyHidden'

export function FocusGuard(props: FocusGuardProps) {
  return (
    <span
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      // oxlint-disable-next-line jsx-a11y/no-aria-hidden-on-focusable
      aria-hidden='true'
      style={visuallyHidden}
      {...props}
    />
  )
}

FocusGuard.displayName = 'FocusGuard'

export interface FocusGuardProps extends React.ComponentPropsWithRef<'span'> {}
