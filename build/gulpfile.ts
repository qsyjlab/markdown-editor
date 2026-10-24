import { task } from "gulp";

// build 包只作为工具链库（gen-types / Logger / rollup helper）被
// parser/editor/theme 的 gulpfile 通过 @esbuild-kit 直接引用，
// 自身无需构建产物；保留 no-op 任务避免 lerna run build 失败。
task("default", (done) => done());
