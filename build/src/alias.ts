import path from "node:path";
import { projectRoot } from "./path";

export const entries = {
  "@md-doc-editor/parser": resolveEntryForPkg("parser"),
  "@md-doc-editor/editor": resolveEntryForPkg("editor"),
};

function resolveEntryForPkg(pkg: string) {
  return path.resolve(
    projectRoot,
    `packages/${pkg}/index.ts`
  );
}
