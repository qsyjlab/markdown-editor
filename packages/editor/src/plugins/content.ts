import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function contentPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "content";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg(
      '<path d="M881.92 151.04a12.8 12.8 0 0 1 12.8 12.8v704a12.8 12.8 0 0 1-12.8 12.8h-704a12.8 12.8 0 0 1-12.8-12.8v-704a12.8 12.8 0 0 1 12.8-12.8h704m0-83.2h-704a96 96 0 0 0-96 96v704a96 96 0 0 0 96 96h704a96 96 0 0 0 96-96v-704a96 96 0 0 0-96-96z"></path><path d="M305.92 741.12m-41.6 0a41.6 41.6 0 1 0 83.2 0 41.6 41.6 0 1 0-83.2 0Z"></path><path d="M305.92 515.84m-41.6 0a41.6 41.6 0 1 0 83.2 0 41.6 41.6 0 1 0-83.2 0Z"></path><path d="M305.92 291.2m-41.6 0a41.6 41.6 0 1 0 83.2 0 41.6 41.6 0 1 0-83.2 0Z"></path><path d="M753.92 782.72H471.04a41.6 41.6 0 0 1 0-83.2h282.88a41.6 41.6 0 1 1 0 83.2zM753.92 557.44H471.04a41.6 41.6 0 0 1 0-83.2h282.88a41.6 41.6 0 0 1 0 83.2zM753.92 332.8H471.04a41.6 41.6 0 0 1 0-83.2h282.88a41.6 41.6 0 1 1 0 83.2z"></path>'
    ),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "目录",
    onAction: () => {
      const state = editor.toolbarManager.getMenuState(name);
      editor.sidebarManager.toggle();

      editor.toolbarManager.updateMenuState(name, {
        isActive: !state?.isActive,
      });
    },
  });

  return {
    name,
  };
}
