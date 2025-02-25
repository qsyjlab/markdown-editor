<template>
  <div id="container"></div>

  <div id="container2"></div>
</template>
<script setup lang="ts">
import {
  createMarkdownParser,
  bindCodeGroupsEvent,
  bindCopyCodeEvent,
  bindLazyLoadImageEvent,
} from "@md-doc-editor/parser";

import presetLang from "@md-doc-editor/parser/src/preset/lang";

import { MarkdownEditor } from "@md-doc-editor/editor";

import "@md-doc-editor/theme";
// import "@md-doc-editor/theme/dist/task.css";
// import "@md-doc-editor/editor/src/style/editor.scss";

import { nextTick, onMounted, ref } from "vue";
import { text } from "./markdown";

const html = ref("");

let markdownEditor: MarkdownEditor | null;

onMounted(() => {
  initMarkdownEditor();

  // initMarkdown();
});

function initMarkdownEditor() {
  markdownEditor = new MarkdownEditor({
    container: document.getElementById("container") as HTMLElement,
    height: "550px",
    parserOptions: {
      languages: [...presetLang, () => import("@shikijs/langs/json")],
    },

    onChange(mdText, htmlText) {
      // console.log("mdText", mdText);
      // console.log("htmlText", htmlText)
    },
    imagesUploadHandler: (file, success) => {
      const url = rawFileToObjectURL(file);
      success(url);
    },
    onClickImage: (path) => {
      console.log("path", path);
    },
    setup: () => {
      markdownEditor?.setContent(text);
    },
  });

  // const markdownEditor2 = new MarkdownEditor({
  //   container: document.getElementById("container2") as HTMLElement,
  //   height: "550px",
  //   onChange(mdText, htmlText) {
  //     console.log("mdText", mdText);
  //     console.log("htmlText", htmlText)
  //   },
  //   imagesUploadHandler: (file, success) => {
  //     const url = rawFileToObjectURL(file);
  //     success(url);
  //   },
  //   setup: () => {
  //     markdownEditor2?.setContent(text);
  //   },
  // });
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
<style scoped>
#container {
  padding: 20px;
}

input[type="checkbox" i] {
  cursor: pointer;
  position: relative;
  width: 18px;
  height: 18px;
  font-size: 20px;
  -webkit-appearance: none; /* 去掉默认的复选框样式 */
  -moz-appearance: none;
  appearance: none;
  border: 2px solid #ccc; /* 设置边框 */
  border-radius: 3px; /* 圆角 */
  background-color: #fff; /* 默认背景 */
}
input[type="checkbox"] {
  cursor: pointer;
  position: relative;
  width: 18px;
  height: 18px;
  font-size: 20px;
  -webkit-appearance: none; /* 去掉默认的复选框样式 */
  -moz-appearance: none;
  appearance: none;
  border: 2px solid #ccc; /* 设置边框 */
  border-radius: 3px; /* 圆角 */
  background-color: #fff; /* 默认背景 */
}

input[type="checkbox"]::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  display: inline-block;
  visibility: visible;
  padding-left: 0;
  text-align: center;
  content: " "; /* 默认内容为空 */
  border-radius: 3px;
}

input[type="checkbox"]:checked::after {
  content: "✓"; /* 选中时显示勾号 */
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  background-color: #ff4014; /* 选中时的背景色 */
}
</style>
