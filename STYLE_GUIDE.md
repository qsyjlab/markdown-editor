# CSS 样式重构规范与指南

本文档详细说明了 Markdown Editor 项目的 CSS 样式重构规范、类名映射关系及使用指南。

## 1. 命名规范

所有类名必须遵循 BEM (Block Element Modifier) 风格的变体，并统一使用 `md-` 作为前缀。

*   **统一前缀**: `md-`
*   **编辑器组件**: `md-editor-xxx`
*   **Markdown 内容组件**: `md-xxx` (如 `md-custom-block`, `md-code-block`)
*   **状态修饰符**: `.is-active`, `.is-fullscreen` 等 (保持现有习惯) 或使用 `md-` 前缀的修饰类 (如 `md-line-numbers-mode`)

## 2. 类名映射对照表

以下列出了重构前后的类名对应关系：

| 模块 | 原类名 | 新类名 | 说明 |
| :--- | :--- | :--- | :--- |
| **Custom Block** | `.custom-block` | `.md-custom-block` | 自定义容器 |
| | `.custom-block-title` | `.md-custom-block-title` | 自定义容器标题 |
| **Code Block** | `.code` | `.md-code-block` | 代码块容器 |
| | `.lang` | `.md-code-lang` | 代码语言标记 |
| | `.line-numbers-wrapper` | `.md-line-numbers-wrapper` | 行号容器 |
| | `.line-number` | `.md-line-number` | 单个行号 |
| | `.line-numbers-mode` | `.md-line-numbers-mode` | 启用行号模式 |
| | `.highlighted` | `.md-highlighted` | 高亮行 |
| | `.highlighted-word` | `.md-highlighted-word` | 高亮词 |
| | `.diff` | `.md-diff` | Diff 标记 |
| **Code Group** | `.md-code-group` | `.md-code-group` | 代码组容器 (保持不变) |
| | `.tabs` | `.md-code-group-tabs` | 代码组标签栏 |
| | `.blocks` | `.md-code-group-blocks` | 代码组内容区 |
| **Copy Button** | `.copy` | `.md-copy-btn` | 复制代码按钮 |
| **Preview Image**| `.md-editor-image-prview-modal` | `.md-editor-image-preview-modal` | 修正拼写错误 |
| **General** | `.icon-button` | `.md-icon-button` | 通用图标按钮 |

## 3. 结构调整说明

*   **扁平化**: 尽量避免过深的嵌套。例如，`.md-custom-block` 的样式直接定义，不再嵌套在 `.md-editor-preview-body` 内部（但在 `index.scss` 中为了保证优先级可能会有部分引用）。
*   **独立性**: 功能模块的样式（如 `code-group.scss`, `custom-block.scss`）独立维护，并导出统一的类名。
*   **Parser 适配**: Parser 生成的 HTML 结构已同步更新，直接输出带有 `md-` 前缀的类名。

## 4. 开发指南

### 新增样式
当添加新的样式或组件时，请遵循以下步骤：
1.  确认组件所属模块（Editor UI 还是 Markdown Content）。
2.  使用 `md-` 前缀命名。
3.  在 `packages/theme/src` 下创建或修改对应的 SCSS 文件。
4.  如果是 Parser 生成的 HTML，请同步修改 `packages/parser/src/plugins` 下的渲染逻辑。

### 修改现有样式
1.  在 `STYLE_GUIDE.md` 中查找类名映射。
2.  确保修改不会破坏现有的选择器优先级。

## 5. Shiki 主题适配
代码高亮现在完全依赖 CSS 变量，不再使用 `!important` 强制覆盖。
*   Light Mode: 默认使用 Shiki 生成的颜色。
*   Dark Mode: 通过 `[md-theme="dark"]` 选择器设置 CSS 变量覆盖 Shiki 默认样式。
