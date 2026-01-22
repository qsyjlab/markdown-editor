import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";

export function toggleThemePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "toggle-theme";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-13a5 5 0 0 0 0 10V7z" /></svg>',
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "切换主题",
    onAction: () => {
      editor.toggleTheme();
    },
    position: 'right',
  });

  return {
    name,
  };
}
