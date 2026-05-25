import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineProject } from 'vitest/config'

const PACKAGE_ROOT = dirname(fileURLToPath(import.meta.url))

export default defineProject({
  root: PACKAGE_ROOT,
  plugins: [react()],
  test: {
    globals: true,
    name: '@primitives-ui/react',
  },
  optimizeDeps: {
    include: ['@testing-library/react'],
  },
  resolve: {
    alias: {
      '#test': resolve(PACKAGE_ROOT, 'test'),
    },
  },
})
