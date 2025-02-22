import { MarkdownEditor } from "../editor"
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin"


export function codePlugin(editor: MarkdownEditor): EditorPlugin {
    const name = "code";
  
    editor.iconManager.register({
      name,
      type: "html",
      html: generateSvg('<path d="M609.834667 268.501333a42.666667 42.666667 0 0 1 60.330666 0l213.333334 213.333334a42.666667 42.666667 0 0 1 0 60.330666l-213.333334 213.333334a42.666667 42.666667 0 0 1-60.330666-60.330667L793.002667 512l-183.168-183.168a42.666667 42.666667 0 0 1 0-60.330667zM414.165333 268.501333a42.666667 42.666667 0 0 1 0 60.330667L230.997333 512l183.168 183.168a42.666667 42.666667 0 0 1-60.330666 60.330667l-213.333334-213.333334a42.666667 42.666667 0 0 1 0-60.330666l213.333334-213.333334a42.666667 42.666667 0 0 1 60.330666 0zM449.834667 658.389333L550.826667 365.653333l40.32 13.909334-100.949334 292.778666-40.362666-13.909333z"></path>')
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
