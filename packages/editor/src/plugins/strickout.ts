


import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";


export function strickoutPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "strickout";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 13.5h-5l-1 3H4l5-13h2l5 13h-2.5l-1-3zm-4.3-2h3.6l-1.8-5.5-1.8 5.5z" fill="currentColor"/><path d="M1 11h22v2H1z" fill="currentColor"/></svg>'
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "删除线",
    onAction: () => {
      editor.insert((params)=> {

        const { selectedText, start, end } = params

        const prefix = "~~";
        const suffix = "~~";
        return {
          formattedText: prefix + selectedText + suffix,
          start: start + prefix.length,
          end: end + prefix.length
        }
      
      })
    },
  });

  return {
    name
  };
}
