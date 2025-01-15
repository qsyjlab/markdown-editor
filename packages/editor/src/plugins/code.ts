import { MarkdownEditor } from "../editor"
import { EditorPlugin } from "../plugin"


export function codePlugin(editor: MarkdownEditor): EditorPlugin {
    const name = "code";
  
    editor.iconManager.register({
      name,
      type: "html",
      html: `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M153.770667 517.558857l200.387047-197.241905L302.86019 268.190476 48.761905 518.290286l254.439619 243.614476 50.590476-52.833524-200.021333-191.512381zM658.285714 320.316952L709.583238 268.190476l254.098286 250.09981L709.241905 761.904762l-50.590476-52.833524 200.021333-191.512381L658.285714 320.316952z m-112.981333-86.186666L393.99619 785.554286l70.534096 19.358476 151.30819-551.399619-70.534095-19.358476z" p-id="10547" fill="currentColor"></path></svg>`,
    });
  
    editor.toolbarManager?.register({
      name,
      icon: name,
      label: "代码块",
      onAction: () => {

        editor.insert((text, start, end)=> {
          
          const prefix = `\n\`\`\`\n`
          const suffix = `\n\`\`\`\n`

          return {
            formattedText: prefix + text + suffix,
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
