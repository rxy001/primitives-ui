# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build all packages (turborepo)
pnpm build

# Build + prepare + publish packages
pnpm publish

# Type-check all packages
pnpm typecheck

# Tests
pnpm test              # jsdom + all browsers
pnpm test:unit         # jsdom only
pnpm test:chromium     # browser tests on Chromium only
pnpm test:browsers     # browser tests on all browsers
pnpm --filter @primitives-ui/react test   # run tests for a single package

# Linting & formatting
pnpm lint              # oxlint
pnpm lint:fix          # oxlint with auto-fix
pnpm format:check      # oxfmt check
pnpm format:fix        # oxfmt write
```

## Architecture

This is a **pnpm + Turborepo monorepo** publishing two packages to npm under the `@primitives-ui` scope.

- **`packages/utils`** — Zero-dependency utility functions (`@primitives-ui/utils`).
- **`packages/react`** — React UI primitives (`@primitives-ui/react`). Depends on `utils` via `workspace:*`.
- **`apps/storybook`** — Vite-based Storybook for developing and documenting components. Uses Tailwind CSS v4.

### Build pipeline

The shared build script (`scripts/build.ts`) uses **tsdown** to build each package. It reads the `exports` field from each package's `package.json` to determine entry points, emits ESM (target ES2022) with `.d.ts` declarations into `packages/<name>/build/`. Turborepo ensures `utils` builds before `react` (`^build` dependency in `turbo.json`).

For publishing, `scripts/resolve-workspace-dependencies.ts` replaces `workspace:*` protocol with actual versions in the build output before `pnpm publish`.

### Testing

Vitest with two modes controlled by the `VITEST_ENV` env var:

- **`jsdom`** (default) — Standard unit tests with `@testing-library/react`. Files: `*.test.{ts,tsx}`. Global setup adds jest-dom matchers (`toBeInTheDocument`, etc.).
- **Browser** (`chromium`/`firefox`/`webkit`) — Runs `*.browser.test.{ts,tsx}` files via `@vitest/browser-playwright` in headless mode. Used for tests that need real browser behavior.

Each package has its own `vitest.config.ts` that extends the shared config via `defineProject`.

### Tooling

- **Node** >=22.22.2 (pinned in `.nvmrc`), **pnpm** 10.29.2
- **oxlint** for linting (type-aware, uses `oxlint-tsgolint` plugin), **oxfmt** for formatting
- **Husky** + **lint-staged** + **commitlint** enforce conventional commits
- **CI** (`.github/workflows/QA.yml`) runs build, test, lint, typecheck, and format check on PRs and pushes to `dev`/`main`
- Both `build` and `typecheck` are Turborepo `^`-prefixed tasks, so dependents always build after their dependencies
