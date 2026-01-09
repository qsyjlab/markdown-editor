


import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";


export function strickoutPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "strickout";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg('<path d="M725.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a170.666667 170.666667 0 0 1-170.666667 170.666667h-170.666666a42.666667 42.666667 0 1 1 0-85.333333h170.666666a85.333333 85.333333 0 0 0 85.333334-85.333334v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667zM298.666667 256a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a85.333333 85.333333 0 0 0 85.333334 85.333333h170.666666a42.666667 42.666667 0 1 1 0 85.333334H426.666667A170.666667 170.666667 0 0 1 256 384v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z" fill="currentColor" p-id="1750"></path><path d="M128 512a42.666667 42.666667 0 0 1 42.666667-42.666667h682.666666a42.666667 42.666667 0 1 1 0 85.333334H170.666667a42.666667 42.666667 0 0 1-42.666667-42.666667z"></path>')
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
