import type { UserWorkspaceConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WORKSPACE_ROOT = dirname(fileURLToPath(import.meta.url))
const SETUP_FILE = resolve(WORKSPACE_ROOT, 'test/vitest.setup.ts')
const DEFAULT_BROWSER_ENVIRONMENT = 'all-browsers'

const supportedBrowsers = ['chromium', 'webkit', 'firefox'] as const

type SupportedBrowser = (typeof supportedBrowsers)[number]
type BrowserInstance = { browser: SupportedBrowser }

export function getJsdomTestConfig(): UserWorkspaceConfig['test'] {
  return {
    include: ['**/!(*.browser).test.{ts,tsx}'],
    setupFiles: [SETUP_FILE],
    environment: 'jsdom',
  }
}

function getBrowserInstances(environment: string): BrowserInstance[] {
  let instances: BrowserInstance[] = []

  if (environment === DEFAULT_BROWSER_ENVIRONMENT) {
    instances = supportedBrowsers.map((browser) => ({ browser }))
  }

  if (supportedBrowsers.some((browser) => browser === environment)) {
    instances = [{ browser: environment as SupportedBrowser }]
  }

  return instances
}

export function getBrowserTestConfig(): UserWorkspaceConfig['test'] {
  const environment = process.env.VITEST_ENV ?? DEFAULT_BROWSER_ENVIRONMENT

  const instances = getBrowserInstances(environment)

  if (!instances.length) {
    throw new Error(`Unsupported browser test environment "${environment}".}.`)
  }

  return {
    browser: {
      instances,
      enabled: true,
      provider: playwright(),
      screenshotFailures: false,
      headless: true,
    },
    include: ['**/*.browser.test.{ts,tsx}'],
  }
}
