import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";
import { toggleWrap } from "../utils/format";

export function italicPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "italic";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg('<path d="M832 128H448a42.666667 42.666667 0 0 1 0-85.333333h384a42.666667 42.666667 0 0 1 0 85.333333zM576 981.333333H192a42.666667 42.666667 0 0 1 0-85.333333h384a42.666667 42.666667 0 0 1 0 85.333333z" fill="currentColor"></path><path d="M640 128h-128l-256 768h128z" fill="currentColor"></path>'),
  });

  return {
    name,
    toolbar: {
      icon: name,
      label: "斜体",
      onAction: () => toggleWrap(editor, "*"),
    },
  };
}
