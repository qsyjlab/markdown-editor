# md-doc-editor 概要设计（v2 重构）

> 分支：`refactor/v2-architecture`
> 范围：`@md-doc-editor/parser`、`@md-doc-editor/editor`、`@md-doc-editor/theme`、`play`
> 配套文档：[功能大纲与拓展路线 ROADMAP.md](./ROADMAP.md)、[样式规范 STYLE_GUIDE.md](../STYLE_GUIDE.md)

---

## 1. 背景与问题诊断

v1 实现可用但粗糙，核心问题按严重程度排序：

| # | 问题 | 位置 | 后果 |
|---|------|------|------|
| 1 | 每次按键全量重新 parse 整个文档，Shiki 全量重新高亮，然后整体 `innerHTML` 替换 | `editor.ts` 更新管线 → `preview/index.ts` | 大文档输入卡顿；滚动/图片加载/DOM 状态全部丢失；无法支撑 AI 流式输出 |
| 2 | 事件监听器每次渲染重复注册且永不清理：code-group 往 `window` 上堆、copy-code 往 contentEl 上堆、image 每次 new 一个 IntersectionObserver | `parser/src/events/*` | 监听器随渲染次数线性泄漏 |
| 3 | `CodemirrorManager.setContent` 用 `setState` 整体重建 EditorState | `code-mirror/index.ts` | 撤销历史、光标、滚动位置全部丢失 |
| 4 | scroll-manager 监听器 add/remove 引用不一致（debounce+bind 后的函数 vs 原函数），`openSync` 可重复叠加；预览滚动回调未节流，逐 heading 调 `getBoundingClientRect` | `scroll-manager.ts` | 监听器无法移除；滚动布局抖动 |
| 5 | 无状态管理层，`MarkdownEditor` 是 383 行 God Object，18 个插件直接伸手改它的字段 | `editor.ts`、`plugins/*` | 任何跨功能交互都是硬编码 |
| 6 | 随包发布的死代码：`command-manager.ts`、`plugins/math.ts`（mathjax3/prism 依赖）、空文件、`play` 里整套废弃 demo | 多处 | 包体积与维护噪音 |
| 7 | 公开 API 拼写错误：`destory` / `parserdHtmlText` / `isSyncScoll` / `hisotryPlugin` / `.externa-link` | 多处 | API 面不可信 |
| 8 | 主题：shiki 暗色覆盖依赖 `!important` 对抗行内样式，违反 STYLE_GUIDE；theme 的 gulp watch 监听 `*.ts` 导致 watch 永不生效 | `theme/src/index.scss`、`theme/gulpfile.ts` | 样式不可定制、开发体验差 |
| 9 | `toggleFullscreen(值)` 直接 return，DOM 永远不更新；`getContent()` 永远返回空串 | `editor.ts` | 功能性 bug |
| 10 | TOC 每次 update 全量清空重建 DOM，heading 查询每次更新执行两遍 | `sidebar-manager.ts`、`editor.ts` | 无谓 DOM churn |

## 2. v2 目标

1. **性能**：输入、AI 流式输出均只增量处理"变化的部分"；未变更代码块不重新高亮；未变更 DOM 节点不被替换。
2. **AI Ready**：提供流式渲染一等 API（`StreamingRenderer` + `appendStreaming`），AI 逐 token 输出时只重渲染"正在生成的最后一块"，已完成内容 DOM 稳定不闪烁。
3. **可拓展**：插件生命周期补全、更新管线收敛为单一数据流、parser 支持外部扩展 markdown-it 实例。
4. **兼容**：所有拼写修正保留 deprecated 别名，v1 调用方代码不必立刻修改。

## 3. 总体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        消费方（play / 应用层）                     │
└──────────────┬──────────────────────────────────────────────────┘
               │ new MarkdownEditor(options) / createMarkdownParser()
┌──────────────▼──────────────────────────────────────────────────┐
│ editor 包                                                        │
│  MarkdownEditor（facade，组合与对外 API）                          │
│  ├─ CodemirrorManager      CodeMirror 6 封装（dispatch 增量写）    │
│  ├─ EditorToolbarManager   工具栏（DOM 注册/状态）                 │
│  ├─ EditorPluginManager    插件注册/更新/销毁                      │
│  ├─ EditorScrollManager    编辑↔预览滚动同步（缓存 data-line 索引） │
│  ├─ SidebarManager         TOC（签名比对增量更新）                 │
│  ├─ EditorPreviewManager ──┐                                    │
│  └─ UpdatePipeline         唯一数据流入口（debounce + rAF 节流）   │
└──────────────┬──────────────────────────────────────────────────┘
               │ parseIncremental / StreamingRenderer / 块级 patch
┌──────────────▼──────────────────────────────────────────────────┐
│ parser 包                                                        │
│  createMarkdownParser                                            │
│  ├─ markdown-it 实例（插件按序注册，可 extend）                     │
│  ├─ Highlighter（Shiki + LRU 缓存 + 双主题 CSS 变量化）            │
│  ├─ BlockStore        块切分 / 哈希 / HTML 缓存                   │
│  ├─ parseIncremental  块级增量解析                                │
│  ├─ StreamingRenderer 流式会话（append → 稳定块 + 变化块）         │
│  ├─ BlockPatcher      块级 DOM diff（prefix/suffix 对齐）         │
│  └─ events            一次性委托绑定 + cleanup（copy/group/image） │
└──────────────┬──────────────────────────────────────────────────┘
               │ CSS（md-* BEM 变量体系）
┌──────────────▼──────────────────────────────────────────────────┐
│ theme 包：纯 SCSS → CSS，CSS 变量主题（md-theme="light|dark"）     │
└─────────────────────────────────────────────────────────────────┘
```

分层规则：

- **parser 不依赖 editor**；只产出 HTML 字符串与 patch 描述，DOM 操作仅限事件委托与 BlockPatcher。
- **editor 不直接拼接预览 HTML**；一切渲染经 parser 的增量 API。
- **theme 不含逻辑**；只消费 parser 产出的 `md-*` 类名与 CSS 变量。

## 4. 核心数据流（v2）

```
键盘输入
  → CodeMirror updateListener(docChanged)
  → UpdatePipeline.schedule (80ms debounce)
      ├─ parser.parseIncremental(doc)        // 只渲染哈希变化的块
      ├─ BlockPatcher.apply(preview DOM)     // prefix/suffix 对齐，只替换变化的块节点
      ├─ preview.refreshImages()             // 只观察新增图片块
      ├─ headings = preview.headings         // patch 时已缓存，不重复查询
      ├─ sidebar.updateHeading(headings)     // 签名相同则跳过 DOM 重建
      └─ options.onChange(md, html)

AI 流式输出
  → session = parser.createStreamingSession()
  → session.append(chunk)                    // 只重解析"进行中的最后一块"
  → preview.applyStreamingChange(change)     // 已完成块 DOM 稳定，无闪烁
```

唯一数据流原则：**任何对文档内容的修改都经过 UpdatePipeline**，插件不再各自调用 `previewManager.setContent`。

## 5. Parser 增量与流式设计

### 5.1 块切分（`splitMarkdownBlocks`）

按"顶层空行"切块，但保留 markdown 结构连续性：

- 围栏代码块（``` / ~~~）内部不切块（含未闭合围栏——AI 输出中间态的关键）；
- 引用块（`>` 行）跨越空行合并；
- 列表项跨越单个空行合并（松散列表正确性）。

> 取舍：极少数结构（setext 标题跨空行等）在增量模式下与全量解析存在差异，`parse()`（全量）保留原语义，可用于要求严格一致的场景。

### 5.2 块缓存（`BlockStore`）

- key：FNV-1a 哈希（内容指纹，防长文本 key 开销）+ 长度校验；
- value：`md.render(block)` 的 HTML；
- LRU 上限 512 块，防止长会话内存膨胀；
- 命中即跳过 markdown-it + Shiki（Shiki 自身再有 lang+code 级 LRU 双保险）。

### 5.3 增量解析（`parseIncremental`）

```ts
interface IncrementalResult {
  html: string;                 // 拼接后的完整 HTML（兼容旧消费方）
  blocks: ParsedBlock[];        // [{ index, hash, html }]
  changedFrom: number;          // 与上次相比，从第几个块起变化
}
```

diff 算法：头尾双向对齐（prefix / suffix），中间区间重新渲染。在文档中段编辑时，未受影响的块零成本。

### 5.4 流式渲染（`StreamingRenderer` / `createStreamingSession`）

```ts
const session = parser.createStreamingSession();
session.append(deltaText);      // AI 增量 chunk
// → { blocks, changedFrom, html }
session.setText(fullText);      // 或整段替换（自动走块 diff）
session.finish();               // 收尾：强制最后一块定稿渲染
```

- 已完成块（后跟空行/闭合围栏）哈希冻结，后续 append 不再触碰；
- 未闭合的围栏代码块始终是"活动块"，每 chunk 只重渲染它 → 高亮 O(chunk)；
- `changedFrom` 驱动 BlockPatcher 只重建尾部节点，**已完成内容 DOM 节点恒定**（图片不重载、滚动位置不跳、动画不重放）。

### 5.5 块级 DOM Patch（`BlockPatcher`）

- 每个块渲染结果可能含多个兄弟节点，patch 时按块记录节点区间（`data-md-block` 标记由 patcher 在 DOM 上维护，不污染 parser 输出 HTML）；
- 变化区间：解析进 `DocumentFragment` 后原子替换旧区间；
- 前后缀对齐保证"在中间打字"也只动一个块。

### 5.6 事件生命周期（parser/events）

- `bindPreviewEvents(container, options)` 在容器 `create()` 时**只调用一次**；
- copy-code / code-group 全部改为容器内事件委托（动态插入的节点自动生效，无需重绑）；
- image 懒加载暴露 `refresh()`：patch 后只观察新出现的 `.md-image-block`；
- 每个绑定返回 cleanup，`destroy()` 统一释放（修复 code-group 的 window 泄漏与 copy-code 的无效清理）。

## 6. Editor 层设计

### 6.1 UpdatePipeline（新文件 `update-pipeline.ts`）

从 God Object 抽出的唯一更新入口，职责：防抖调度、调用增量渲染、分发 headings/插件/onChange。`MarkdownEditor` 退化为 facade（组装 + 对外 API）。

### 6.2 CodemirrorManager

- `setContent(val)`：`view.dispatch({ changes })` 增量替换，保留撤销历史与光标（光标 clamp 到新文档末尾）；
- 输入经 dispatch 自然进入同一数据流（v1 中 setState 会绕过 updateListener）。

### 6.3 EditorScrollManager

- debounce 后的函数保存引用 → `addListener` 幂等、`removeListener` 真实生效；
- 预览滚动 → heading 计算走 rAF 节流，headings 复用 preview 缓存；
- `[data-line]` 元素索引按 `preview.contentVersion` 缓存失效，滚动同步不再每次全量 querySelector。

### 6.4 SidebarManager

- heading 签名（`id|level|title` 序列）比对，未变化只更新激活态；
- 重建走 DocumentFragment + textContent（不使用 innerHTML，防注入）。

### 6.5 Breaking Changes（refactor/v2-breaking 分支）

经明确授权，v2 重构**不再保留 v1 错误拼写 API**，一次清理到位：

| v1（已移除） | v2（正确 API） |
|---|---|
| `destory()` | `destroy()`（所有类统一） |
| `parserdHtmlText` | `parsedHtml` / `parsedHtmlText` |
| `isSyncScoll` option | `isSyncScroll` |
| `hisotryPlugin` | `historyPlugin` |
| `strickoutPlugin` / 工具栏名 `strickout` | `strikeoutPlugin` / `strikeout` |
| `MarkdownEditorPreviewOpitons` | `MarkdownEditorPreviewOptions` |
| `Dialog/DropdownMenu.visbible` | `visible` |
| `.externa-link` 类名（parser 输出与 CSS） | `.external-link` |
| `MarkdownOptions` | `EditorOptions` |

### 6.6 v2 新增 API（refactor/v2-breaking）

- **事件总线**：`editor.eventBus`（`on/off/emit`），事件 `change / focus / blur / themeChange / layoutChange / destroy`，类型安全（`EditorEvents` 约束 payload）；`editor.on("change", cb)` 快捷订阅。
- **AI 流式写入编辑器**：`editor.appendStreaming(chunk)`（CodeMirror dispatch 追加，自然进入更新管线、可撤销）+ `editor.finishStreaming()`；预览侧独立流式仍走 `previewManager.appendStreaming`。
- **统计**：`editor.getStats()` → `{ characters, words, lines }`（CJK 按字、西文按词）。
- **状态栏**：`options.statusBar`（默认开）工具栏右侧字数统计，随 change 事件刷新。
- **粘贴 / 拖拽图片上传**：复用 `imagesUploadHandler`，上传后以 markdown 图片语法插入光标处。
- **焦点**：`editor.focus() / editor.blur()`；`getContent()` 改为直接读 CodeMirror 文档（防抖窗口内不再返回旧值）。

## 7. 主题设计（theme）

- Shiki 双主题改为 `defaultColor: false`：行内只剩 `--shiki-light / --shiki-dark` 变量，暗色切换纯 CSS 变量选择，**移除全部 `!important`**（符合 STYLE_GUIDE 第 5 节）；
- `.shiki` 背景交给 `--md-code-block-bg` 主题变量，代码内容色交给 shiki 变量，两层解耦；
- theme gulpfile watch 修正为 `src/**/*.scss`；
- 编辑器 chrome 样式（editor 包）与内容样式（theme 包）维持现状，变量命名统一走 `--md-*`，为 ROADMAP 中的"主题 token 化"预留空间。

## 8. 构建与包

- parser/editor 维持 Rollup preserveModules ESM + ts-morph 生成 d.ts；
- 移除 parser 未用依赖（`markdown-it-mathjax3`、`markdown-it-prism`）与死源码（`plugins/math.ts`、空 `plugins/header.ts`）；
- 包根 `packages/parser/index.ts` 修正为真实 re-export（build 包 alias 指向此处）；
- `play` 清理死代码，新增 AI 流式渲染演示（`play/src/ai-demo.vue`，URL `?demo=ai` 进入）。

## 9. 验证策略

1. `pnpm build` 全量构建（parser / editor / theme / play）；
2. play 手工场景：大文档输入（块缓存命中）、AI 流式模拟（DOM 稳定性）、代码组/复制/图片懒加载/暗色主题回归；
3. 兼容冒烟：v1 拼写 API（`destory` 等）继续可用。
