import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";
import { toggleWrap } from "../utils/format";

export function boldPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "bold";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.bold),
  });


  return {
    name,
    toolbar: {
      icon: name,
      label: "加粗",
      onAction: () => toggleWrap(editor, "**"),
    }
  };
}

