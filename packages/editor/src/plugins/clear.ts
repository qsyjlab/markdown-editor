import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function clearPlugin(editor: MarkdownEditor): EditorPlugin {

    editor.iconManager.register({
        name: 'clear',
        type: 'html',
        html: generateSvg('<path d="M240.170667 570.709333l236.373333 211.498667 313.344-334.506667-236.416-211.456-313.301333 334.506667z m278.869333-422.485333a43.861333 43.861333 0 0 1 60.970667-2.730667l299.989333 268.373334c17.578667 15.786667 18.773333 42.410667 2.645333 59.605333l-371.626666 396.8a43.861333 43.861333 0 0 1-61.013334 2.645333l-299.946666-268.373333a41.514667 41.514667 0 0 1-2.645334-59.605333l371.626667-396.714667z m-149.162667 296.106667l58.112-62.464 222.464 205.568-58.112 62.506666-222.464-205.568z" fill="#000000" p-id="4491"></path><path d="M899.413333 839.978667c0 25.856-20.906667 46.805333-46.762666 46.805333H482.56a46.805333 46.805333 0 1 1 0-93.568h370.048c25.856 0 46.805333 20.906667 46.805333 46.762667z"></path>')
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
