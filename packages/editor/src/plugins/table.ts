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
    type: "html",
    html: generateSvg(
      `<path d="M128 213.333333a85.333333 85.333333 0 0 1 85.333333-85.333333h597.333334a85.333333 85.333333 0 0 1 85.333333 85.333333v597.333334a85.333333 85.333333 0 0 1-85.333333 85.333333H213.333333a85.333333 85.333333 0 0 1-85.333333-85.333333V213.333333z m682.666667 0H213.333333v597.333334h597.333334V213.333333z"></path><path d="M512 128a42.666667 42.666667 0 0 1 42.666667 42.666667v682.666666a42.666667 42.666667 0 1 1-85.333334 0V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z"></path><path d="M128 640a42.666667 42.666667 0 0 1 42.666667-42.666667h682.666666a42.666667 42.666667 0 1 1 0 85.333334H170.666667a42.666667 42.666667 0 0 1-42.666667-42.666667zM128 384a42.666667 42.666667 0 0 1 42.666667-42.666667h682.666666a42.666667 42.666667 0 1 1 0 85.333334H170.666667a42.666667 42.666667 0 0 1-42.666667-42.666667z"></path>`
    ),
  });
  const values = {
    row: "",
    col: "",
  };
  const dialog = new Dialog({
    title: '插入表格',
    width: '400px',
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


