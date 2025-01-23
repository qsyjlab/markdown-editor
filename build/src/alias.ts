import path from "node:path";
import { projectRoot } from "./path";

export const entries = {
  "@markdown-editor/parser": resolveEntryForPkg("parser"),
  "@markdown-editor/editor": resolveEntryForPkg("editor"),
};

function resolveEntryForPkg(pkg: string) {
  return path.resolve(
    projectRoot,
    `packages/${pkg}/index.ts`
  );
}
