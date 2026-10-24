/**
 * AI 能力抽象层：编辑器不绑定任何模型厂商，宿主通过 setProvider 注入。
 *
 * 职责划分：
 * - AIAction（编辑器侧）：定义动作语义（续写/润色/...）与流式写入模式、构建 prompt
 * - AIProvider（宿主侧）：接收请求，调用任意 LLM，以 AsyncIterable 产出增量文本
 *
 * 拓展方式：registerAction 注册自定义动作；provider 可忽略 action.prompt
 * 自行组装上下文（例如走工具调用/结构化输出的模型管线）。
 */

export interface AIContext {
  /** 选区前文（已按窗口裁剪） */
  before: string;
  /** 选区后文（已按窗口裁剪） */
  after: string;
}

export interface AICompleteRequest {
  /** 动作名（内置 continue/polish/translate 或自定义） */
  action: string;
  /** 由动作定义构建好的 prompt，provider 可直接使用也可忽略 */
  prompt: string;
  /** 当前选区文本（可为空） */
  selection: string;
  /** 选区前后上下文 */
  context: AIContext;
  /** 中止信号（用户 abort 时触发） */
  signal?: AbortSignal;
}

export interface AIProvider {
  complete(req: AICompleteRequest): AsyncIterable<string>;
}

/** 流式写入模式 */
export type AIStreamMode =
  /** 用流式输出替换当前选区 */
  | "replace-selection"
  /** 在光标处插入流式输出（不删除任何内容） */
  | "insert-cursor";

export interface AIActionPromptContext {
  selection: string;
  before: string;
  after: string;
}

export interface AIAction {
  name: string;
  label: string;
  mode: AIStreamMode;
  /** 为 true 且无选区时动作不可用 */
  requiresSelection?: boolean;
  /** 构建发给模型的 prompt */
  prompt(ctx: AIActionPromptContext): string;
}

/** 上下文窗口：送入 provider 的前后文字符数上限 */
export const AI_CONTEXT_LIMIT = 2000;

export function createDefaultAIActions(): AIAction[] {
  return [
    {
      name: "continue",
      label: "续写",
      mode: "insert-cursor",
      prompt: ({ before, selection }) =>
        [
          "你是 markdown 写作助手。请顺着上文自然续写，直接输出续写内容本身，",
          "不要复述上文、不要解释。",
          before ? `\n--- 上文 ---\n${before}` : "",
          selection ? `\n--- 光标处已有内容 ---\n${selection}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    {
      name: "polish",
      label: "润色",
      mode: "replace-selection",
      requiresSelection: true,
      prompt: ({ selection }) =>
        `你是 markdown 写作助手。请润色以下内容，保持原意与 markdown 结构，直接输出润色结果：\n\n${selection}`,
    },
    {
      name: "translate",
      label: "翻译为中文",
      mode: "replace-selection",
      requiresSelection: true,
      prompt: ({ selection }) =>
        `你是翻译助手。将以下内容翻译为简体中文，保留 markdown 结构与代码块，直接输出译文：\n\n${selection}`,
    },
  ];
}
