import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";

export function clearPlugin(editor: MarkdownEditor): EditorPlugin {

    editor.iconManager.register({
        name: 'clear',
        type: 'html',
        html:`<svg viewBox="0 0 1024 1024" version="1.1"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="1em" height="1em">
    <path
        d="M567.8 776.8l4.2 4.2c3.5 3.5 8.1 5.3 12.7 5.3s9.2-1.8 12.7-5.3l296.1-296.1c30.3-30.3 30.3-79.7 0-110L639.7 121c-14.7-14.7-34.2-22.8-55-22.8s-40.3 8.1-55 22.8L233.6 417.2c-3.4 3.4-5.3 7.9-5.3 12.7 0 4.8 1.9 9.3 5.3 12.7l4.2 4.2-97.3 97.3c-14.7 14.7-22.8 34.2-22.8 55s8.1 40.3 22.8 55l220 220c10.6 10.6 23.7 17.7 37.9 20.8H131.6c-9.9 0-17.9 8-17.9 17.9s8 17.9 17.9 17.9h729.9c9.9 0 17.9-8 17.9-17.9s-8-17.9-17.9-17.9h-429c14.2-3.2 27.3-10.3 37.9-20.8l97.4-97.3z m-12.7-630.4c16.3-16.3 42.9-16.3 59.2 0l253.8 253.8c7.9 7.9 12.3 18.4 12.3 29.6s-4.4 21.7-12.3 29.6L584.7 742.9l-4.2-4.2-304.6-304.6-4.2-4.2 283.4-283.5zM415.5 860.9c-11.2 0-21.7-4.4-29.6-12.3l-220-220c-7.9-7.9-12.3-18.4-12.3-29.6 0-11.2 4.4-21.7 12.3-29.6l97.3-97.3 279.2 279.2-97.3 97.3c-7.9 8-18.4 12.3-29.6 12.3z"
        fill="#2D3742"></path>
</svg>`
    })

    editor.toolbarManager?.register({
      name: 'clear',
      icon: 'clear',
      label: '清除',
      onAction: ()=> {
        editor.setContent('')
      }
    })
    

  return {
    name: "clear"
  };
}
