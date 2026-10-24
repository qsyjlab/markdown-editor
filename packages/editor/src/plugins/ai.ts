import { MarkdownEditor } from "../editor";
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
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.7L19.6 9.6l-5.7 1.9L12 17.2l-1.9-5.7L4.4 9.6l5.7-1.9L12 2zm7 12l.95 2.85L22.8 17.8l-2.85.95L19 21.6l-.95-2.85-2.85-.95 2.85-.95L19 14zM5 14.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"/></svg>',
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
