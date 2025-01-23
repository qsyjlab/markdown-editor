import { projectEditorPkg } from "./path"
import { getPackageDependencies } from "./pkg"

export const generateExternal = async () => {
    const { dependencies, peerDependencies } = getPackageDependencies(projectEditorPkg)
  
    return (id: string) => {
      const packages: string[] = [...peerDependencies, ...dependencies]
    //   if (!options.full) {
    //     packages.push('@vue', ...dependencies)
    //   }
  
      return [...new Set(packages)].some(
        (pkg) => id === pkg || id.startsWith(`${pkg}/`)
      )
    }
  }
  