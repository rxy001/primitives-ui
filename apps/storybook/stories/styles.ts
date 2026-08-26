import clsx from 'clsx'

export const accordionClassNames = {
  root: clsx(
    'w-full max-w-xl',
    'px-4',
    'rounded-lg border border-neutral-200 bg-white shadow-xs',
    'text-neutral-950',
  ),
  item: clsx('border-b border-neutral-200', 'last:border-b-0'),
  header: clsx('m-0'),
  trigger: clsx(
    'flex min-h-11 w-full items-center justify-between gap-4',
    'py-3',
    'rounded-lg border border-transparent',
    'text-left text-sm font-medium',
    'outline-none transition-all',
    'cursor-pointer',
    'after:mr-1 after:size-2.5 after:shrink-0 after:rotate-45',
    'after:border-r after:border-b after:border-neutral-500',
    'after:transition-transform',
    'hover:underline',
    'data-open:after:rotate-225',
    'data-focus-visible:border-neutral-400 data-focus-visible:ring-3 data-focus-visible:ring-neutral-400/50 data-focus-visible:after:border-neutral-400',
    'disabled:pointer-events-none disabled:opacity-50',
    'motion-reduce:after:transition-none',
  ),
  panel: clsx(
    'overflow-hidden',
    'pb-4 pr-8',
    'text-sm leading-6 text-neutral-600',
  ),
}

export const avatarClassNames = {
  root: clsx(
    'relative flex size-12 shrink-0 overflow-hidden',
    'rounded-full bg-neutral-100',
    'ring-1 ring-neutral-200 ring-offset-2 ring-offset-white',
  ),
  image: clsx('size-full', 'object-cover'),
  fallback: clsx(
    'flex size-full items-center justify-center',
    'bg-neutral-100',
    'text-xs font-medium text-neutral-600',
    'select-none',
  ),
}

export const collapsibleClassNames = {
  root: clsx(
    'grid w-full max-w-sm gap-2',
    'p-4',
    'rounded-lg border border-neutral-200 bg-white shadow-xs',
    'text-neutral-950',
  ),
  trigger: clsx(
    'flex min-h-9 w-full items-center justify-between gap-3',
    'px-3 py-2',
    'rounded-md border border-neutral-200 bg-white shadow-xs',
    'text-left text-sm font-medium',
    'outline-none transition-all',
    'cursor-pointer',
    'after:mr-0.5 after:size-2.5 after:shrink-0 after:rotate-45',
    'after:border-r after:border-b after:border-neutral-500',
    'after:transition-transform',
    'hover:bg-neutral-100',
    'data-open:after:rotate-225',
    'data-focus-visible:border-neutral-400 data-focus-visible:ring-[3px] data-focus-visible:ring-neutral-400/50 data-focus-visible:after:border-neutral-400',
    'disabled:pointer-events-none disabled:opacity-50',
    'motion-reduce:after:transition-none',
  ),
  panel: clsx(
    'overflow-hidden',
    'rounded-md border border-neutral-200 bg-neutral-50',
    'px-4 py-3',
    'text-sm leading-6 text-neutral-600',
  ),
}

const baseButtonClassName = clsx(
  'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap',
  'px-4',
  'rounded-md shadow-xs',
  'text-sm font-medium',
  'outline-none transition-[color,background-color,border-color,box-shadow]',
  'cursor-pointer select-none',
  'data-focus-visible:ring-2 data-focus-visible:ring-neutral-400 data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-white',
  'disabled:pointer-events-none disabled:opacity-50',
)

export const primaryButtonClassName = clsx(
  baseButtonClassName,
  'bg-neutral-950 text-white',
  'hover:bg-neutral-800 active:bg-neutral-900',
)

export const secondaryButtonClassName = clsx(
  baseButtonClassName,
  'border border-neutral-200 bg-white text-neutral-950',
  'hover:bg-neutral-100 active:bg-neutral-200',
)

const dialogPopupClassName = clsx(
  'flex w-[calc(100vw-2rem)] max-w-lg flex-col gap-4',
  'p-6',
  'rounded-lg border border-neutral-200 bg-white shadow-xl',
  'text-neutral-950',
  'outline-none',
  'data-nested:max-w-md',
)

export const inputClassName = clsx(
  'h-9 w-full',
  'px-3',
  'rounded-md border border-neutral-200 bg-white shadow-xs',
  'text-sm text-neutral-950 placeholder:text-neutral-500',
  'outline-none transition-[border-color,box-shadow]',
  'focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400',
  'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50',
)

export const fieldClassName = clsx(
  'grid gap-2',
  'text-sm font-medium text-neutral-900',
)

export const dialogClassNames = {
  trigger: primaryButtonClassName,
  backdrop: clsx('fixed inset-0', 'bg-neutral-950/50'),
  viewport: clsx(
    'fixed inset-0 grid min-h-full place-items-center overflow-y-auto',
    'p-4 sm:p-8',
  ),
  popup: clsx(
    'fixed top-1/2 left-1/2 max-h-[calc(100vh-2rem)] overflow-y-auto',
    '-translate-x-1/2 -translate-y-1/2',
    dialogPopupClassName,
  ),
  scrollPopup: clsx('relative', dialogPopupClassName),
  title: clsx(
    'text-lg leading-none font-semibold tracking-tight',
    'text-neutral-950',
  ),
  description: clsx('text-sm leading-6', 'text-neutral-600'),
  actions: clsx('mt-2 flex flex-wrap items-center justify-end gap-2'),
  close: secondaryButtonClassName,
  save: primaryButtonClassName,
}

export const popoverClassNames = {
  trigger: secondaryButtonClassName,
  popup: clsx(
    'relative grid w-72 max-w-[calc(100vw-2rem)] gap-3',
    'p-4',
    'rounded-md border border-neutral-200 bg-white shadow-md',
    'text-neutral-950',
    'outline-none',
  ),
  title: clsx('text-sm leading-none font-semibold', 'text-neutral-950'),
  description: clsx('text-sm leading-5', 'text-neutral-600'),
  arrow: clsx(
    'absolute size-3',
    "before:content-[''] before:absolute before:left-0 before:top-0 before:w-full before:h-full",
    'before:border-t before:border-l before:border-neutral-200 before:bg-white',
    'before:transform-[rotate(45deg)]',
  ),
}

export const tooltipClassNames = {
  trigger: clsx(
    'inline-flex h-9 items-center justify-center',
    'rounded-md border border-neutral-200 bg-white px-4 shadow-xs',
    'text-sm font-medium text-neutral-950',
    'outline-none transition-[color,background-color,border-color,box-shadow]',
    'cursor-pointer',
    'hover:bg-neutral-100 active:bg-neutral-200',
    'data-focus-visible:border-neutral-400 data-focus-visible:ring-[3px] data-focus-visible:ring-neutral-400/50',
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  popup: clsx(
    'relative w-fit max-w-xs',
    'px-3 py-1.5',
    'rounded-md bg-neutral-950 shadow-md',
    'text-xs leading-5 text-white',
    'origin-(--transform-origin) outline-none',
    'transition-opacity duration-100',
    'data-open:opacity-100 data-closed:opacity-0',
    'motion-reduce:transition-none',
  ),
  arrow: clsx(
    'absolute size-2.5',
    "before:content-[''] before:absolute before:left-0 before:top-0 before:w-full before:h-full",
    'before:border-t before:border-l before:border-neutral-950 before:bg-neutral-950',
    'before:transform-[rotate(45deg)]',
  ),
}
