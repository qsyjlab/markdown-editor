import { series } from "gulp";
import path from "path";
import { rollup } from "rollup";
import { glob } from "fast-glob";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import resolvePlugin from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import {
  excludeFiles,
  projectParserRoot,
  projectRoot,
  generateExternal,
  projectParserPkg,
  buildDtsTask,
  Logger
} from "@md-doc-editor/build";

const target = "es2019";
export async function buildParserTask() {
  try {
    const input = excludeFiles(
      await glob("**/*.{js,ts}", {
        cwd: path.resolve(projectParserRoot, "src"),
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
      ],
      external: await generateExternal(projectParserPkg),
      treeshake: true,
    });

    // 输出文件的配置
    await bundle.write({
      dir: path.resolve(projectParserRoot, "dist"),
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "src",
    });

    Logger.success('Build Parser completed!')
  } catch (error) {
    Logger.success('Build Error completed!', error)
  }
}


export default series(buildParserTask, ()=> buildDtsTask(projectParserRoot));
