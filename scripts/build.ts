import fs from 'node:fs/promises'
import path from 'node:path'
import { build as tsdownBuild } from 'tsdown'

interface PackageJson {
  name?: string
  version?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  exports: Record<string, string>
}

const sourceDir = './src/'
const outDir = './build'

function sourceEntryToOutputEntry(value: string) {
  const sourceRelativePath = value.slice(sourceDir.length)
  const outputRelativePath = sourceRelativePath.replace(/\.(tsx|ts)$/, '')

  return {
    types: `./${outputRelativePath}.d.ts`,
    import: `./${outputRelativePath}.js`,
  }
}

async function writePackageJson(
  packageJsonPath: string,
  packageJson: PackageJson,
) {
  const outputPackageJson = {
    ...packageJson,
    exports: Object.fromEntries(
      Object.entries(packageJson.exports).map(([key, value]) => [
        key,
        sourceEntryToOutputEntry(value),
      ]),
    ),
    main: './index.js',
    types: './index.d.ts',
  }

  await fs.writeFile(
    packageJsonPath,
    `${JSON.stringify(outputPackageJson, null, 2)}\n`,
  )
}

async function build() {
  const dir = process.cwd()

  const resolve = (...args: string[]) => path.resolve(dir, ...args)

  const packageJsonPath = resolve('package.json')
  const packageJson = JSON.parse(
    await fs.readFile(packageJsonPath, 'utf8'),
  ) as PackageJson
  const entry = Object.values(packageJson.exports)

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

  await writePackageJson(resolve(outDir, 'package.json'), packageJson)
}

void build()
