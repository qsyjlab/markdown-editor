import { dest, series, src, watch as gulpWatch } from "gulp";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import path from "path";
import { Logger, projectThemeRoot } from "@md-doc-editor/build";

export function buildThemeChalk() {
  const sass = gulpSass(dartSass);

  return src(path.resolve(projectThemeRoot, "src/*.scss"))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS())
    .pipe(dest(path.resolve(projectThemeRoot, "dist")));
}

export function watch() {
  Logger.info("Parser Dev watching...");
  gulpWatch("src/**/*.ts", buildThemeChalk);
}

export default series(buildThemeChalk);
