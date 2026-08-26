---
name: storybook-design-system
description: Style Storybook primitives in apps/storybook/stories with shadcn/ui and Tailwind CSS.
---

# Storybook Design System

Create quiet, neutral, accessible Storybook presentation that consumers can
reuse. Keep behavior in `@primitives-ui/react` and presentation in
`apps/storybook/stories/styles.ts`.

## Scope and safety

- Work only on the component or components explicitly named by the user. When
  several are named, handle each independently; do not inventory or normalize
  sibling stories.
- Check Git status for the target stories and `styles.ts` before editing.
  Preserve staged and unstaged user changes. Do not recreate files that are
  already deleted unless the user explicitly requests their restoration.
- Do not change package source, behavior, focus management, story semantics,
  copy, public APIs, or unrelated stories to make styling easier.
- Preserve existing intentional design-system classes unless the user requests
  a redesign or identifies a concrete mismatch.

## Establish the contract before editing

For every requested component, inspect only what is needed to answer these
questions:

1. Which parts are rendered by its story?
2. Which public parts exist in `packages/react/src/<component>/index.ts`, and
   which HTML elements do their source files render?
3. Which interaction states are actually emitted? Inspect
   `stateAttributesMapping.ts`, native `disabled`/`:focus-visible`, ARIA,
   `hidden`, and shared hooks only as far as necessary. Do not assume Radix or
   shadcn attribute names.
4. Which relevant class exports already exist in
   `apps/storybook/stories/styles.ts`?

Then open
`https://ui.shadcn.com/docs/components/base/<component>` and inspect the current
official implementation behind the example or its official registry/source.
Do not rely on memory, a screenshot alone, or an older shadcn snippet. Record
the utilities that define the relevant anatomy and states before translating
them.

## shadcn fidelity

Treat the current shadcn Base implementation as the source of truth for visual
hierarchy, geometry, and interaction states where the anatomies correspond.
Adapt only what differs in this repository:

- Translate shadcn state selectors to attributes actually emitted by
  `@primitives-ui`. For example, map a shadcn `focus-visible:*` treatment to
  `data-[focus-visible]:*` when the primitive exposes that state, and map
  `data-state='open'` to `data-[open]` when that is the local contract.
- Apply focus styling to the focusable part, usually `Trigger`, rather than a
  non-focusable parent such as `Item`.
- Preserve meaningful state details as a set: ring width and alpha, focus
  border, radius, hover treatment, disabled opacity, and icon color changes.
  Do not replace them with a subjective approximation merely because it looks
  similar.
- Prefer existing semantic theme utilities when available. Otherwise map
  shadcn's neutral tokens consistently: `background` to `white`, `foreground`
  to `neutral-950`, `muted-foreground` to `neutral-500` or `neutral-600`,
  `border` to `neutral-200`, and `ring` to `neutral-400`. Preserve opacity, so
  `ring/50` becomes `neutral-400/50`.
- Adapt component structure rather than behavior. A CSS pseudo-element may
  represent a decorative shadcn icon when the story should remain structurally
  unchanged; state and motion must still follow the primitive's real contract.

## Implementation contract

- Export `<component>ClassName` for a single-part API or
  `<component>ClassNames` for a compound API from
  `apps/storybook/stories/styles.ts`, using camelCase. Import it once in the
  component story.
- For components following a single‑component API like `Button` and `Input`,
  use `<component>ClassName` directly.
- For compound APIs, give every rendered visual primitive part a stable key,
  such as `accordionClassNames.trigger`. A Root that renders DOM can receive
  `className`; a context-only Root cannot.
- Add a separate semantic key only when a story demonstrates a real layout or
  state variant, such as `dialogClassNames.scrollPopup`. Do not create a
  general component variants API.
- Never add `className` or styles to any `Portal` or `Positioner` part. Portal is
  only a mounting and lifecycle boundary; Positioner only applies coordinates
  calculated by the primitive. Neither may own layout, spacing, background,
  overflow, pointer events, stacking context, visual state, or motion. Do not
  create `portal` or `positioner` keys, and never override Positioner's inline
  position or transform-origin values.
- Backdrop or Viewport owns viewport coverage. Popup owns its surface and
  stacking level above the Backdrop. Keep widths usable on narrow Storybook
  canvases, for example with a viewport-relative width plus a `max-w-*` cap.
- Interactive controls need hover, actual focus-visible, and disabled styles.
  Controls are at least `h-9`; icon-only controls need an equivalent square hit
  target and an accessible name.
- Use only Tailwind v4 utilities available in this repository. Keep complete
  utility names in static string literals or `clsx` arguments so Tailwind can
  discover them; never construct partial utilities such as `ring-${width}`.
- Motion is optional. Keep it short, use only installed utilities, and respect
  `prefers-reduced-motion`.
- To provide completions for the Tailwind CSS extension, all Tailwind CSS classes
  must be wrapped inside the `clsx` function.

## Verify

Run formatting on every changed story and `styles.ts`, then the Storybook
checks. Use Node from the repository `.nvmrc` when the ambient shell differs.

```bash
pnpm exec oxfmt --check apps/storybook/stories/<Component>.stories.tsx apps/storybook/stories/styles.ts
pnpm --filter @primitives-ui/storybook typecheck
pnpm --filter @primitives-ui/storybook build
```

The build proves compilation, not visual correctness. When presentation changes
materially, inspect the rendered story at desktop and narrow widths. Exercise
the states the story exposes: keyboard focus, hover, disabled, open/closed,
nested overlays, fallback content, and scrolling as applicable. Confirm that
the visible focus ring belongs to the actual focus target and that no deleted
files were restored.
