import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function uploadImagePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "uploadImage";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg(`<path
        d="M856.32 428.064c-94.816 0-144.928 90.656-185.184 163.52-25.824 46.688-52.512 94.944-78.72 97.568-28.544-5.664-48.096-23.2-70.656-43.36-31.744-28.448-67.488-60.288-130.464-57.952-76.8 3.328-146.24 57.696-206.4 161.696a32 32 0 0 0 55.392 32.064c48.48-83.84 100.224-127.488 153.728-129.824 36.928-1.44 56.96 16.576 84.992 41.664 26.88 24.096 57.344 51.36 105.888 59.392a31.584 31.584 0 0 0 5.216 0.448c64.704 0 101.44-66.464 136.96-130.72 28.352-51.328 57.504-104 97.184-123.072v369.984H128V231.68h488.16a32 32 0 1 0 0-64H96a32 32 0 0 0-32 32v701.824a32 32 0 0 0 32 32h760.32a32 32 0 0 0 32-32V460.064a32 32 0 0 0-32-32z"
        p-id="5178"></path>
    <path
        d="M180.96 424.32c0 57.952 47.168 105.12 105.12 105.12s105.12-47.168 105.12-105.12-47.168-105.088-105.12-105.088-105.12 47.136-105.12 105.088z m146.24 0a41.152 41.152 0 0 1-82.24 0 41.152 41.152 0 0 1 82.24 0zM960 174.656h-61.376V113.28a32 32 0 1 0-64 0v61.344H752.64a32 32 0 1 0 0 64h81.984v81.984a32 32 0 1 0 64 0V238.656H960a32 32 0 1 0 0-64z"
        p-id="5179"></path>`),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "图片上传",
    type: "dropdown",
    fetch: (callback) => {
      callback([
        {
          name: "upload-image",
          label: "上传图片",
          onAction: () => {
            const input = document.createElement('input')
            input.type = 'file' 
            input.click()
            input.addEventListener('change', (e)=> {
              const file = (e.target as HTMLInputElement).files?.[0]
              console.log("file",file)
            })
          },
        },
      ]);
    },
    onAction: () => {},
  });

  return {
    name,
  };
}
