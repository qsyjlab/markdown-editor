import { run } from "../process";

export function clearDist() {
  return run("pnpm run clean")
}
