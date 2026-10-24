import { EditorView } from "codemirror";
import {
  EditorState,
  EditorStateConfig,
  Transaction,
  TransactionSpec,
} from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { InsertCallback } from "./interface";
import { basicSetup } from "./extension";
import { placeholder } from "@codemirror/view";
import { undo, redo } from "@codemirror/commands";

interface CodemirrorManagerOptions {
  update?: (content: string) => void;

  onFocus?: () => void;
  onBlur?: () => void;
}

export interface StreamEditHandle {
  /** 追加一段流式文本（首个 append 会替换目标区间） */
  append(text: string): void;
  /** 撤销本次流式已写入的内容 */
  cancel(): void;
}

export class CodemirrorManager {
  public instance: EditorView | null = null;

  public options: CodemirrorManagerOptions;
  constructor(options: CodemirrorManagerOptions) {
    this.options = options;
  }

  create(el: HTMLElement) {
    const startState = this.mergeState();
    this.instance = new EditorView({ state: startState, parent: el });
  }

  insertAndSelectText(callback: InsertCallback) {
    if (!this.instance) return;

    const { state, dispatch } = this.instance;
    const { selection } = state;

    const transactiones: TransactionSpec[] = [];

    selection.ranges.forEach((range) => {
      let from = range.from;
      let to = range.to;
      if (from === to) {
        from = to = range.head;
      }

      const selectedText = state.sliceDoc(from, to);
      const { start, formattedText, end } = callback({
        selectedText,
        start: from,
        end: to,
      });

      transactiones.push({
        changes: { from, to, insert: formattedText },
        selection: { anchor: start, head: end }, // 设置新的选区
      });
    });

    const tr = state.update(...transactiones);
    dispatch(tr);
  }

  mergeState(config: EditorStateConfig = {}) {
    const startState = EditorState.create({
      extensions: [
        placeholder("请输入"),
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((v) => {
          if (v.focusChanged) {
            if (v.view.hasFocus) {
              this.options?.onFocus?.();
            } else {
              this.options?.onBlur?.();
            }
          }

          if (v.docChanged) {
            const value = v.state.doc.toString();

            this.options.update?.(value);
          }
        }),
      ],
      ...config,
    });
    return startState;
  }

  /**
   * 增量替换整个文档：通过 dispatch 而非 setState，
   * 保留撤销历史、光标（clamp 到新文档范围）与滚动位置。
   * docChanged 事件自然进入统一更新管线。
   */
  setContent(val: string) {
    if (!this.instance) return;
    const view = this.instance;
    const selection = view.state.selection.main;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: val },
      selection: {
        anchor: Math.min(selection.anchor, val.length),
        head: Math.min(selection.head, val.length),
      },
    });
  }

  undo() {
    if (!this.instance) return;

    undo(this.instance);
  }

  redo() {
    if (!this.instance) return;

    redo(this.instance);
  }

  /**
   * 流式编辑句柄（AI 写入用）：
   * 首个 append 在同一事务中替换目标区间，后续 append 以不进历史的方式追加，
   * 整段流式输出合并为单个撤销步骤。
   */
  beginStreamEdit(from: number, to: number): StreamEditHandle {
    const view = this.instance;
    if (!view) {
      throw new Error("[md-editor] CodeMirror is not created yet");
    }

    let pos = 0;
    let appended = false;

    const append = (text: string) => {
      if (!text || !this.instance) return;
      if (!appended) {
        this.instance.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
        pos = from + text.length;
        appended = true;
        return;
      }
      this.instance.dispatch({
        changes: { from: pos, to: pos, insert: text },
        annotations: Transaction.addToHistory.of(false),
      });
      pos += text.length;
    };

    return {
      append,
      /** 回滚本次流式写入的全部内容（用于错误恢复） */
      cancel: () => {
        if (!appended || !this.instance) return;
        this.instance.dispatch({
          changes: { from, to: pos },
          annotations: Transaction.addToHistory.of(false),
        });
      },
    };
  }

  destroy() {
    this.instance?.destroy();
    this.instance = null;
  }
}
