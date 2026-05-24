import react from '@vitejs/plugin-react'
import { defineProject, mergeConfig } from 'vitest/config'
import configShared from '../../vitest.shared'

export default mergeConfig(
  configShared,
  defineProject({
    plugins: [react()],
    test: {
      name: '@primitives-ui/react',
    },
    optimizeDeps: {
      include: ['@testing-library/react'],
    },
    resolve: {
      alias: {
        '#test': '../../../test',
      },
    },
  }),
)
