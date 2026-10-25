import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";
export function linkPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "link";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.link)
  });

  
  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "链接",
    onAction: () => {
      editor.insert((params)=> {

        const { selectedText, start } = params
        const finalStart =  start + selectedText.length + 3
        const externalPrefix = 'http://'
        return {
          formattedText: `[${selectedText}](${externalPrefix})`,
          start: finalStart,
          end: finalStart + externalPrefix.length
        }
      })
     
    },
  });

  return {
    name
  };
}

