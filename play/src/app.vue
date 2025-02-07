<template>
  <div id="container"></div>
</template>
<script setup lang="ts">
import {
  createMarkdownParser,
  bindCodeGroupsEvent,
  bindCopyCodeEvent,
  bindLazyLoadImageEvent,
} from "@markdown-editor/parser";

import { MarkdownEditor } from "@markdown-editor/editor";

import "@markdown-editor/theme/style.scss";
import "@markdown-editor/theme/editor/editor.scss";

import { nextTick, onMounted, ref } from "vue";
import { text } from "./markdown";

const html = ref("");

let markdownEditor: MarkdownEditor | null;
// const content = ref("");

onMounted(() => {
  initMarkdownEditor()
  // initMarkdown();
});

function initMarkdownEditor() {
  markdownEditor = new MarkdownEditor({
    container: document.getElementById("container") as HTMLElement,
    height: '800px',
    setup: ()=> {
      markdownEditor?.setContent(text)
    }
  });

  console.log("markdownEditor",markdownEditor)

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
