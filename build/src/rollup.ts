import path from "path";
import { terser } from "rollup-plugin-terser";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolvePlugin from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import alias from "@rollup/plugin-alias";
// import sass from "rollup-plugin-sass";
// import glob from "fast-glob";

import { projectEditorRoot, projectRoot } from "./path";
import { entries } from "./alias";
// import { excludeFiles } from "./pkg";
// import { generateExternal } from "./external";
// import { excludeFiles } from "./pkg";

export async function runBuildTask() {
  try {
    // const input = excludeFiles(
    //   await glob("**/*.{js,ts,vue}", {
    //     cwd: path.resolve(projectEditorRoot, "src"),
    //     absolute: true,
    //     onlyFiles: true,
    //   })
    // );

    const bundle = await rollup({
      input: `${projectEditorRoot}/src/editor.ts`,
      plugins: [
        json(),
        alias({
          entries,
        }),
        esbuild({
          tsconfig: path.resolve(projectRoot, "tsconfig.json"),
          sourceMap: false,
          minify: false,
          target: "es2019",
          tsconfigRaw: {
            compilerOptions: {},
          },
        }),
        resolvePlugin({}),

        commonjs(),
        terser(),
        // sass({

        // })
      ],
      treeshake: true,
    });

    // 输出文件的配置
    await bundle.write({
      dir: path.resolve(projectEditorRoot, "dist"),
      format: "esm",
    });

    console.log("Build completed!");
  } catch (error) {
    console.error("Build failed:", error);
  }
}