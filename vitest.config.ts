import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  defineConfig,
  defineProject,
  mergeConfig,
  type UserWorkspaceConfig,
} from 'vitest/config'
import reactConfig from './packages/react/vitest.config'
import utilsConfig from './packages/utils/vitest.config'
import { getBrowserTestConfig, getJsdomTestConfig } from './vitest.shared'

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))
const WORKSPACE_ROOT = resolve(CURRENT_DIR, './')

function createPackageProjects(
  name: string,
  config: UserWorkspaceConfig,
): UserWorkspaceConfig[] {
  return [
    mergeConfig(
      config,
      defineProject({
        test: {
          name: `${name}:jsdom`,
          ...getJsdomTestConfig(),
        },
      }),
    ),
    mergeConfig(
      config,
      defineProject({
        test: {
          name: `${name}:browser`,
          ...getBrowserTestConfig(),
        },
      }),
    ),
  ]
}

export default defineConfig({
  test: {
    projects: [
      ...createPackageProjects('@primitives-ui/react', reactConfig),
      ...createPackageProjects('@primitives-ui/utils', utilsConfig),
    ],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: resolve(WORKSPACE_ROOT, 'coverage'),
      include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
      exclude: ['**/*.test.{ts,tsx}'],
    },
  },
})
