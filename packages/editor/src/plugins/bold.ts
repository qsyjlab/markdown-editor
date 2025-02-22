import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function boldPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "bold";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg('<path d="M298.666667 512a42.666667 42.666667 0 0 1 42.666666-42.666667h234.666667a192 192 0 1 1 0 384H341.333333a42.666667 42.666667 0 1 1 0-85.333333h234.666667a106.666667 106.666667 0 0 0 0-213.333333H341.333333a42.666667 42.666667 0 0 1-42.666666-42.666667z" fill="#14181F" p-id="1752"></path><path d="M341.333333 170.666667a42.666667 42.666667 0 0 1 42.666667 42.666666v597.333334a42.666667 42.666667 0 1 1-85.333333 0V213.333333a42.666667 42.666667 0 0 1 42.666666-42.666666z" fill="#14181F" p-id="1753"></path><path d="M298.666667 213.333333a42.666667 42.666667 0 0 1 42.666666-42.666666h192a192 192 0 1 1 0 384H341.333333a42.666667 42.666667 0 1 1 0-85.333334h192a106.666667 106.666667 0 0 0 0-213.333333H341.333333a42.666667 42.666667 0 0 1-42.666666-42.666667z"></path>'),
  });


  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "加粗",
    onAction: () => {
     editor.insert((params)=> {

      const { selectedText, start,end } = params 

      const prefix = "**";
      const suffix = "**";
      return {
        formattedText: prefix + selectedText + suffix,
        start: start + prefix.length,
        end: end + prefix.length
      }
     })
    },
  });

  return {
    name: "bold",
  };
}
