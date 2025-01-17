import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";

export function quotePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "quote";

  editor.iconManager.register({
    name,
    type: "html",
    html: `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M692.302769 354.461538v45.016616c-15.517538 7.68-27.175385 21.582769-34.934154 41.668923-7.758769 20.086154-11.657846 46.513231-11.657846 79.36v13.981538H708.923077V669.538462h-147.692308v-100.982154c0-61.203692 10.870154-109.686154 32.610462-145.329231 21.740308-35.721846 54.547692-58.643692 98.461538-68.765539z m-246.153846 0v45.016616c-15.517538 7.68-27.175385 21.582769-34.934154 41.668923-7.758769 20.086154-11.657846 46.513231-11.657846 79.36v13.981538h63.212308V669.538462H315.076923v-100.982154c0-61.203692 10.870154-109.686154 32.610462-145.329231 21.740308-35.721846 54.547692-58.643692 98.461538-68.765539z" fill="currentColor"></path></svg>`,
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "引用",
    onAction: () => {
      editor.insert((params) => {
        const { selectedText, start } = params;

        const prefix = `\n> `;

        const finalStart = start + prefix.length

        return {
          formattedText: prefix + selectedText,
          start: finalStart,
          end: finalStart,
        };
      });
    },
  });

  return {
    name,
  };
}
