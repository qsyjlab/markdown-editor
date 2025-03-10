import { series, watch as gulpWatch } from "gulp";
import path from "path";
import { rollup } from "rollup";
import { glob } from "fast-glob";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import resolvePlugin from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sass from "rollup-plugin-sass";
import { rmSync } from "fs";

import {
  excludeFiles,
  projectRoot,
  generateExternal,
  projectEditorPkg,
  projectEditorRoot,
  buildDtsTask,
  Logger,
} from "@md-doc-editor/build";

const target = "es2019";
export async function buildEditorTask() {


  const distRoot = path.resolve(projectEditorRoot, "dist")
  rmSync(distRoot, { recursive: true, force: true });
  Logger.success("Clean Editor dist completed!");

  try {
    const input = excludeFiles(
      await glob("**/*.{js,ts}", {
        cwd: path.resolve(projectEditorRoot, "src"),
        absolute: true,
        onlyFiles: true,
      })
    );

    const bundle = await rollup({
      input,
      plugins: [
        json(),
        esbuild({
          tsconfig: path.resolve(projectRoot, "tsconfig.build.json"),
          sourceMap: false,
          target,
        }),
        resolvePlugin({}),
        commonjs(),
        sass({
          insert: true,
          api: "modern",
        }),
      ],
      external: await generateExternal(projectEditorPkg),
      treeshake: true,
    });

    // 输出文件的配置
    await bundle.write({
      dir: distRoot,
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "src",
    });

    Logger.success("Build Editor completed!");
  } catch (error) {
    Logger.error("Build Editor failed:", error);
  }
}
 

export function watch() {
  Logger.info("Editor Dev watching...")
  gulpWatch("src/**/*.ts", buildEditorTask);
}

export default series(buildEditorTask, () => buildDtsTask());
