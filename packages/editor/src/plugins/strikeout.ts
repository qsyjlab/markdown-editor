import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";
import { toggleWrap } from "../utils/format";



export function strikeoutPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "strikeout";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.strikethrough)
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "删除线",
    onAction: () => toggleWrap(editor, "~~"),
  });

  return {
    name
  };
}
