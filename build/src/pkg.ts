
export const getPackageManifest = (pkgPath: string) => {

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(pkgPath)
}
export const getPackageDependencies = (
  pkgPath: string
): Record<'dependencies' | 'peerDependencies', string[]> => {
  console.log("pkgPath",pkgPath)
  const manifest = getPackageManifest(pkgPath)
  console.log("manifest",manifest)

  const { dependencies = {}, peerDependencies = {} } = manifest

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies),
  }
}

export const excludeFiles = (files: string[]) => {
  const excludes = ['node_modules', 'test', 'mock', 'gulpfile', 'dist']
  return files.filter(
    (path) => !excludes.some((exclude) => path.includes(exclude))
  )
}
