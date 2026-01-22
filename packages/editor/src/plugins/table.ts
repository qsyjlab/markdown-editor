import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { EditorPlugin } from "../plugin";
import { Dialog } from "../ui";

import "../style/ui/input.scss";
import { generateMarkdownTable } from "../utils/generate";

export function tablePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "table";
  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg('<path d="M128 298.666667a128 128 0 0 1 128-128h512a128 128 0 0 1 128 128v426.666666a128 128 0 0 1-128 128H256a128 128 0 0 1-128-128V298.666667z m85.333333 426.666666a42.666667 42.666667 0 0 0 42.666667 42.666667h170.666667v-170.666667h-213.333334v128z m0-213.333333h213.333334V341.333333h-170.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v128z m298.666667 213.333333h170.666667a42.666667 42.666667 0 0 0 42.666666-42.666666v-128H512v170.666666z m213.333333-256V384a42.666667 42.666667 0 0 0-42.666666-42.666667H512v170.666667h213.333333z" fill="currentColor" p-id="1751"></path>')
  });
  const values = {
    row: "",
    col: "",
  };
  const dialog = new Dialog({
    title: '插入表格',
    width: '400px',
    appendTo: editor.container,
    content: () => {
      const form = document.createElement("form");
      form.classList.add("md-editor-form");

      values.row = "";
      values.col = "";
      function rowsInput(key: keyof typeof values, title: string) {
        const formItem = document.createElement("div");
        formItem.classList.add("md-editor-form-item");

        const label = document.createElement("label");
        label.classList.add("md-editor-form-item__label");
        label.innerHTML = title;

        const content = document.createElement("div");
        content.classList.add("md-editor-form-item__content");

        const input = document.createElement("input");
        input.classList.add("md-editor-input");
        input.type = "number";
        input.addEventListener("input", () => {
          values[key] = input.value;
        });
        content.appendChild(input);

        formItem.appendChild(label);
        formItem.appendChild(content);
        return formItem;
      }

      form.appendChild(rowsInput("row", "行"));
      form.appendChild(rowsInput("col", "列"));

      return form;
    },
    onConfirm() {
      editor.insert(({ start }) => {
        return {
          formattedText: generateMarkdownTable(
            Number(values.row),
            Number(values.col)
          ),
          start,
          end: start,
        };
      });
      dialog.close();
    },
  });

  editor.toolbarManager?.register({
    name,
    icon: name,
    label: "表格",
    onAction: () => {
      dialog.show();
    },
  });

  return {
    name,
    destroy() {
      dialog.destory();
    },
  };
}


