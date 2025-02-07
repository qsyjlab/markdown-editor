import { parallel } from "gulp";
import path from "path";
import { rollup } from "rollup";
import { glob } from "fast-glob";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import resolvePlugin from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { Project } from "ts-morph";
import fs from "fs";

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
  const project = new Project();
  const sourceFiles = project.addSourceFilesAtPaths("src/**/*.ts");

  const srcDir = path.resolve("src");
  const outputDir = path.resolve(projectParserRoot, "dist", "types");
  sourceFiles.forEach((sourceFile) => {
    // 获取文件的相对路径
    const relativePath = path.relative(srcDir, sourceFile.getFilePath());

    // 获取文件的输出路径（保留目录结构）
    const outputFilePath = path.join(
      outputDir,
      relativePath.replace(/\.ts$/, ".d.ts")
    );

    // 获取目录路径
    const dirPath = path.dirname(outputFilePath);

    // 确保目录存在
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // 创建目录
    }

    // 获取类型声明内容
    const declarationFile = sourceFile.getFullText();

    // 写入类型声明文件
    fs.writeFileSync(outputFilePath, declarationFile);
  });
}

export default parallel(buildParserTask, buildDtsTask);
