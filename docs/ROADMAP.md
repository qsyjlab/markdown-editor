# md-doc-editor 功能大纲与拓展路线（Roadmap）

> 配套：[概要设计 ARCHITECTURE.md](./ARCHITECTURE.md)
> 状态标记：✅ 已有 / 🔧 v2 重构中补齐 / 🆕 规划中 / 🔮 远期

---

## 1. 现有能力盘点

### 1.1 编辑（editor 包）
- ✅ CodeMirror 6 编辑内核（markdown 语法包、行折叠、占位符）
- ✅ 工具栏：撤销/重做、清空、H1–H6、加粗、删除线、引用、链接、表格、代码、分隔线、任务列表、图片上传
- ✅ 布局：双栏 / 仅编辑 / 仅预览、全屏
- ✅ 同步滚动（编辑 ↔ 预览，基于 `data-line` 源码行映射）
- ✅ TOC 大纲侧栏 + 滚动跟随高亮
- ✅ 亮/暗主题切换（`md-theme` 属性驱动）
- ✅ 插件机制（init / toolbar / update / destroy）

### 1.2 解析（parser 包）
- ✅ markdown-it 核心 + attrs / anchor / headers 扩展
- ✅ Shiki 代码高亮（38+ 语言、双主题、diff/高亮记号 transformer）
- ✅ 自定义容器（tip / info / warning / danger / details）与代码组（tab 切换）
- ✅ 代码行号、复制按钮、代码语言徽标
- ✅ 图片懒加载 + 点击预览（缩放/平移）
- ✅ 外链新窗口打开、表格容器、任务列表
- ✅ 源码行映射（`data-line`）、BEM 化 scoped 类名（`md-*`）
- 🔧 块级增量解析、流式渲染会话、块级 DOM patch（v2 本次交付）

### 1.3 主题（theme 包）
- ✅ CSS 变量体系（`--md-*` ≈90 个 token）+ 亮暗双态
- 🔧 Shiki 双主题变量化、去 `!important`（v2 本次交付）

## 2. 功能补全计划（近期）

按"编辑体验 → 渲染能力 → 工程化"排序：

### 2.1 编辑体验
| 功能 | 说明 | 优先级 |
|---|---|---|
| ✅ 字数/字符统计（已交付） | `getStats()` + 工具栏状态栏（随 change 刷新） | P1 |
| ✅ 粘贴/拖拽图片（已交付） | 粘贴板图片、拖拽文件统一走 `imagesUploadHandler` | P1 |
| ✅ 查找替换（已交付） | CodeMirror search 面板（Mod-F / `editor.openSearch()`） | P2 |
| ✅ 快捷键中心（已交付） | Mod-B/I/Shift-X 格式化切换（可解包）、Mod-K 链接、Mod-S 存草稿；`options.hotkeys` 注入自定义 | P2 |
| ✅ 自动保存草稿（已交付） | `options.autoSave`：localStorage 防抖保存 + 初始化恢复 + `clearDraft()` | P2 |

### 2.2 渲染能力
| 功能 | 说明 | 优先级 |
|---|---|---|
| 🆕 Mermaid 图表（M3 已交付） | parser 可选插件 + `hydrateMermaid`（optional peer，未安装时源码降级），块级 patch 天然增量渲染 | P1 |
| ✅ 数学公式（M3 已交付） | KaTeX（`math` 选项，`@vscode/markdown-it-katex`），样式由宿主引入 | P1 |
| ✅ 脚注/上下标/标记（已交付） | `extraMarks` 选项：脚注 `[^1]`、下标 `~x~`、上标 `^x^`、高亮 `==x==` | P2 |
| ✅ 导出 HTML（M3 已交付） | `editor.exportHtml()/downloadHtml()`：渲染 HTML + 页面样式快照内联为单文件 | P2 |
| 🔮 导出 PDF/图片 | 基于导出 HTML + print 样式 | P3 |
| 🆕 ESM 按需加载语言 | Shiki 语言按需注册 API 已具备，补文档与细粒度 bundling | P2 |

### 2.3 工程化
| 事项 | 说明 | 优先级 |
|---|---|---|
| 🔧 单元测试 | ✅ vitest 已落地（块切分/哈希/patch 纯函数 + 流式会话），`pnpm --filter @md-doc-editor/parser test` | P1 |
| ✅ CI | GitHub Actions：pnpm install + parser 单测 + parser/theme/editor 构建 | P1 |
| 🔧 类型收紧 | 去除 `theme?: any`、`@ts-nocheck`，`noImplicitAny` 开启 | P1（部分完成） |
| 🆕 dts 一致性检查 | 发布前 API 面快照对比（防拼写再次入库） | P3 |

## 3. 拓展方向

### 3.1 AI 能力（确定方向，v2 已铺底座）

v2 的增量解析 + 流式渲染 + 稳定 DOM 是 AI 功能的**底座**。在其上分三层拓展：

**L1 流式渲染（v2 已交付）**
- `parser.createStreamingSession()` / `preview.appendStreaming(chunk)`：AI 逐 token 输出实时渲染，只重绘活动块。

**L2 AI 写作动作（✅ 已随 M2 交付核心，见 ARCHITECTURE §6.7）**
- ✅ `AIProvider` 抽象（宿主注入模型，AsyncIterable 流式 delta，编辑器不绑定厂商）；
- ✅ 内置动作：续写 / 润色 / 翻译 + `registerAction` 自定义拓展；
- ✅ 流式写入：整段输出单撤销步骤、abort 保留半成品、异常自动回滚；
- ✅ 工具栏 AI 下拉 + `aiStream*` 事件；
- ✅ 选区浮动菜单（floating-ui 定位，`options.aiSelectionMenu` 可关）；
- 🆕 行内"生成中"占位块。

```ts
// 宿主注入任意模型（fetch SSE / SDK 均可）
editor.ai.setProvider({
  async *complete({ prompt, signal }) {
    const res = await fetch("/api/llm", { method: "POST", body: prompt, signal });
    for await (const delta of readSSE(res)) yield delta;
  },
});
editor.ai.registerAction({
  name: "summary",
  label: "总结",
  mode: "insert-cursor",
  prompt: ({ before }) => `总结以下内容：\n${before}`,
});
```

**L3 AI 深度集成（远期，🔮）**
- 行内 diff 预览：AI 修改以"建议"形式呈现，逐块接受/拒绝（块级 patch 天然支持按块着色）；
- AI 命令面板（Cmd+K）：自然语言指令 → 编辑操作；
- 上下文工程：TOC/大纲 + 选区 + 当前块自动裁剪为 prompt 上下文；
- 多模态：截图 → mermaid/表格、语音输入。

### 3.2 协作（🔮 远期）
- Yjs CRDT 挂接 CodeMirror（官方 y-codemirror.next），预览端天然兼容增量管线；
- 需要：文档模型升级为 CRDT doc（编辑器侧），渲染侧不变 —— v2 的"渲染只依赖完整文本"设计使协作层对渲染透明。

### 3.3 插件生态（🆕 中期）
- 插件生命周期补全为 `init / update / destroy / commands / shortcuts`；
- 提供事件总线（`editor.on("change" | "selectionChange" | "blockRendered")`）；
- UI 组件（Dialog/Dropdown/Tooltip）独立导出为 `@md-doc-editor/ui`，供第三方插件复用；
- parser 侧插件包规范：`defineParserPlugin({ md, highlighter, hooks })`。

### 3.4 主题体系（🆕 中期）
- token 分层：primitive（色板）→ semantic（文本/背景/边框）→ component（`--md-code-block-*`）；
- 支持运行时注册第三方主题包（`editor.registerTheme("nord", tokens)`）；
- 内容排版主题与编辑器 chrome 主题解耦（主题包可只覆盖其一）。

## 4. 里程碑（状态盘点：refactor/v2-breaking，23 commits）

| 里程碑 | 内容 | 状态 |
|---|---|---|
| **M1 性能重构** | 块级增量解析 / 流式渲染会话 / BlockPatcher / 事件与监听器修复 / 去 !important 主题 | ✅ 已交付 |
| **M1.5 Breaking 清理** | 拼写 API 移除、类型收紧、EventBus、单测基建（vitest 28 用例） | ✅ 已交付 |
| **M2 AI 写作层** | AIProvider 抽象、动作系统、流式写入（单撤销步骤）、选区浮动菜单、Mock 演示 | ✅ 已交付 |
| **M3 渲染能力** | KaTeX / Mermaid（优雅降级）/ 导出 HTML / extraMarks 扩展语法 | ✅ 已交付 |
| **M3.5 编辑体验** | toggleWrap 格式化、快捷键、查找替换、草稿自动保存、CI | ✅ 已交付 |
| **架构审查** | diff 状态所有权 / 容器感知切分 / abort 语义 / 主题作用域 四项修正 | ✅ 已交付 |
| **M-合流发版** | 合并 refactor 分支 → master，版本 v2.0.0（breaking 升 major），lerna publish | ⏳ 待用户确认发版时机 |
| **M4 AI 深度** | ✅ 全部交付：行内 diff 建议（SuggestionBar 接受/拒绝/过期检测）+ AI 命令面板（Cmd+K 自然语言指令直接写入） | ✅ 已交付 |
| **M5 生态与协作** | Yjs 协作、主题 token 分层与运行时注册、`@md-doc-editor/ui` 独立包、defineParserPlugin 规范 | 🔮 远期 |

### 4.1 技术债清单（随迭代消化）

| 项 | 说明 | 优先级 |
|---|---|---|
| editor.scss 硬编码色值 | `.md-editor-toc-item:hover`、状态栏、AI 菜单的亮色值未走 CSS 变量，暗色下对比度差 | P1（M4 前顺手修） |
| 冒烟验证收尾 | AI 流式页（?demo=ai）、选区菜单真实点击、主题切换、草稿恢复、查找面板、导出下载尚未在浏览器实测 | P1 |
| noImplicitAny 全开 | tsconfig 逐步收紧（gen-types 当前宽松） | P2 |
| Shiki 语言按需加载 | API 已具备，补文档与按需 bundling 示例 | P2 |
| dts API 面快照 | 发布前对比 d.ts，防拼写再次入库 | P3 |
| 导出 PDF/图片 | 基于导出 HTML + print 样式 | P3 |

### 4.2 当前会话环境备注

- dev server：`npx vite dev` 运行于 http://localhost:5177（后台进程），验证完可停
- 本机 pnpm 9/11 安装死锁（代理+AV+句柄泄漏），本机用 npm+npmmirror 直装；CI（Linux）走 pnpm 正常
- `package.json` 的 `workspaces`/`overrides` 字段是 npm 兼容层，pnpm 不受影响
