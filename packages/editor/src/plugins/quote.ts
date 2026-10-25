import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function quotePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "quote";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.quote)
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
