import { dest, parallel, src } from "gulp";
import path from "path";
import { rollup } from "rollup";
import { glob } from 'fast-glob';
import json from '@rollup/plugin-json'
import esbuild from 'rollup-plugin-esbuild'
import resolvePlugin from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import { projectThemeRoot, excludeFiles, projectParserRoot, projectRoot, generateExternal, projectParserPkg } from "@md-doc-editor/build";


const target = 'es2019'
export async function buildParserTask() {
  try {
    const input = excludeFiles(
      await glob("**/*.{js,ts,vue}", {
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
          tsconfig: path.resolve(projectRoot, "tsconfig.json"),
          sourceMap: false,
          minify: true,
          target,
          tsconfigRaw: {
            compilerOptions: {},
          },
        }),
        resolvePlugin({}),
        commonjs(),
        terser(),
      ],
      external: await generateExternal(projectParserPkg),
      treeshake: true,
    });

    // 输出文件的配置
    await bundle.write({
      dir: path.resolve(projectParserRoot, "dist"),
      format: "esm",
      preserveModules:true,
      preserveModulesRoot: 'src'
    });

    console.log("Build completed!");
  } catch (error) {
    console.error("Build failed:", error);
  }
}

export default parallel(buildParserTask);
