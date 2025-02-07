import path from "path";
import { terser } from "rollup-plugin-terser";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolvePlugin from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";

import esbuild from "rollup-plugin-esbuild";
import alias from "@rollup/plugin-alias";
import { projectEditorRoot, projectRoot } from "../path";
import { entries } from "../alias";


const target = 'es2019'
export async function buildFullBunddle() {
  try {
    // const input = excludeFiles(
    //   await glob("**/*.{js,ts,vue}", {
    //     cwd: path.resolve(projectEditorRoot, "src"),
    //     absolute: true,
    //     onlyFiles: true,
    //   })
    // );

    const bundle = await rollup({
      input: `${projectEditorRoot}/index.ts`,
      plugins: [
        json(),
        alias({
          entries,
        }),
        esbuild({
          tsconfig: path.resolve(projectRoot, "tsconfig.json"),
          sourceMap: false,
          minify: true,
          target,
          tsconfigRaw: {
            compilerOptions: {},
          },
        }),
        resolvePlugin({}),

        // typescript({
        //   tsconfig: path.resolve(projectRoot, "tsconfig.json"),
        //   useTsconfigDeclarationDir:true
        // }),
        commonjs(),
        typescript({
          tsconfig: path.resolve(projectRoot, "tsconfig.json"),
          useTsconfigDeclarationDir:true,
    
        }),
        terser(),
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
