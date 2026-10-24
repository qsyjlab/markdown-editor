import type { MarkdownEditor } from "../editor";
import type { StreamEditHandle } from "../code-mirror";
import { lineDiff, type DiffLine } from "./diff";
import {
  AIAction,
  AIProvider,
  createDefaultAIActions,
} from "./provider";

export interface AIActionOptions {
  /**
   * 以"建议"模式执行：模型输出不直接写入文档，而是生成 diff 建议，
   * 由用户接受（写入并进入撤销历史）或拒绝。默认直接写入。
   */
  asSuggestion?: boolean;
}

export interface AISuggestion {
  id: string;
  action: string;
  /** 原文替换区间 [from, to)；插入型建议 from === to */
  from: number;
  to: number;
  originalText: string;
  suggestedText: string;
  /** 行级 diff 预览 */
  diff: DiffLine[];
}

/** 上下文窗口：送入 provider 的前后文字符数上限 */
export const AI_CONTEXT_LIMIT = 2000;

/**
 * AI 写作管理器：
 * - setProvider 注入宿主模型（编辑器不绑定任何厂商）
 * - registerAction 拓展动作（内置 续写/润色/翻译）
 * - runAction 以流式方式把模型输出写入文档（单个撤销步骤），
 *   经统一更新管线做块级增量渲染；asSuggestion 模式改为生成可
 *   接受/拒绝的行级 diff 建议
 */
export class EditorAIManager {
  private provider: AIProvider | null = null;

  private actions = new Map<string, AIAction>();

  private controller: AbortController | null = null;

  private currentAction: string | null = null;

  private suggestions = new Map<string, AISuggestion>();

  private suggestionSeq = 0;

  constructor(private editor: MarkdownEditor) {
    for (const action of createDefaultAIActions()) {
      this.actions.set(action.name, action);
    }
  }

  get isStreaming() {
    return this.currentAction !== null;
  }

  /** 是否已注入 provider（选区浮动菜单等 UI 依据此判断展示） */
  get hasProvider() {
    return this.provider !== null;
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

  getSuggestions(): AISuggestion[] {
    return Array.from(this.suggestions.values());
  }

  getSuggestion(id: string): AISuggestion | null {
    return this.suggestions.get(id) ?? null;
  }

  /**
   * 接受建议：将建议文本写入原区间（进入撤销历史）。
   * 原区间已被编辑（文本对不上）时返回 false，调用方应提示过期。
   */
  acceptSuggestion(id: string): boolean {
    const suggestion = this.suggestions.get(id);
    const view = this.editor.editorManager.instance;
    if (!suggestion || !view) return false;

    const current = view.state.sliceDoc(suggestion.from, suggestion.to);
    if (current !== suggestion.originalText) {
      // 文档已变化，建议过期：移除并通知
      this.suggestions.delete(id);
      this.editor.eventBus.emit("aiSuggestionExpire", { id });
      return false;
    }

    view.dispatch({
      changes: { from: suggestion.from, to: suggestion.to, insert: suggestion.suggestedText },
      selection: { anchor: suggestion.from + suggestion.suggestedText.length },
    });
    this.suggestions.delete(id);
    this.editor.finishStreaming();
    this.editor.eventBus.emit("aiSuggestionAccept", { id });
    return true;
  }

  /** 拒绝建议：丢弃，不修改文档 */
  rejectSuggestion(id: string) {
    if (!this.suggestions.delete(id)) return;
    this.editor.eventBus.emit("aiSuggestionReject", { id });
  }

  async runAction(name: string, options: AIActionOptions = {}): Promise<void> {
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

    const asSuggestion = options.asSuggestion === true;
    const controller = new AbortController();
    this.controller = controller;
    this.currentAction = name;
    this.editor.eventBus.emit("aiStreamStart", { action: name });

    // 直接写入模式使用；建议模式只缓冲
    let handle: StreamEditHandle | null = null;
    let buffer = "";

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
        if (asSuggestion) {
          buffer += delta;
          this.editor.eventBus.emit("aiStreamDelta", { action: name, delta });
        } else {
          if (!handle) {
            handle = this.editor.editorManager.beginStreamEdit(
              selectionRange.from,
              action.mode === "replace-selection" ? selectionRange.to : selectionRange.from
            );
          }
          handle.append(delta);
          this.editor.eventBus.emit("aiStreamDelta", { action: name, delta });
        }
      }

      handle = null; // 成功结束，保留写入内容

      if (asSuggestion) {
        // 建议模式：abort 的半成品也保留为建议（空输出丢弃）
        if (buffer.trim()) {
          this.createSuggestion(name, action.mode, selectionRange, selection, buffer);
        }
        this.editor.finishStreaming();
        this.editor.eventBus.emit("aiStreamEnd", {
          action: name,
          aborted: controller.signal.aborted,
        });
      } else {
        this.editor.finishStreaming();
        this.editor.eventBus.emit("aiStreamEnd", {
          action: name,
          aborted: controller.signal.aborted,
        });
      }
    } catch (error) {
      this.editor.finishStreaming();
      if (controller.signal.aborted) {
        // 用户中止：直接写入模式保留半成品；建议模式半成品同样落为建议
        if (asSuggestion && buffer.trim()) {
          this.createSuggestion(name, action.mode, selectionRange, selection, buffer);
        }
        this.editor.eventBus.emit("aiStreamEnd", {
          action: name,
          aborted: true,
        });
      } else {
        // 真实错误：直接写入模式回滚本次写入；建议模式丢弃缓冲
        handle?.cancel();
        this.editor.eventBus.emit("aiStreamError", {
          action: name,
          error: error as Error,
        });
      }
    } finally {
      this.controller = null;
      this.currentAction = null;
    }
  }

  private createSuggestion(
    action: string,
    mode: "replace-selection" | "insert-cursor",
    selectionRange: { from: number; to: number },
    selection: string,
    suggestedText: string
  ) {
    const suggestion: AISuggestion = {
      id: `ai-sug-${++this.suggestionSeq}`,
      action,
      from: selectionRange.from,
      to: mode === "replace-selection" ? selectionRange.to : selectionRange.from,
      originalText: mode === "replace-selection" ? selection : "",
      suggestedText,
      diff: lineDiff(
        mode === "replace-selection" ? selection : "",
        suggestedText
      ),
    };
    this.suggestions.set(suggestion.id, suggestion);
    this.editor.eventBus.emit("aiSuggestion", {
      id: suggestion.id,
      action,
    });
  }
}
