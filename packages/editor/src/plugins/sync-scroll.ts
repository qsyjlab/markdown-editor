import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function syncScrollPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "syncScroll";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.sync),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "同步滚动",
    inActiveLabel: "同步滚动",
    activeLabel: "取消同步滚动",
    onAction: () => {
      editor.toolbarManager.getMenuState(name);

      editor.scrollManager?.toggleSync();

      editor.toolbarManager.updateMenuState(name, {
        isActive: editor.scrollManager?.isSync || false,
      });
    },
    defaultState: {
      isActive: editor.options.isSyncScroll ?? true,
    },
  });

  return {
    name,
  };
}
