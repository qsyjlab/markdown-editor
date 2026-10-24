# md-doc-editor

一个 markdown-it + Shiki + CodeMirror 6 驱动的 Markdown 编辑器 monorepo，v2 起原生支持 AI 流式渲染。

## 包结构

| 包 | 说明 |
|---|---|
| [@md-doc-editor/parser](packages/parser) | markdown 解析：块级增量解析、流式渲染会话、Shiki 高亮缓存、块级 DOM patch |
| [@md-doc-editor/editor](packages/editor) | 编辑器：CodeMirror 6 内核、工具栏/插件/TOC/滚动同步/预览 |
| [@md-doc-editor/theme](packages/theme) | 主题：CSS 变量体系（`--md-*`），亮暗双态 |
| [@md-doc-editor/build](build) | 构建工具链（rollup + gulp + d.ts 生成） |
| [play](play) | Vite + Vue3 演示场（`?demo=ai` 进入 AI 流式渲染演示） |

## 快速开始

```bash
pnpm install
pnpm build        # 构建全部包
pnpm run clean:dist

# 本地开发
cd play && pnpm dev   # http://localhost:5177
```

## 核心能力

- **块级增量渲染**：输入只重渲染变化的块，未变更代码块不重新高亮（BlockStore LRU + Shiki 双层缓存）
- **AI 流式渲染**：`parser.createStreamingSession()` / `preview.appendStreaming(chunk)`，已完成内容 DOM 稳定、无闪烁
- **AI 写作层**：`editor.ai` —— 厂商无关的 `AIProvider` 注入 + 内置/自定义动作（续写/润色/翻译），流式写入合并为单个撤销步骤，异常自动回滚；选区浮动菜单
- **公式与图表**：`parserOptions.math`（KaTeX）、`parserOptions.mermaid`（optional peer，未安装时源码降级）、`extraMarks`（脚注/上下标/高亮）
- **编辑体验**：格式化快捷键（Mod-B/I/K/Shift-X，可切换包裹）、查找替换（Mod-F）、草稿自动保存（`autoSave`）、字数状态栏
- **导出**：`editor.exportHtml()` / `downloadHtml()` 渲染 HTML + 页面样式快照内联为单文件
- **事件零泄漏**：预览事件一次性委托绑定，统一 `destroy()` 生命周期
- **可拓展**：`parserOptions.extend(md)` 注入自定义 markdown-it 插件；编辑器插件机制（init/toolbar/update/destroy）；类型安全事件总线

```ts
import { createMarkdownParser } from "@md-doc-editor/parser";

const parser = await createMarkdownParser();
parser.parseIncremental(text);        // 增量解析（返回变化区间）
const session = parser.createStreamingSession();
session.append(delta);                // AI 逐 chunk 输出
```

```ts
// AI 写作：宿主注入任意模型（SSE / SDK / Mock 均可）
editor.ai.setProvider({
  async *complete({ prompt, signal }) {
    for await (const delta of myLLMStream(prompt, signal)) yield delta;
  },
});
editor.ai.runAction("continue");      // 光标处流式续写
editor.ai.registerAction({            // 自定义动作
  name: "summary", label: "总结", mode: "insert-cursor",
  prompt: ({ before }) => `总结：\n${before}`,
});
```

## 文档

- [概要设计（v2 架构 / 数据流 / AI 渲染设计）](docs/ARCHITECTURE.md)
- [功能大纲与拓展路线](docs/ROADMAP.md)
- [样式规范](STYLE_GUIDE.md)

## v2 Breaking Changes（refactor/v2-breaking）

v1 的全部错误拼写 API 已一次性移除，迁移对照：

| v1（已移除） | v2 |
|---|---|
| `destory()` | `destroy()` |
| `parserdHtmlText` | `parsedHtml` |
| `isSyncScoll` | `isSyncScroll` |
| `hisotryPlugin` | `historyPlugin` |
| `strickoutPlugin` / `strickout` | `strikeoutPlugin` / `strikeout` |
| `MarkdownEditorPreviewOpitons` | `MarkdownEditorPreviewOptions` |
| `visbible` | `visible` |
| `.externa-link` | `.external-link` |
| `MarkdownOptions` | `EditorOptions` |

v2 新增：事件总线（`editor.on`）、AI 流式写入（`appendStreaming`）、统计（`getStats`）、状态栏、粘贴/拖拽图片上传，详见 [概要设计](docs/ARCHITECTURE.md)。
