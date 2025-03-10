<template>
  <div class="item">
    <div class="label"></div>
    <div class="content">
      <div id="container"></div>
    </div>
  </div>

  <div class="preview" ref="contentRef">

  </div>
</template>
<script setup lang="ts">
import {
  createMarkdownParser,
  bindCodeGroupsEvent,
  bindCopyCodeEvent,
  bindLazyLoadImageEvent,
} from "@md-doc-editor/parser";

import { MarkdownEditorPreview } from "@md-doc-editor/editor/preview";

// import { Prvi } from "@md-doc-editor/editor/dist/preview";

// import "@md-doc-editor/theme";

import { nextTick, onMounted, ref } from "vue";
import { text } from "./markdown";

const html = ref("");
const contentRef = ref<HTMLDivElement>()

let markdownEditor: null;
// const content = ref("");

onMounted(async () => {
  const preview = new MarkdownEditorPreview()
  
  await preview.init()
  contentRef.value?.append(preview.create()) 
  preview.setContent(text)
  // initMarkdownEditor();
  // initMarkdown();
});

function initMarkdownEditor() {
  // markdownEditor = new MarkdownEditor({
  //   container: document.getElementById("container") as HTMLElement,
  //   height: "800px",
  //   onChange(mdText, htmlText) {
  //     console.log("mdText", mdText);
  //     console.log("htmlText", htmlText);
  //   },
  //   imagesUploadHandler: (file, success) => {
  //     const url = rawFileToObjectURL(file);
  //     success(url);
  //   },
  //   setup: () => {
  //     markdownEditor?.setContent(text);
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
<style lang="scss" scoped>
.item {
  display: flex;
  .label {
    flex-shrink: 0;
  }
  .content {
    flex: auto;
    min-width: 0;
  }
}

#container {
  padding: 20px;
}
</style>
