import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function quotePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "quote";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg('<path d="M554.666667 341.333333a85.333333 85.333333 0 0 1 85.333333-85.333333h128a85.333333 85.333333 0 0 1 85.333333 85.333333v170.666667a42.666667 42.666667 0 0 1-42.666666 42.666667h-170.666667a85.333333 85.333333 0 0 1-85.333333-85.333334V341.333333z m213.333333 0h-128v128h128V341.333333z" fill="#14181F" p-id="2018"></path><path d="M810.666667 469.333333a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a170.666667 170.666667 0 0 1-170.666666 170.666667 42.666667 42.666667 0 1 1 0-85.333333 85.333333 85.333333 0 0 0 85.333333-85.333334v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667zM170.666667 341.333333a85.333333 85.333333 0 0 1 85.333333-85.333333h128a85.333333 85.333333 0 0 1 85.333333 85.333333v170.666667a42.666667 42.666667 0 0 1-42.666666 42.666667H256a85.333333 85.333333 0 0 1-85.333333-85.333334V341.333333z m213.333333 0H256v128h128V341.333333z" fill="#14181F" p-id="2019"></path><path d="M426.666667 469.333333a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a170.666667 170.666667 0 0 1-170.666666 170.666667 42.666667 42.666667 0 1 1 0-85.333333 85.333333 85.333333 0 0 0 85.333333-85.333334v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z"></path>')
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "引用",
    onAction: () => {
      editor.insert((params) => {
        const { selectedText, start } = params;

        const prefix = `\n> `;

        const finalStart = start + prefix.length

        return {
          formattedText: prefix + selectedText,
          start: finalStart,
          end: finalStart,
        };
      });
    },
  });

  return {
    name,
  };
}
