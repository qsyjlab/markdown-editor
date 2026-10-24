import type { MarkdownEditor } from "../editor";
import type { StreamEditHandle } from "../code-mirror";
import {
  AI_CONTEXT_LIMIT,
  AIAction,
  AIProvider,
  createDefaultAIActions,
} from "./provider";

export interface AIStreamingState {
  action: string;
  /** 用户主动中止时为 true */
  aborted: boolean;
}

/**
 * AI 写作管理器：
 * - setProvider 注入宿主模型（编辑器不绑定任何厂商）
 * - registerAction 拓展动作（内置 续写/润色/翻译）
 * - runAction 以流式方式把模型输出写入文档（单个撤销步骤），
 *   经统一更新管线做块级增量渲染
 */
export class EditorAIManager {
  private provider: AIProvider | null = null;

  private actions = new Map<string, AIAction>();

  private controller: AbortController | null = null;

  private currentAction: string | null = null;

  constructor(private editor: MarkdownEditor) {
    for (const action of createDefaultAIActions()) {
      this.actions.set(action.name, action);
    }
  }

  get isStreaming() {
    return this.currentAction !== null;
  }

  get current() {
    return this.currentAction;
  }

  setProvider(provider: AIProvider | null) {
    this.abort();
    this.provider = provider;
  }

  registerAction(action: AIAction) {
    this.actions.set(action.name, action);
  }

  removeAction(name: string) {
    this.actions.delete(name);
  }

  getActions(): AIAction[] {
    return Array.from(this.actions.values());
  }

  /** 动作当前是否可用（需要选区的动作在无选区时禁用） */
  isActionEnabled(name: string) {
    const action = this.actions.get(name);
    if (!action) return false;
    if (action.requiresSelection) {
      const selection = this.editor.editorManager.instance?.state.selection.main;
      return !!selection && !selection.empty;
    }
    return true;
  }

  /** 中止进行中的流式动作 */
  abort() {
    if (this.controller) {
      this.controller.abort();
    }
  }

  async runAction(name: string): Promise<void> {
    if (this.currentAction !== null) {
      console.warn("[md-editor] AI action already running");
      return;
    }

    const action = this.actions.get(name);
    if (!action) {
      console.warn(`[md-editor] unknown AI action: ${name}`);
      return;
    }

    const provider = this.provider;
    if (!provider) {
      console.warn("[md-editor] no AI provider, call editor.ai.setProvider() first");
      this.editor.eventBus.emit("aiStreamError", {
        action: name,
        error: new Error("No AI provider configured"),
      });
      return;
    }

    const view = this.editor.editorManager.instance;
    if (!view) return;

    const selectionRange = view.state.selection.main;
    const docText = view.state.doc.toString();
    const selection = docText.slice(selectionRange.from, selectionRange.to);

    if (action.requiresSelection && !selection) {
      this.editor.eventBus.emit("aiStreamError", {
        action: name,
        error: new Error("This action requires a selection"),
      });
      return;
    }

    const anchor = action.mode === "replace-selection" ? selectionRange.from : selectionRange.to;
    const before = docText.slice(Math.max(0, anchor - AI_CONTEXT_LIMIT), anchor);
    const after = docText.slice(anchor, Math.min(docText.length, anchor + AI_CONTEXT_LIMIT));

    const controller = new AbortController();
    this.controller = controller;
    this.currentAction = name;
    this.editor.eventBus.emit("aiStreamStart", { action: name });

    let handle: StreamEditHandle | null = null;

    try {
      const stream = provider.complete({
        action: name,
        prompt: action.prompt({ selection, before, after }),
        selection,
        context: { before, after },
        signal: controller.signal,
      });

      for await (const delta of stream) {
        if (controller.signal.aborted) break;
        if (!handle) {
          handle = this.editor.editorManager.beginStreamEdit(
            selectionRange.from,
            action.mode === "replace-selection" ? selectionRange.to : selectionRange.from
          );
        }
        handle.append(delta);
        this.editor.eventBus.emit("aiStreamDelta", { action: name, delta });
      }

      handle = null; // 成功结束，保留写入内容
      this.editor.finishStreaming();
      this.editor.eventBus.emit("aiStreamEnd", {
        action: name,
        aborted: controller.signal.aborted,
      });
    } catch (error) {
      // 错误时回滚本次已流式写入的内容，避免文档停留在半截状态
      handle?.cancel();
      this.editor.finishStreaming();
      this.editor.eventBus.emit("aiStreamError", { action: name, error: error as Error });
    } finally {
      this.controller = null;
      this.currentAction = null;
    }
  }
}
