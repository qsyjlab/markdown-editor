import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

import "../style/ui/input.scss";
import { generateMarkdownTaskList } from "../utils/generate";

export function taskPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "task";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg('<path d="M725.333333 426.666667a42.666667 42.666667 0 0 1 42.666667 42.666666v298.666667a128 128 0 0 1-128 128H256a128 128 0 0 1-128-128V384a128 128 0 0 1 128-128h298.666667a42.666667 42.666667 0 1 1 0 85.333333H256a42.666667 42.666667 0 0 0-42.666667 42.666667v298.666667a42.666667 42.666667 0 0 0 42.666667 42.666666h384a42.666667 42.666667 0 0 0 42.666667-42.666666V469.333333a42.666667 42.666667 0 0 1 42.666666-42.666666z"></path><path d="M426.666667 554.666667a42.666667 42.666667 0 0 1-30.165334-12.501334l-85.333333-85.333333a42.666667 42.666667 0 0 1 60.330667-60.330667l55.168 55.168 225.834666-225.834666a42.666667 42.666667 0 1 1 60.330667 60.330666L456.832 542.165333A42.666667 42.666667 0 0 1 426.666667 554.666667z"></path>')
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
