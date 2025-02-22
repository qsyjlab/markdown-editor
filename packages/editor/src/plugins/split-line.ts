import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";
export function splitLinePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "splitLine";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg('<path d="M213.333333 512a42.666667 42.666667 0 0 1 42.666667-42.666667h512a42.666667 42.666667 0 1 1 0 85.333334H256a42.666667 42.666667 0 0 1-42.666667-42.666667z"></path>'),
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
