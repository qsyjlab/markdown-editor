<template>
  <div class="demo-nav">
    <a href="./?demo=editor">编辑器 Demo</a>
    <span>|</span>
    <a href="./?demo=ai">AI 流式渲染 Demo</a>
    <button class="demo-export" @click="markdownEditor?.downloadHtml('markdown-export')">
      导出 HTML
    </button>
    <span class="demo-tip">Mod-B/I 加粗斜体 · Mod-K 链接 · Mod-F 查找替换 · Mod-S 存草稿</span>
  </div>
  <div id="container"></div>
</template>
<script setup lang="ts">
import { MarkdownEditor, type AIProvider } from "@md-doc-editor/editor";

import { onMounted } from "vue";
import { text } from "./markdown";

let markdownEditor: MarkdownEditor | null;

onMounted(() => {
  initMarkdownEditor();
});

/**
 * Mock AI Provider：按词流式输出 canned 内容。
 * 真实场景替换为 fetch SSE / 任意 LLM SDK，编辑器侧代码不变。
 */
const mockProvider: AIProvider = {
  async *complete({ action, selection, signal }) {
    const reply =
      action === "polish"
        ? polish(selection)
        : action === "translate"
          ? translate(selection)
          : continueWriting(selection);

    for (const word of reply.split(/(?<=\s)/)) {
      if (signal?.aborted) return;
      await sleep(60);
      yield word;
    }
  },
};

const CONTINUATION = `

## AI 续写的内容

这段文字由 Mock Provider 流式生成：编辑器把模型输出按块写入文档，
已完成块的渲染被缓存冻结，正在生成的最后一块实时重绘。

- 整段 AI 输出合并为\`单个撤销步骤\`（Ctrl+Z 一次撤回）
- 中途可停止，已生成内容保留
- 异常自动回滚，文档不会停留在半截状态

\`\`\`ts
// 选中文本后试试工具栏里的 "AI 助手 → 润色 / 翻译"
editor.ai.runAction("continue");
\`\`\`
`;

function continueWriting(selection: string) {
  return selection ? `（基于选区续写）${CONTINUATION}` : CONTINUATION;
}

function polish(selection: string) {
  return `**${selection.trim()}** ——（Mock 润色：加强了语气并保留原意）`;
}

function translate(selection: string) {
  return `（Mock 译文）${selection.trim()}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initMarkdownEditor() {
  markdownEditor = new MarkdownEditor({
    container: document.getElementById("container") as HTMLElement,
    height: "88vh",
    // 草稿自动保存：刷新页面可恢复上次编辑内容
    autoSave: true,
    parserOptions: {
      math: true,
      mermaid: true,
    },
    imagesUploadHandler: (file, success) => {
      const url = rawFileToObjectURL(file);
      success(url);
    },

    setup: () => {
      markdownEditor?.setContent(text);
    },
    theme: "dark",
  });

  markdownEditor.ai.setProvider(mockProvider);

  markdownEditor.on("aiStreamEnd", ({ action, aborted }) => {
    console.log(`[ai] ${action} ${aborted ? "aborted" : "done"}`);
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

.demo-export {
  margin-left: auto;
  padding: 2px 10px;
  cursor: pointer;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #f6f8fa;
}

.demo-tip {
  font-size: 12px;
  color: #656d76;
}
</style>
