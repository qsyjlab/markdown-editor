import { MarkdownEditor } from "./editor";


export function createEditorToolbarManager(
  editor: MarkdownEditor
): MarkdownEditorToolbarManager {
  const buttons: Record<string, EditorToolbarButtonConfig> = {};

  const $el = document.createElement("div");
  $el.classList.add("md-editor-toolbar");

  function register(button: EditorToolbarButtonConfig) {
    buttons[button.name] = button;
  }

  function render(button: EditorToolbarButtonConfig) {
    const btn = document.createElement("span");

    btn.setAttribute("title", button.label);

    btn.classList.add("md-editor-toolbar-item");

    const icon = editor?.iconManager.create(button.icon);

    if (icon) {
      btn.appendChild(icon);
    }

    btn.addEventListener("click", () => {
      button.onAction?.();
    });

    $el?.appendChild(btn);
  }

  function init(){

    Object.values(buttons).forEach((button) => {
      render(button);
    });
  }

  return {
    $el,
    buttons,
    register,
    init,
  };
}

export interface MarkdownEditorToolbarManager {
  $el: HTMLElement;
  register: (button: EditorToolbarButtonConfig) => void;
  init: ()=> void
  buttons: Record<string, EditorToolbarButtonConfig>;
}

export interface EditorToolbarButtonConfig {
  name: string;
  label: string;
  icon: string;
  onAction: () => void;
  // tooltip: 'Save',
  // enabled: false,
  // onAction: () => editor.execCommand('mceSave'),
  // onSetup: stateToggle(editor),
  // shortcut: 'Meta+S'
}
