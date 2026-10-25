import { MarkdownEditor } from "../editor";
import { generateSvg } from "../icon";
import { icons } from "../icon/icons";
import { EditorPlugin } from "../plugin";
import { Dialog } from "../ui";

import "../style/ui/input.scss";
import { generateMarkdownTable } from "../utils/generate";

export function tablePlugin(editor: MarkdownEditor): EditorPlugin {
  const name = "table";
  editor.iconManager.register({
    name,
    type: "svg",
    svg: generateSvg(icons.table)
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
      dialog.destroy();
    },
  };
}


