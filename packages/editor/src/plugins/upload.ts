import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function uploadImagePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "uploadImage";
  editor.iconManager.register({
    name,
    type: 'svg',
    svg: generateSvg(icons.imagePlus),
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
