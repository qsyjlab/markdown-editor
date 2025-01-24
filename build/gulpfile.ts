import { parallel } from "gulp";
import { clearDist } from "./src/task/clean";

export default parallel(clearDist);
