import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function uploadImagePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "uploadImage";
  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg(`<path d="M85.333333 213.333333a85.333333 85.333333 0 0 1 85.333334-85.333333h682.666666a85.333333 85.333333 0 0 1 85.333334 85.333333v597.333334a85.333333 85.333333 0 0 1-85.333334 85.333333H170.666667a85.333333 85.333333 0 0 1-85.333334-85.333333V213.333333z m768 0H170.666667v597.333334h682.666666V213.333333z" fill="#000000" p-id="2932"></path><path d="M318.72 437.248a85.333333 85.333333 0 0 1 130.389333 0.853333l151.082667 181.333334 61.269333-61.226667a85.333333 85.333333 0 0 1 126.976 7.04l140.885334 176.085333a42.666667 42.666667 0 1 1-66.645334 53.333334l-140.885333-176.128-61.269333 61.269333a85.333333 85.333333 0 0 1-125.866667-5.717333l-151.125333-181.333334-223.146667 260.352a42.666667 42.666667 0 1 1-64.768-55.552l223.146667-260.309333zM554.666667 384a85.333333 85.333333 0 1 1 170.666666 0 85.333333 85.333333 0 0 1-170.666666 0z"></path>`),
  });


  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "图片上传",
    onAction: () => {
      const input = document.createElement("input");
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
