import { MarkdownEditor } from "../editor";

export function insertUtils(editor:MarkdownEditor, handle:(selectedText:string)=> string) {
  const selection = editor.selectionManager?.getSelection();

  const content = editor.getContent();
  if (!selection) return;
  // 获取选中的文本范围
  const start = selection?.selectionStart || 0;
  const end = selection?.selectionEnd || 0;

  console.log("start",start)
  // 获取选中的文本
  const selectedText = content.substring(start, end);

  // 包裹选中的文本
  const backtickText = handle(selectedText);

  // 更新文本内容：选中的部分替换为带反引号的文本
  const text =
    content.substring(0, start) + backtickText + content.substring(end);

  editor.setContent(text);

//   // 恢复光标位置和选区
//   const newStart = start + 1;
//   const newEnd = end + 1;

//   // 保持选区或者光标位置
//   editor.selectionManager.setSelectionRange(newStart, newEnd);
}
