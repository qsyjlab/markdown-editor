import path from "node:path";
import { glob } from "fast-glob";
import { mkdir, writeFile } from "fs/promises";
import { Project, SourceFile } from "ts-morph";

import { projectEditorRoot, projectRoot } from "../path";
import consola from "consola";
import chalk from "chalk";
import { Logger } from "../logger";



export async function buildDtsTask(root = projectEditorRoot) {
  const srcDir = path.resolve(root, "src");
  const outputDir = path.resolve(root, "dist", "types");
  const project = new Project({
    compilerOptions: {
      rootDir: srcDir,
      declarationDir: outputDir,
      declaration: true,
      emitDeclarationOnly: true,
      skipLibCheck: true,
      noImplicitAny: false,
      baseUrl: root,
      preserveSymlinks: true,
    },
    tsConfigFilePath: path.resolve(projectRoot, "tsconfig.build.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const files = await glob(["src/**/*.ts"]);

  const sourceFiles: SourceFile[] = [];

  await Promise.all(
    files.map(async (file) => {
      sourceFiles.push(project.addSourceFileAtPath(file));
    })
  );

  consola.success("Added source files");

  // typeCheck(project);
  // consola.success("Type check passed!");

  project.emitToMemory();

  // 随后将解析完的文件写道打包路径
  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(srcDir, sourceFile.getFilePath());

    consola.trace(
      chalk.yellow(
        `Generating definition for file: ${chalk.bold(relativePath)}`
      )
    );
    const emitOutput = sourceFile.getEmitOutput();

    const emitFiles = emitOutput.getOutputFiles();

    if (emitFiles.length === 0) {
      Logger.warn("No emit file:", sourceFile.getFilePath());
    }

    for (const outputFile of emitFiles) {
      const filePath = outputFile.getFilePath();
  

      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, outputFile.getText(), "utf8");
      consola.success(
        chalk.green(
          `Definition for file: ${chalk.bold(relativePath)} generated`
        )
      );
    }
  }
}

function typeCheck(project: Project) {
  const diagnostics = project.getPreEmitDiagnostics();
  if (diagnostics.length > 0) {
    consola.error(project.formatDiagnosticsWithColorAndContext(diagnostics));
    const err = new Error("Failed to generate dts.");
    consola.error(err);
    throw err;
  }
}
