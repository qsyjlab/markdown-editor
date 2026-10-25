import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function toggleLayoutPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "toggleLayout";

  editor.iconManager.register({
    name: "onlyEditable",
    type: "svg",
    svg: generateSvg(icons.columns),
  });
  editor.toolbarManager?.register({
    name: "onlyEditable",
    icon: "onlyEditable",
    label: "仅编辑区",
    inActiveLabel: "仅编辑区",
    activeLabel: "恢复默认",
    onAction: () => {
      const state = editor.toolbarManager.getMenuState("onlyEditable");

      const isActive = state?.isActive || false;

      if (isActive) {
        editor.resetLayout();
      } else {
        editor.onlyShowEditable();
      }
      editor.toolbarManager.updateMenuState("onlyEditable", {
        isActive: !isActive,
      });
      editor.toolbarManager.updateMenuState("onlyPreview", {
        isActive: false,
      });
    },
    position: 'right',
  });

  editor.iconManager.register({
    name: "onlyPreview",
    type: "svg",
    svg: generateSvg(icons.columns),
  });

  editor.toolbarManager?.register({
    name: "onlyPreview",
    icon: "onlyPreview",
    label: "仅预览区",
    inActiveLabel: "仅预览区",
    activeLabel: "恢复默认",
    onAction: () => {
      const state = editor.toolbarManager.getMenuState("onlyPreview");

      const isActive = state?.isActive || false;

      if (isActive) {
        editor.resetLayout();
      } else {
        editor.onlyShowPreview();
      }
      editor.toolbarManager.updateMenuState("onlyPreview", {
        isActive: !isActive,
      });
      editor.toolbarManager.updateMenuState("onlyEditable", {
        isActive: false,
      });
    },
  });

  return {
    name,
  };
}
