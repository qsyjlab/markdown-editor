import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";

export function headerPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "header";

  editor.iconManager.register({
    name,
    type: "html",
    html: generateSvg('<path d="M295.06521067 457.76630293h433.86957866v-379.63588266a54.23369707 54.23369707 0 1 1 108.4673952 0v867.73915946a54.23369707 54.23369707 0 0 1-108.4673952 0v-379.63588266h-433.86957866v379.63588266a54.23369707 54.23369707 0 0 1-108.4673952 0v-867.73915946a54.23369707 54.23369707 0 0 1 108.4673952 0z" fill="currentColor"></path>'),
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "标题",
    type: "dropdown",
    fetch: (callback) => {
      callback([
        {
          name: "h1",
          label: "一级标题",
          onAction: () => {
            headingInsert(editor, 1);
          },
        },
        {
          name: "h2",
          label: "二级标题",
          onAction: () => {
            headingInsert(editor, 2);
          },
        },
        {
          name: "h3",
          label: "三级标题",
          onAction: () => {
            headingInsert(editor, 3);
          },
        },
        {
          name: "h4",
          label: "四级标题",
          onAction: () => {
            headingInsert(editor, 4);
          },
        },
        {
          name: "h5",
          label: "五级标题",
          onAction: () => {
            headingInsert(editor, 5);
          },
        },
        {
          name: "h6",
          label: "六级标题",
          onAction: () => {
            headingInsert(editor, 6);
          },
        },
      ]);
    },
    onAction: () => {},
  });

  return {
    name,
  };
}

function headingInsert(editor: MarkdownEditor, level: number) {
  editor.insert(({ selectedText, start, end }) => {
    const prefix = `${"#".repeat(level)} `;
    return {
      formattedText: prefix + selectedText,
      start: start + prefix.length,
      end: end + prefix.length,
    };
  });
}
