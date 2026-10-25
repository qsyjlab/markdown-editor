import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";
export function splitLinePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "splitLine";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.minus)
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "分割线",
    onAction: () => {
      editor.insert((params) => {
        const { start } = params;
        const prefix = "\n\n------------------------------------\n\n";
        return {
          formattedText: prefix,
          start,
          end: start,
        };
      });
    },
  });

  return {
    name,
  };
}
