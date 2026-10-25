import { MarkdownEditor } from "../editor"
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin"


export function codePlugin(editor: MarkdownEditor): EditorPlugin {
    const name = "code";
  
    editor.iconManager.register({
      name,
      type: "svg",
      svg: generateSvg(icons.code)
    });
  
    editor.toolbarManager?.register({
      name,
      icon: name,
      label: "代码块",
      onAction: () => {

        editor.insert((params)=> {

          const {  selectedText ,start, end } = params
          
          const prefix = `\n\`\`\`\n`
          const suffix = `\n\`\`\`\n`

          return {
            formattedText: prefix + selectedText + suffix,
            start: start + prefix.length,
            end: end + prefix.length,
          }
        })
      },
    });
  
    return {
      name
    };
  }
