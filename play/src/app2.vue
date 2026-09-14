<template>
  <div class="demo-nav">
    <a href="./?demo=editor">编辑器 Demo</a>
    <span>|</span>
    <a href="./?demo=ai">AI 流式渲染 Demo</a>
  </div>
  <div id="container"></div>
</template>
<script setup lang="ts">
import { MarkdownEditor } from "@md-doc-editor/editor";

import { onMounted } from "vue";
import { text } from "./markdown";

let markdownEditor: MarkdownEditor | null;

onMounted(() => {
  initMarkdownEditor();
});

function initMarkdownEditor() {
  markdownEditor = new MarkdownEditor({
    container: document.getElementById("container") as HTMLElement,
    height: "88vh",
    imagesUploadHandler: (file, success) => {
      const url = rawFileToObjectURL(file);
      success(url);
    },

    setup: () => {
      markdownEditor?.setContent(text);
    },
    theme: "dark",
  });
}

function rawFileToObjectURL(file: File) {
  return URL.createObjectURL(new Blob([file], { type: file.type }));
}
</script>
<style scoped>
#container {
  padding: 20px;
}
</style>
