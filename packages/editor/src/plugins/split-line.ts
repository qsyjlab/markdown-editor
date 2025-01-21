import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";
export function splitLinePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "splitLine";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg('<path d="M32 464h960V576H32z"></path>'),
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
