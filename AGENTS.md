# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm/Turborepo monorepo for `@primitives-ui` packages.
`packages/react/src` contains React primitives such as `button` and `command`,
with per-component entry points and tests colocated under `__tests__`.
`packages/utils/src` contains shared React/DOM utilities exported by
`@primitives-ui/utils`. `apps/storybook` is the local component development and
documentation app. Shared test setup lives in `test/`, build helpers in
`scripts/`, and workspace-wide config in `vitest.shared.ts`, `turbo.json`, and
the root TypeScript configs.

## Naming Conventions

Keep component folders lowercase (`button`, `command`) and export
public APIs through `index.ts`. Component files and React symbols use PascalCase
(`Button.tsx`, `Button`); hooks use `useX`; utility functions use camelCase.
Prefer named exports and keep imports sorted by the formatter.

## Testing Guidelines

Vitest is split by environment. Name jsdom tests `*.test.ts` or `*.test.tsx`;
name real-browser tests `*.browser.test.tsx`. Browser tests use
`@vitest/browser-playwright`; jsdom tests use Testing Library setup from
`test/vitest.setup.ts`. Add focused tests next to the source package whenever
behavior changes, especially for focus, keyboard, and disabled-state behavior.

## Environment Notes

Use Node `v22.22.2` from `.nvmrc`. Do not edit generated `build/`, `coverage/`,
or `node_modules/` output. Package publishing uses pnpm workspace publishing:
source `exports` point at TypeScript entry points, while `publishConfig.exports`
points at built JavaScript and declaration files.
