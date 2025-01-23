import { parallel, series } from "gulp";
import { buildThemeChalk } from "./src/task/build-theme";

export default parallel(series(buildThemeChalk));
