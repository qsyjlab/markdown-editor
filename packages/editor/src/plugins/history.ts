import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function historyPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "history";

  const undoName = "undo";
  editor.iconManager.register({
    name: undoName,
    type: "svg",
    svg: generateSvg(icons.undo),
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
    type: "svg",
    svg: generateSvg(icons.redo),
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
