import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

import "../style/ui/input.scss";
import { generateMarkdownTaskList } from "../utils/generate";

export function taskPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "task";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.task)
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "任务",
    onAction: () => {
      const taskText = generateMarkdownTaskList([
        { name: "任务", completed: true },
      ]);

      editor.insert(({ start }) => {
        return {
          formattedText: `\n${taskText}\n`,
          start,
          end: start,
        };
      });
    },
  });

  return {
    name,
  };
}
