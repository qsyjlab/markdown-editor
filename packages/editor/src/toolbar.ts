import { MarkdownEditor } from "./editor";
import { DropdownMenu } from "./ui";

const dropdownMap = new Map<string, DropdownMenu>();

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

    let icon = editor?.iconManager.create(button.icon);

    btn.addEventListener("click", () => {
      button.onAction?.();
    });

    const dropTrigger = button.dropTrigger || "mouseover";

    if (button.type === "dropdown") {
      button.fetch?.((menus) => {
        icon && btn.appendChild(icon);

        const dropdown = new DropdownMenu({
          triggerElement: btn,
          trigger: dropTrigger,
          hideOnClick: true,
          menus: menus.map((item) => {
            return {
              title: item.label,
              action: item.name,
              onClick: item.onAction,
            };
          }),
        });

        $el?.appendChild(dropdown.container);

        dropdownMap.set(button.name, dropdown);
        return;
      });

      return;
    }

    if (icon) {
      btn.appendChild(icon);
    }
    $el?.appendChild(btn);
  }

  function init() {
    console.log("dropdownMap",dropdownMap)
    debugger
    Object.values(buttons).forEach((button) => {
     
      const dropdown = dropdownMap.get(button.name)
      if(dropdown) {
        dropdown.destory()
      }

      dropdownMap.delete(button.name)
      render(button);
      
    });
    console.log("dropdownMap",dropdownMap)
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
  init: () => void;
  buttons: Record<string, EditorToolbarButtonConfig>;
}

export interface EditorToolbarButtonConfig {
  name: string;
  label: string;
  icon: string;
  /**
   * @default button
   */
  type?: "button" | "dropdown";

  dropTrigger?: "mouseover";
  fetch?: (
    callback: (menus: EditorToolbarDropdownItemConfig[]) => void
  ) => void;
  onAction: () => void;
  // tooltip: 'Save',
  // enabled: false,
  // onAction: () => editor.execCommand('mceSave'),
  // onSetup: stateToggle(editor),
  // shortcut: 'Meta+S'
}

export type EditorToolbarDropdownItemConfig = Pick<
  EditorToolbarButtonConfig,
  "label" | "name" | "onAction"
>;
