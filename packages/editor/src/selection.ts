import { MarkdownEditor } from "./editor";

export function createSelectionManager(
  editor: MarkdownEditor
): SelectionManager {
  return {
    setSelectionRange: (start, end) => {
      editor.editable!.setSelectionRange(start, end);
    },
    setSelectionStart: (start) => {
      editor.editable!.selectionStart = start;
    },
    getSelection: () => {
      const editable = editor.editable;

      if (!editable) return;

      const selectionStart = editable.selectionStart;
      const selectionEnd = editable.selectionEnd;
      
      const selectedText = editable.value.substring(
        selectionStart,
        selectionEnd
      );
      return {
        selectedText,
        selectionStart,
        selectionEnd,
      };
    },
  };
}

export interface SelectionManager {
  setSelectionRange: (start: number, end: number) => void;
  setSelectionStart: (start: number) => void;
  getSelection: () =>
    | {
        selectedText: string;
        selectionStart: number;
        selectionEnd: number;
      }
    | undefined;
}
