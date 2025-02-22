import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function syncScrollPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "syncScroll";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg(
      '<path d="M810.666667 85.333333a42.666667 42.666667 0 0 1 42.666666 42.666667v213.333333a42.666667 42.666667 0 0 1-42.666666 42.666667h-213.333334a42.666667 42.666667 0 1 1 0-85.333333h170.666667V128a42.666667 42.666667 0 0 1 42.666667-42.666667z"></path><path d="M605.013333 228.181333a298.666667 298.666667 0 1 0 157.44 446.506667 42.666667 42.666667 0 1 1 71.594667 46.464 384 384 0 1 1-9.045333-431.616 42.666667 42.666667 0 0 1-69.546667 49.450667 298.666667 298.666667 0 0 0-150.4-110.805334z"></path>'
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
