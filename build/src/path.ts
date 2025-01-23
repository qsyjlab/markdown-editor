import { resolve } from "path";

export const projectRoot = resolve(__dirname, "../..");

export const projectPackageRoot = resolve(projectRoot, 'packages');

export const projectEditorRoot = resolve(projectRoot, 'packages', 'editor');


export const projectThemeRoot = resolve(projectPackageRoot ,'theme');

export const projectParserRoot = resolve(projectRoot,  'packages', 'parser');


export const projectEditorPkg = resolve(projectEditorRoot, 'package.json')
