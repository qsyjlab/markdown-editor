


import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";
import { insertUtils } from "./utils";

export function strickoutPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "strickout";

  editor.iconManager.register({
    name,
    type: "html",
    html: `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path fill="currentColor" d="M832.1 457.3h-280-0.1v-0.2h-2.2c-4.4-0.3-8.7-0.5-13.1-0.5h-42.8c-53.3-5-95.1-50-95.1-104.5 0-57.9 47.1-105 105-105H552c36.6 0 70.1 18.8 89.5 50.3l39.2-24.1c-13.3-21.6-31.9-39.6-53.9-52.2-22.7-13-48.6-19.9-74.7-19.9h-48.3c-83.3 0-151 67.7-151 151 0 40.9 16.3 78 42.8 105.2H191.9v46H550c69.3 6.8 123.7 65.4 123.7 136.5 0 75.6-61.5 137.1-137.1 137.1h-60.4c-39.3 0-76.9-17.1-103-46.9l-34.6 30.3c34.9 39.8 85.1 62.6 137.6 62.6h60.4c48.7 0 94.7-19.1 129.4-53.8 34.7-34.7 53.8-80.6 53.8-129.4s-19.1-94.7-53.8-129.4c-2.5-2.5-5-4.8-7.5-7.1h173.6v-46z"></path></svg>
`,
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "删除线",
    onAction: () => {
      insertUtils(editor, (selectedText: string) => {
        return `~~${selectedText}~~`;
      });
    },
  });

  return {
    name
  };
}
