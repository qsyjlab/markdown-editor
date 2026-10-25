import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function clearPlugin(editor: MarkdownEditor): EditorPlugin {

    editor.iconManager.register({
        name: 'clear',
        type: 'svg',
        svg: generateSvg(icons.eraser)
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
