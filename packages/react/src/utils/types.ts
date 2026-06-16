export type HTMLElements = keyof React.JSX.IntrinsicElements

export type Overwrite<T, U> = Omit<T, keyof U> & U

export type HTMLProps<Element extends HTMLElements> =
  React.ComponentPropsWithRef<Element> & {
    [index: `data-${string}`]: unknown
  }

export type RenderProp<
  State,
  Props = React.HTMLAttributes<any> & {
    ref?: React.Ref<any>
  },
> = ((props: Props, state: State) => React.ReactNode) | React.JSX.Element

export type Directory<T = any> = Record<string, T>

export type Orientation = 'horizontal' | 'vertical'

export type HookProps<
  Element extends HTMLElements,
  OwnProps extends Directory = Directory,
> = Overwrite<HTMLProps<Element>, OwnProps>
