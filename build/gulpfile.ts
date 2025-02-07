import { parallel } from "gulp";
import { clearDist } from "./src/task/clean";
import { buildFullBunddle } from "./src/task/full";

export default parallel(clearDist, buildFullBunddle);
