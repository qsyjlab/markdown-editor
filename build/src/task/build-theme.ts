import { dest, src } from "gulp";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import path from "path";
import { projectThemeRoot } from "../path";

export function buildThemeChalk() {
  const sass = gulpSass(dartSass);
  // const noElPrefixFile = /(index|base|display)/
  console.log("scss", path.resolve(projectThemeRoot, "src/*.scss"));
  return src(path.resolve(projectThemeRoot, "src/*.scss"))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      cleanCSS({}, (details) => {
        //   consola.success(
        //     `${chalk.cyan(details.name)}: ${chalk.yellow(
        //       details.stats.originalSize / 1000
        //     )} KB -> ${chalk.green(details.stats.minifiedSize / 1000)} KB`
        //   )
      })
    )

    .pipe(dest(path.resolve(projectThemeRoot, "dist")));
}
