import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import visualizer from "rollup-plugin-visualizer";

export default defineConfig({
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
  },
});
