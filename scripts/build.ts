import fs from 'node:fs/promises'
import path from 'node:path'
import { build as tsdownBuild } from 'tsdown'

const outDir = './build'

async function build() {
  const dir = process.cwd()

  const resolve = (...args: string[]) => path.resolve(dir, ...args)

  const packageJsonPath = resolve('package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  const entry = Object.values(packageJson.exports) as string[]

  await tsdownBuild({
    entry,
    outDir,
    platform: 'browser',
    unbundle: true,
    clean: true,
    root: './src',
    format: {
      esm: {
        target: ['ES2022'],
      },
    },
    dts: {
      enabled: true,
      tsconfig: './tsconfig.build.json',
    },
    copy: ['./README.md'],
  })
}

void build()
