import { parallel } from "gulp";
import path from "path";
import { rollup } from "rollup";
import { glob } from "fast-glob";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import resolvePlugin from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { Project } from "ts-morph";
import { mkdir, writeFile} from "fs/promises";

import {
  excludeFiles,
  projectParserRoot,
  projectRoot,
  generateExternal,
  projectParserPkg,
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
          // tsconfigRaw: {
          //   compilerOptions: {},
          // },
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

    console.log("Build completed!");
  } catch (error) {
    console.error("Build failed:", error);
  }
}

export async function buildDtsTask() {

  const outputDir = path.resolve(projectParserRoot, "dist", "types");
  const project = new Project({
    compilerOptions: {
      declarationDir: outputDir,
      declaration: true,            // 启用声明文件生成
      emitDeclarationOnly: true,    // 只生成声明文件
      skipLibCheck: true,           // 跳过库检查
      noImplicitAny: false,         // 允许隐式 any
    }
  });
  const sourceFiles = project.addSourceFilesAtPaths("src/**/*.ts");

  const srcDir = path.resolve("src");
 
  sourceFiles.forEach(async (sourceFile) => {
    // 获取文件的相对路径
    const relativePath = path.relative(srcDir, sourceFile.getFilePath());
        const emitOutput = sourceFile.getEmitOutput()
    const emitFiles = emitOutput.getOutputFiles()
    if (emitFiles.length === 0) {
      console.log(`Emit no file: ${relativePath}`)
    }

    const subTasks = emitFiles.map(async (outputFile) => {
      const filepath = outputFile.getFilePath()
      console.log("filepath",filepath)
      await mkdir(path.dirname(filepath), {
        recursive: true,
      })

      await writeFile(
        filepath,
        outputFile.getText(),
        'utf8'
      )
    })

    await Promise.all(subTasks)
  });
}

export default parallel(buildParserTask, buildDtsTask);
