<template>
  <div id="container"></div>
  <button @click="showDialog">显示</button>

  <button @click="closeDialog">关闭</button>
</template>
<script setup lang="ts">
import {
  createMarkdownParser,
  bindCodeGroupsEvent,
  bindCopyCodeEvent,
  bindLazyLoadImageEvent,
} from "@md-doc-editor/parser";

import { MarkdownEditor, Dialog } from "@md-doc-editor/editor";

import "@md-doc-editor/theme/dist/index.css";
import "@md-doc-editor/editor/src/style/editor.scss";

import { nextTick, onMounted, ref } from "vue";
import { text } from "./markdown";

const html = ref("");

let markdownEditor: MarkdownEditor | null;
// const content = ref("");
let dialogInstance =  new Dialog({})

onMounted(() => {
  initMarkdownEditor();
  
  // initMarkdown();
});

function showDialog() {
  dialogInstance.show()
}

function closeDialog(){
  dialogInstance.close()
}

function initMarkdownEditor() {
  markdownEditor = new MarkdownEditor({
    container: document.getElementById("container") as HTMLElement,
    height: "800px",
    imagesUploadHandler: (file, success) => {
      const url = rawFileToObjectURL(file);
      success(url);
    },
    setup: () => {
      markdownEditor?.setContent(text);
    },
  });
}

function rawFileToObjectURL(file: File) {
  return URL.createObjectURL(new Blob([file], { type: file.type }));
}

async function initMarkdown() {
  const parser = await createMarkdownParser({
    enableLineNumber: false,
  });
  html.value = parser.parse(text);
  nextTick(() => {
    bindCodeGroupsEvent();
    bindCopyCodeEvent();
    bindLazyLoadImageEvent({
      onClick: (src) => {
        console.log("src", src);
      },
    });
  });
}
</script>
<style lang="scss" scoped>
#container {
  padding: 20px;
}
</style>
