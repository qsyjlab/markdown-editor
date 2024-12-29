import { MarkdownEditor } from "./editor";

interface EditorToolbarButton {
  label: string;
  action: string;
  icon: string;
  onClick: () => void;
}
export class MarkdownEditorToolbar {
  public editor?: MarkdownEditor;
  public $el?: HTMLElement;

  public buttons: EditorToolbarButton[] = [];

  constructor(editor: MarkdownEditor) {
    this.editor = editor;
    this.create();

    this.renderButton({
      label: "清除",
      action: "clear",
      icon: "clear",
      onClick: () => {
        this.editor?.setContent("");
      },
    });
  }

  create() {
    this.$el = document.createElement("div");
    this.$el.classList.add("md-editor-toolbar");
    return this.$el;
  }

  registerButton(button: EditorToolbarButton) {
    this.buttons.push(button);
  }

  renderButton(button: EditorToolbarButton) {
    const btn = document.createElement("span");

    btn.setAttribute('title', button.label)

    btn.classList.add("md-editor-toolbar-item");

    const icon = this.editor?.iconManager.get(button.icon);

    if (icon) {
      btn.appendChild(icon);
    }

    btn.addEventListener("click", () => {
      button.onClick();
    });

    this.$el?.appendChild(btn);
  }
}
