import { dest, parallel, src } from "gulp";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import path from "path";
import { projectThemeRoot } from "@markdown-editor/build";

export function buildThemeChalk() {
  const sass = gulpSass(dartSass);
  
  return src(path.resolve(projectThemeRoot, "src/*.scss"))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      cleanCSS()
    )

    .pipe(dest(path.resolve(projectThemeRoot, "dist")));
}

export default parallel(buildThemeChalk);
