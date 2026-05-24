import fs from 'node:fs/promises'
import path from 'node:path'

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

const dependencyFields = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const

async function readPackageJson(packageJsonPath: string) {
  return JSON.parse(await fs.readFile(packageJsonPath, 'utf8')) as PackageJson
}

async function findWorkspaceRoot(dir = process.cwd()): Promise<string> {
  const workspacePath = path.join(dir, 'pnpm-workspace.yaml')

  try {
    await fs.access(workspacePath)
    return dir
  } catch {
    const parentDir = path.dirname(dir)

    if (parentDir === dir) {
      throw new Error('Cannot find pnpm-workspace.yaml')
    }

    return findWorkspaceRoot(parentDir)
  }
}

async function resolveWorkspacePackages(workspaceRoot: string) {
  const workspacePackages = new Map<string, string>()

  for (const packageDir of await resolvePackageDirs(workspaceRoot)) {
    const packageJson = await readPackageJson(
      path.join(packageDir, 'package.json'),
    )

    if (packageJson.name && packageJson.version) {
      workspacePackages.set(packageJson.name, packageJson.version)
    }
  }

  return workspacePackages
}

async function resolvePackageDirs(workspaceRoot: string) {
  const packageDir = path.join(workspaceRoot, 'packages')
  const entries = await fs.readdir(packageDir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packageDir, entry.name))
}

function resolveWorkspaceRange(
  packageName: string,
  range: string,
  workspacePackages: Map<string, string>,
) {
  const version = workspacePackages.get(packageName)

  if (!version) {
    throw new Error(`Cannot resolve workspace dependency "${packageName}"`)
  }

  if (range === '*') {
    return version
  }

  if (range === '^' || range === '~') {
    return `${range}${version}`
  }

  return range
}

function resolveWorkspaceDependencies(
  packageJson: PackageJson,
  workspacePackages: Map<string, string>,
) {
  for (const field of dependencyFields) {
    const dependencies = packageJson[field]

    if (!dependencies) {
      continue
    }

    for (const [packageName, versionRange] of Object.entries(dependencies)) {
      if (!versionRange.startsWith('workspace:')) {
        continue
      }

      dependencies[packageName] = resolveWorkspaceRange(
        packageName,
        versionRange.slice('workspace:'.length),
        workspacePackages,
      )
    }
  }

  return packageJson
}

async function main() {
  const workspaceRoot = await findWorkspaceRoot()
  const workspacePackages = await resolveWorkspacePackages(workspaceRoot)
  const packageJsonPaths = (await resolvePackageDirs(workspaceRoot)).map(
    (packageDir) => path.join(packageDir, 'build', 'package.json'),
  )

  for (const packageJsonPath of packageJsonPaths) {
    const packageJson = await readPackageJson(packageJsonPath)
    const outputPackageJson = resolveWorkspaceDependencies(
      packageJson,
      workspacePackages,
    )

    await fs.writeFile(
      packageJsonPath,
      `${JSON.stringify(outputPackageJson, null, 2)}\n`,
    )
  }
}

void main()
