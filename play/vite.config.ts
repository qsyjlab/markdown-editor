import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import visualizer from "rollup-plugin-visualizer";
import path from "path";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@md-doc-editor/editor"],
  },
  resolve: {
    alias: {
      "@md-doc-editor/editor": path.resolve(
        __dirname,
        "../packages/editor/src/index.ts"
      ),
      // "@md-doc-editor/editor/preview": path.resolve(
      //   __dirname,
      //   "../packages/editor/src/preview/index.ts"
      // ),
      "@md-doc-editor/parser": path.resolve(
        __dirname,
        "../packages/parser/src/index.ts"
      ),
      "@md-doc-editor/theme": path.resolve(
        __dirname,
        "../packages/theme/src/index.scss"
      ),
    },
  },
  plugins: [
    vue(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: ".output/visualizer.html", //分析图生成的文件名
      open: false, //如果存在本地服务端口，将在打包后自动展示
    }),
  ],
  server: {
    port: 5177,
    watch: {
      usePolling: true,
    },
  },
});
