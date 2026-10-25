import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";
import { toggleWrap } from "../utils/format";

export function italicPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "italic";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.italic),
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
