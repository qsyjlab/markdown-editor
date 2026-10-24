import { EditorView } from "codemirror";
import {
  EditorState,
  EditorStateConfig,
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

  destroy() {
    this.instance?.destroy();
    this.instance = null;
  }
}
