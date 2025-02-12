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
      `<path d="M959.825022 384.002258V191.939717C959.825022 121.2479 902.517291 63.940169 831.825474 63.940169H191.939717C121.2479 63.940169 63.940169 121.2479 63.940169 191.939717v639.885757C63.940169 902.517291 121.2479 959.825022 191.939717 959.825022h639.885757c70.691817 0 127.999548-57.307731 127.999548-127.999548V384.002258zM146.66502 146.66502a63.737872 63.737872 0 0 1 45.336109-18.784682h639.997742A63.961844 63.961844 0 0 1 895.884854 192.001129V320.062089H127.880338V192.001129A63.737872 63.737872 0 0 1 146.66502 146.66502z m269.1267 461.308451v-223.971213h192.181751v223.971213h-192.181751z m192.181751 63.940169v223.971214h-192.181751v-223.971214h192.181751z m-256.12192-63.940169H127.880338v-223.971213h223.971213v223.971213z m-205.186531 269.235073a63.466939 63.466939 0 0 1-18.784682-45.209673V671.91364h223.971213v223.971214H192.001129a63.625887 63.625887 0 0 1-45.336109-18.67631z m749.219834-45.209673A63.763159 63.763159 0 0 1 831.998871 895.884854H671.91364v-223.971214h223.971214v160.085231z m0-224.0254h-223.971214v-223.971213h223.971214v223.971213z" fill="currentColor"></path>`
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


