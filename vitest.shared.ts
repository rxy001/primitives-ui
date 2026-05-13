import type { UserWorkspaceConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WORKSPACE_ROOT = dirname(fileURLToPath(import.meta.url))
const SETUP_FILE = resolve(WORKSPACE_ROOT, 'test/vitest.setup.ts')
const DEFAULT_ENVIRONMENT = 'jsdom'
const environment = process.env.VITEST_ENV ?? DEFAULT_ENVIRONMENT

const supportedBrowsers = ['chromium', 'webkit', 'firefox'] as const
type SupportedBrowser = (typeof supportedBrowsers)[number]
type BrowserInstance = { browser: SupportedBrowser }

function isSupportedBrowser(env: string): env is SupportedBrowser {
  return supportedBrowsers.some((browser) => browser === env)
}

function getBrowserInstances(env: string): BrowserInstance[] | undefined {
  if (env === 'all-browsers') {
    return supportedBrowsers.map((browser) => ({ browser }))
  }

  if (isSupportedBrowser(env)) {
    return [{ browser: env }]
  }

  return undefined
}

function getTestConfig(): UserWorkspaceConfig['test'] {
  if (environment === DEFAULT_ENVIRONMENT) {
    return {
      include: ['**/!(*.browser).test.{ts,tsx}'],
      setupFiles: [SETUP_FILE],
      environment: 'jsdom',
    }
  }

  const instances = getBrowserInstances(environment)

  if (!instances) {
    return undefined
  }

  return {
    browser: {
      enabled: true,
      provider: playwright(),
      screenshotFailures: false,
      headless: true,
      instances,
    },
    include: ['**/*.browser.test.{ts,tsx}'],
  }
}

const config: UserWorkspaceConfig = {
  test: {
    exclude: ['node_modules'],
    globals: true,
    ...getTestConfig(),
  },
}

export default config
