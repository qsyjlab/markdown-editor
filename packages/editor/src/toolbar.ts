import { MarkdownEditor } from "./editor";
import { DropdownMenu } from "./ui";
import { Tooltip } from "./ui/tooltip";

const dropdownMap = new Map<string, DropdownMenu>();

// <svg t="1739714861805" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="966" width="200" height="200"></svg>

export function createEditorToolbarManager(
  editor: MarkdownEditor
): MarkdownEditorToolbarManager {
  const buttons: Record<string, EditorToolbarButtonConfig> = {};

  const $el = document.createElement("div");
  $el.classList.add("md-editor-toolbar");

  const left = document.createElement('div')
  left.classList.add('md-editor-toolbar__left')

  const right = document.createElement('div')
  right.classList.add('md-editor-toolbar__right')
  $el.appendChild(left)
  $el.appendChild(right)
  
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

        dropdown.dropdown?.setAttribute("editor-dropdown-trigger", button.name);

        left?.appendChild(dropdown.container);

        dropdownMap.set(button.name, dropdown);
        return;
      });

      return;
    }

    if (icon) {
      btn.appendChild(icon);
    }

    // 尝试移除旧元素
    document.querySelectorAll(`[attatch-menu-el-id="${button.name}"]`)?.forEach(node=> {
      node.remove()
    })
    

    new Tooltip(btn, button.label, {
      placement: "top",
      offset: 10,

      createAfter(element) {
        element.setAttribute("attatch-menu-el-id", button.name);
      },
    });

    left?.appendChild(btn);
  }

  function init() {
    Object.values(buttons).forEach((button) => {
      removeDropdown(button.name);

      render(button);
    });
  }

  function removeDropdown(name: string) {
    const dropdown = dropdownMap.get(name);
    if (dropdown) {
      dropdown.destory();
    }

    // 二次删除防止热更新时多次创建
    const dropdownDom = document.querySelector(
      `[editor-dropdown-trigger="${name}"]`
    );
    if (dropdownDom) {
      dropdownDom.remove();
    }

    dropdownMap.delete(name);
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
}

export type EditorToolbarDropdownItemConfig = Pick<
  EditorToolbarButtonConfig,
  "label" | "name" | "onAction"
>;
