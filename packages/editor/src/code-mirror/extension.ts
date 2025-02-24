import {
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";
export { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from "@codemirror/language";
import { history, historyKeymap } from "@codemirror/commands";
import { highlightSelectionMatches } from "@codemirror/search";
import {
  closeBrackets,
  autocompletion,
} from "@codemirror/autocomplete";

export const basicSetup = (() => [
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    // ...defaultKeymap,
    ...historyKeymap,
    // ...completionKeymap,
    // ...lintKeymap,
  ]),
])();
