import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function fullscreenPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "fullscreen";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.maximize),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "全屏",
    inActiveLabel: "全屏",
    activeLabel: "取消全屏",
    onAction: () => {
      editor.toggleFullscreen();

      editor.toolbarManager.updateMenuState(name, {
        isActive: editor.layoutState.fullscreen,
      });
    },
  });

  return {
    name,
  };
}
