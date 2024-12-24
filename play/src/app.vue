<template>
  <div class="md-render-container">
    <div v-html="html"></div>
  </div>
</template>
<script setup lang="ts">

import { createParser } from "@markdown-editor/parser";

import "@markdown-editor/theme/style.scss";
import { onMounted, ref } from "vue";
import { text } from './markdown'


const html = ref("");

onMounted(()=> {
  initMarkdown()
})
async function initMarkdown() {
  const parser = await createParser({
    enableLineNumber: true
  });
  html.value = parser.parse(text)
}
</script>
<style scoped></style>
