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

## Build, Test, and Development Commands

- `pnpm install`: install dependencies with pnpm 10.29.2.
- `pnpm dev:sb`: run Storybook through Turbo for local component work.
- `pnpm build:packages`: build all packages into each package `build/`
  directory.
- `pnpm typecheck`: run package TypeScript checks through Turbo.
- `pnpm test`: run all Vitest projects: jsdom tests plus browser tests in Chromium.
- `pnpm test:jsdom`: run non-browser Vitest projects.
- `pnpm test:chromium` / `pnpm test:firefox` / `pnpm test:webkit`: run browser tests in one browser.
- `pnpm test:browsers`: run browser tests across Chromium, Firefox, and WebKit.
- `pnpm lint` / `pnpm format:check`: validate oxlint and oxfmt rules.

## Coding Style & Naming Conventions

Use TypeScript ESM and React 19 patterns. Formatting is managed by oxfmt:
2-space indentation, single quotes, no semicolons, LF endings, and 80-column
print width. Keep component folders lowercase (`button`, `command`) and export
public APIs through `index.ts`. Component files and React symbols use PascalCase
(`Button.tsx`, `Button`); hooks use `useX`; utility functions use camelCase.
Prefer named exports and keep imports sorted by the formatter.

## Testing Guidelines

Vitest is split by environment. Name jsdom tests `*.test.ts` or `*.test.tsx`;
name real-browser tests `*.browser.test.tsx`. Browser tests use
`@vitest/browser-playwright`; jsdom tests use Testing Library setup from
`test/vitest.setup.ts`. Add focused tests next to the source package whenever
behavior changes, especially for focus, keyboard, and disabled-state behavior.

## Commit & Pull Request Guidelines

Commits are checked with commitlint and follow Conventional Commits, as in
`feat: add Button and Command components` or `chore: update vitest.config.ts`.
Before opening a PR, run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`,
`pnpm build:packages`, and the relevant tests. Use `pnpm test` for normal PR
coverage and `pnpm test:browsers` for browser-sensitive changes or release checks.

## Environment Notes

Use Node `v22.22.2` from `.nvmrc`. Do not edit generated `build/`, `coverage/`,
or `node_modules/` output. Package publishing rewrites `workspace:*`
dependencies via `scripts/resolve-workspace-dependencies.ts`, so keep dependency
versions accurate in package manifests.
