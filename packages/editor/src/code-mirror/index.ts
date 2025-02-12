import { EditorView } from "codemirror";
import {
  EditorState,
  EditorStateConfig,
  TransactionSpec,
} from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { debounce } from "lodash-es";
import { MarkdownEditor } from "../editor";
import { InsertCallback } from "./interface";
import { basicSetup } from "./extension";

export function createCodeMirror(editor: MarkdownEditor) {
  let instance: EditorView | null = null;

  function insertAndSelectText(callback: InsertCallback) {
    if (!instance) return;

    const { state, dispatch } = instance;
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

  function init(el: HTMLElement) {
    let startState = mergeState();
    instance = new EditorView({ state: startState, parent: el });
  }

  function setContent(val: string) {
    const state = mergeState({
      doc: val,
    });
    instance?.setState(state);
  }

  function mergeState(config: EditorStateConfig = {}) {
    const update = debounce(updateContent, 50);

    let startState = EditorState.create({
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            const value = v.state.doc.toString();

            update(value);
          }
        }),
      ],
      ...config,
    });
    return startState;
  }

  function updateContent(val: string) {
    requestAnimationFrame(() => {
      editor.preview?.setContent(val);
      editor.pluginManager.update();
    });
  }
  
  return {
    init,
    instance,
    setContent,
    insertAndSelectText,
  };
}
