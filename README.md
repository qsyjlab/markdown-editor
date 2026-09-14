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
- **事件零泄漏**：预览事件一次性委托绑定，统一 `destroy()` 生命周期
- **可拓展**：`parserOptions.extend(md)` 注入自定义 markdown-it 插件；编辑器插件机制（init/toolbar/update/destroy）

```ts
import { createMarkdownParser } from "@md-doc-editor/parser";

const parser = await createMarkdownParser();
parser.parseIncremental(text);        // 增量解析（返回变化区间）
const session = parser.createStreamingSession();
session.append(delta);                // AI 逐 chunk 输出
```

## 文档

- [概要设计（v2 架构 / 数据流 / AI 渲染设计）](docs/ARCHITECTURE.md)
- [功能大纲与拓展路线](docs/ROADMAP.md)
- [样式规范](STYLE_GUIDE.md)

## v2 兼容性说明

v1 的拼写错误 API（`destory` / `parserdHtmlText` / `isSyncScoll` / `hisotryPlugin` / `.externa-link`）均保留 deprecated 别名，新代码请使用 `destroy` / `parsedHtml` / `isSyncScroll` / `historyPlugin` / `.external-link`。
