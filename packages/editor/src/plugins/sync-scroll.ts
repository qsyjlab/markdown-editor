import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function syncScrollPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "syncScroll";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(
      '<path d="M480 256a32 32 0 0 1 32 32v448a32 32 0 1 1-64 0V288a32 32 0 0 1 32-32z m-160 0a32 32 0 0 1 32 32v448a32 32 0 1 1-64 0V288a32 32 0 0 1 32-32z m320 0a32 32 0 0 1 32 32v448a32 32 0 1 1-64 0V288a32 32 0 0 1 32-32zM288 160h448a32 32 0 1 1 0 64H288a32 32 0 1 1 0-64z m0 608h448a32 32 0 1 1 0 64H288a32 32 0 1 1 0-64z" p-id="4245"></path>'
    ),
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
