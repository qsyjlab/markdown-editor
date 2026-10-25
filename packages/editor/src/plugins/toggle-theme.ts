import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function toggleThemePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "toggle-theme";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.moon),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "切换主题",
    onAction: () => {
      editor.toggleTheme();
    },
  });

  return {
    name,
  };
}
