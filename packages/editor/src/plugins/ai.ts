import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

/**
 * AI 动作工具栏插件：下拉列出 editor.ai 注册的全部动作。
 * 未设置 provider 或动作需要选区时仍会展示，执行时由 AIManager 给出提示事件。
 */
export function aiPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "ai";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.sparkles),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "AI 助手",
    type: "dropdown",
    position: "right",
    fetch: (callback) => {
      callback(
        editor.ai.getActions().map((action) => ({
          label: action.label,
          name: action.name,
          onAction: () => {
            editor.ai.runAction(action.name);
          },
        }))
      );
    },
  });

  return {
    name,
  };
}
