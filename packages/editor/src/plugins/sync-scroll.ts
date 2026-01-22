import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";

export function syncScrollPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "syncScroll";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>',
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
      isActive: editor.options.isSyncScoll,
    },
  });

  return {
    name,
  };
}
