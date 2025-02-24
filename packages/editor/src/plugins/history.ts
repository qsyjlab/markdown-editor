import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function hisotryPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "history";

  const undoName = "undo";
  editor.iconManager.register({
    name: undoName,
    type: "html",
    html: generateSvg(
      '<path d="M328.832 183.168a42.666667 42.666667 0 0 1 0 60.330667L188.330667 384l140.501333 140.501333a42.666667 42.666667 0 1 1-60.330667 60.330667l-170.666666-170.666667a42.666667 42.666667 0 0 1 0-60.330666l170.666666-170.666667a42.666667 42.666667 0 0 1 60.330667 0z" fill="#14181F" p-id="2128"></path><path d="M85.333333 384a42.666667 42.666667 0 0 1 42.666667-42.666667h554.666667a256 256 0 0 1 0 512h-213.333334a42.666667 42.666667 0 1 1 0-85.333333h213.333334a170.666667 170.666667 0 0 0 0-341.333333H128a42.666667 42.666667 0 0 1-42.666667-42.666667z"></path>'
    ),
  });

  editor.toolbarManager?.register({
    name: undoName,
    icon: undoName,
    label: "撤销",
    onAction: () => {
      editor.undo()
    },
  });


  const redoName = "redo";
  editor.iconManager.register({
    name: redoName,
    type: "html",
    html: generateSvg(
      '<path d="M695.168 183.168a42.666667 42.666667 0 0 1 60.330667 0l170.666666 170.666667a42.666667 42.666667 0 0 1 0 60.330666l-170.666666 170.666667a42.666667 42.666667 0 0 1-60.330667-60.330667L835.669333 384l-140.501333-140.501333a42.666667 42.666667 0 0 1 0-60.330667z" fill="#14181F" p-id="2290"></path><path d="M341.333333 426.666667a170.666667 170.666667 0 0 0 0 341.333333h213.333334a42.666667 42.666667 0 1 1 0 85.333333H341.333333A256 256 0 0 1 341.333333 341.333333h554.666667a42.666667 42.666667 0 1 1 0 85.333334H341.333333z"></path>'
    ),
  });

  editor.toolbarManager?.register({
    name: redoName,
    icon: redoName,
    label: "重做",
    onAction: () => {
      editor.redo()
    },
  });

  return {
    name,
  };
}
