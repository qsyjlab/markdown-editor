import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";

export function boldPlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "bold";

  editor.iconManager.register({
    name,
    type: "html",
    html: `<svg viewBox="0 0 1024 1024" version="1.1"
    xmlns="http://www.w3.org/2000/svg" p-id="5082" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="24" height="24">
    <path
        d="M277.333333 256a85.333333 85.333333 0 0 1 85.333334-85.333333h157.866666a183.466667 183.466667 0 0 1 122.368 320.170666A192 192 0 0 1 554.666667 853.333333H362.666667a85.333333 85.333333 0 0 1-85.333334-85.333333V256z m277.333334 281.6H345.6V768a17.066667 17.066667 0 0 0 13.653333 16.725333l3.413334 0.341334H554.666667a123.733333 123.733333 0 0 0 7.253333-247.253334L554.666667 537.6z m-34.133334-298.666667H362.666667a17.066667 17.066667 0 0 0-16.725334 13.653334L345.6 256v213.333333h174.933333a115.2 115.2 0 0 0 114.986667-107.946666l0.213333-7.253334a115.2 115.2 0 0 0-107.946666-114.986666L520.533333 238.933333z"
        fill="#575C63"></path>
</svg>
`,
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "加粗",
    onAction: () => {
        const textarea = editor.editable
    
        if(!textarea) return 
        // 获取选中的文本范围
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        // 获取选中的文本
        const selectedText = textarea.value.substring(start, end);
        
        // 包裹选中的文本
        const backtickText = ` \`${selectedText}\` `;
        
        // 更新文本内容：选中的部分替换为带反引号的文本
        textarea.value = textarea.value.substring(0, start) + backtickText + textarea.value.substring(end);
    
        // 移动光标到选中部分的后面
        textarea.selectionStart = textarea.selectionEnd = start + backtickText.length;
        editor.setContent(textarea.value)
    },
  });




  return {
    name: "clear",
  };
}
