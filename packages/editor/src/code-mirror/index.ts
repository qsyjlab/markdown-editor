import { EditorView } from "codemirror";
import {
  EditorState,
  EditorStateConfig,
  TransactionSpec,
} from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { InsertCallback } from "./interface";
import { basicSetup } from "./extension";

interface CodemirrorManagerOptions {

  update?: (content: string) => void;

}

export class CodemirrorManager {
  public instance: EditorView | null = null;

  public options:CodemirrorManagerOptions;
  constructor(options:CodemirrorManagerOptions) {
    this.options = options
  }

  create(el: HTMLElement) {
    let startState = this.mergeState();
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


    let startState = EditorState.create({
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((v) => {
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

  setContent(val: string) {
    const state = this.mergeState({
      doc: val,
    });
    this.instance?.setState(state);
  }
}
