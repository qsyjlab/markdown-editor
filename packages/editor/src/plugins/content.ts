import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function contentPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "content";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.list),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "目录",
    onAction: () => {
      const state = editor.toolbarManager.getMenuState(name);
      editor.sidebarManager.toggle();

      editor.toolbarManager.updateMenuState(name, {
        isActive: !state?.isActive,
      });
    },
  });

  return {
    name,
  };
}
