import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineProject } from 'vitest/config'

const PACKAGE_ROOT = dirname(fileURLToPath(import.meta.url))

export default defineProject({
  root: PACKAGE_ROOT,
  test: {
    globals: true,
    name: '@primitives-ui/utils',
  },
})
