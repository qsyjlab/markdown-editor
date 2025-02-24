import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function toggleLayoutPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "toggleLayout";

  editor.iconManager.register({
    name: "onlyEditable",
    type: "html",
    html: generateSvg(
      '<path d="M128 0a128 128 0 0 0-128 128v768a128 128 0 0 0 128 128h341.333333a128 128 0 0 0 128-128V128a128 128 0 0 0-128-128H128zM85.333333 128a42.666667 42.666667 0 0 1 42.666667-42.666667h341.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v768a42.666667 42.666667 0 0 1-42.666667 42.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V128z m725.333334-128a128 128 0 0 0-128 128v768a128 128 0 0 0 128 128h85.333333a128 128 0 0 0 128-128V128a128 128 0 0 0-128-128h-85.333333z m-42.666667 128a42.666667 42.666667 0 0 1 42.666667-42.666667h85.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v768a42.666667 42.666667 0 0 1-42.666667 42.666667h-85.333333a42.666667 42.666667 0 0 1-42.666667-42.666667V128z"></path>'
    ),
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
  });

  editor.iconManager.register({
    name: "onlyPreview",
    type: "html",
    html: generateSvg(
      '<path d="M128 0a128 128 0 0 0-128 128v768a128 128 0 0 0 128 128h85.333333a128 128 0 0 0 128-128V128a128 128 0 0 0-128-128H128zM85.333333 128a42.666667 42.666667 0 0 1 42.666667-42.666667h85.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v768a42.666667 42.666667 0 0 1-42.666667 42.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V128z m469.333334-128a128 128 0 0 0-128 128v768a128 128 0 0 0 128 128h341.333333a128 128 0 0 0 128-128V128a128 128 0 0 0-128-128h-341.333333z m-42.666667 128a42.666667 42.666667 0 0 1 42.666667-42.666667h341.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v768a42.666667 42.666667 0 0 1-42.666667 42.666667h-341.333333a42.666667 42.666667 0 0 1-42.666667-42.666667V128z"></path>'
    ),
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
