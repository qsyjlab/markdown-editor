import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";

export function uploadImagePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "uploadImage";
  editor.iconManager.register({
    name,
    type: 'svg',
    svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  });


  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "图片上传",
    onAction: () => {
      const input = document.createElement("input");
      input.accept = "image/*";
      input.type = "file";
      input.click();
      input.addEventListener("change", (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) return;

        editor.options?.imagesUploadHandler?.(
          file,
          (path) => {
            editor.insert(({ start, end }) => {
              return {
                start,
                end,
                formattedText: `\n![${file.name}](${path})`,
              };
            });
          },
          () => {
            console.error("upload error");
          }
        );
      });
    },
  });

  return {
    name,
  };
}
