import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";

export function headerPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "header";

  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.heading),
  });

  editor.iconManager.register({
    name: 'h1',
    type: "svg",
    svg: generateSvg(icons.h1),
  });



  editor.iconManager.register({
    name: 'h2',
    type: "svg",
    svg: generateSvg(icons.h2),
  });
  editor.iconManager.register({
    name: 'h3',
    type: "svg",
    svg: generateSvg(icons.h3),
  });

  editor.iconManager.register({
    name: 'h4',
    type: "svg",
    svg: generateSvg(icons.h4),
  });

  editor.iconManager.register({
    name: 'h5',
    type: "svg",
    svg: generateSvg(icons.h5),
  });


  editor.iconManager.register({
    name: 'h6',
    type: "svg",
    svg: generateSvg(icons.h6),
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
