<template>
  <div class="demo-nav">
    <a href="./?demo=editor">编辑器 Demo</a>
    <span>|</span>
    <a href="./?demo=ai">AI 流式渲染 Demo</a>
  </div>

  <div class="ai-demo">
    <div class="ai-demo-toolbar">
      <button :disabled="streaming" @click="start">开始流式渲染</button>
      <button :disabled="!streaming" @click="stop">暂停</button>
      <button @click="reset">重置</button>
      <span class="ai-demo-tip">模拟 AI 逐 chunk 输出，只重渲染"进行中的最后一块"</span>
    </div>

    <div class="ai-demo-stats">
      <span>已输出 {{ outputChars }} / {{ sample.length }} 字符</span>
      <span>块数 {{ blockCount }}</span>
      <span>本次渲染 {{ renderMs.toFixed(2) }} ms</span>
    </div>

    <div ref="containerRef" class="ai-demo-preview"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { MarkdownEditorPreview } from "@md-doc-editor/editor";

const containerRef = ref<HTMLElement>();

const streaming = ref(false);
const outputChars = ref(0);
const blockCount = ref(0);
const renderMs = ref(0);

let preview: MarkdownEditorPreview | null = null;
let timer: number | null = null;
let pos = 0;

const sample = `# AI 流式渲染演示

这个页面模拟大模型逐 token 输出 markdown 的场景。

## 为什么无闪烁？

解析器按块切分文档，已完成块的 HTML 被缓存冻结，DOM patcher 只替换
"正在生成的最后一块"，因此已有内容不会重排、图片不会重载、滚动不跳变。

## 代码块流式高亮

未闭合的围栏始终是活动块，每个 chunk 只对它重新高亮：

\`\`\`typescript
interface AIProvider {
  complete(req: {
    action: string;          // "continue" | "polish" | ...
    context: string;
    signal?: AbortSignal;
  }): AsyncIterable<string>; // 流式 delta
}
\`\`\`

## 列表也能流式

- 第一点：块级缓存让重复解析近乎零成本
- 第二点：前缀对齐保证中间编辑同样高效
- 第三点：流式会话与增量解析共享同一个 LRU 缓存

> 引用块：这就是 v2 的 AI Ready 底座。

## 表格

| 特性 | v1 | v2 |
| --- | --- | --- |
| 输入更新 | 全量 parse + innerHTML | 块级增量 patch |
| AI 流式 | 不支持 | StreamingRenderer |
| 事件监听 | 每次渲染重复注册 | 一次委托绑定 |
`;

const chunkSize = 16;
const interval = 24;

onMounted(async () => {
  const container = containerRef.value;
  if (!container) return;

  preview = new MarkdownEditorPreview();
  await preview.init();
  container.appendChild(preview.create() as HTMLElement);
});

onBeforeUnmount(() => {
  stop();
  preview?.destroy();
  preview = null;
});

function start() {
  if (!preview || streaming.value) return;
  streaming.value = true;

  timer = window.setInterval(() => {
    if (!preview) return stop();
    if (pos >= sample.length) {
      preview.finishStreaming();
      stop();
      return;
    }
    const chunk = sample.slice(pos, pos + chunkSize);
    pos += chunk.length;

    const t0 = performance.now();
    preview.appendStreaming(chunk);
    renderMs.value = performance.now() - t0;

    outputChars.value = pos;
    blockCount.value = preview.parsedHtml ? countBlocks() : 0;
  }, interval);
}

function stop() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  streaming.value = false;
}

function reset() {
  stop();
  pos = 0;
  outputChars.value = 0;
  blockCount.value = 0;
  renderMs.value = 0;
  preview?.setContent("");
}

function countBlocks() {
  return containerRef.value?.querySelectorAll("[data-md-block]").length || 0;
}
</script>

<style scoped>
.demo-nav {
  padding: 12px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
}

.ai-demo {
  padding: 0 20px 20px;
}

.ai-demo-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.ai-demo-toolbar button {
  padding: 6px 16px;
  cursor: pointer;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #f6f8fa;
}

.ai-demo-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-demo-tip {
  font-size: 12px;
  color: #656d76;
}

.ai-demo-stats {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #57606a;
  margin-bottom: 12px;
}

.ai-demo-preview {
  height: 70vh;
  overflow: auto;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 16px 24px;
}
</style>
