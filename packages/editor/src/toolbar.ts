import { IconManager } from "./icon-manager";
import { DropdownMenu } from "./ui";
import { Tooltip } from "./ui/tooltip";

const dropdownMap = new Map<string, DropdownMenu>();

export class EditorToolbarManager {
  private buttons: Record<string, EditorToolbarButtonConfig> = {};

  private $el: HTMLElement;

  private buttonsState: Record<
    string,
    EditorToolbarButtonState & {
      tooltip?: Tooltip;
    }
  > = {};

  constructor() {
    const $el = document.createElement("div");

    this.$el = $el;
    $el.classList.add("md-editor-toolbar");

    const left = document.createElement("div");
    left.classList.add("md-editor-toolbar__left");

    const right = document.createElement("div");
    right.classList.add("md-editor-toolbar__right");
    $el.appendChild(left);
    $el.appendChild(right);
  }

  getBody() {
    return this.$el;
  }

  updateMenuState(name: string, newState: Partial<EditorToolbarButtonState>) {
    this.buttonsState[name] = Object.assign(
      {},
      this.buttonsState[name],
      newState
    );

    const state = this.buttonsState[name];
    const menu = this.$el.querySelector(`[menu-id="${name}"]`);
    const menuConfig = this.buttons[name];
    if (!menu) return;
    const label = getCurrentLabel(menuConfig || {}, state?.isActive || false);
    menu.classList.remove("is-active");
    if (state.isActive) {
      menu.classList.add("is-active");
    }
    state?.tooltip?.setText(label);
  }

  getMenuState(name: string) {
    const state = this.buttonsState[name];

    return state;
  }

  render(button: EditorToolbarButtonConfig, iconManager: IconManager) {
    const btn = document.createElement("span");

    const defaultState = button.defaultState || {};

    this.updateMenuState(button.name, defaultState);
    const state = this.getMenuState(button.name);

    const label = getCurrentLabel(button, state?.isActive || false);

    btn.setAttribute("title", label);
    btn.setAttribute("menu-id", button.name);

    btn.classList.add("md-editor-toolbar-item");

    if (state.isActive) {
      btn.classList.add("is-active");
    }

    let icon = iconManager.create(button.icon);

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
              createdHandler: (el) => {
                const icon = iconManager.create(item.name);

                if (icon) {
                  icon.classList.add('md-editor-dropdown-menu-item__icon')
                  el.appendChild(icon);
                }

                const title = document.createElement("div");
                title.innerHTML = item.label;
                title.classList.add('md-editor-dropdown-menu-item__title')
                el.appendChild(title);
                return el;
              },
            };
          }),
        });

        dropdown.dropdown?.setAttribute("editor-dropdown-trigger", button.name);

        const left = this.$el.querySelector(".md-editor-toolbar__left");
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
    document
      .querySelectorAll(`[attatch-menu-el-id="${button.name}"]`)
      ?.forEach((node) => {
        node.remove();
      });

    const tooltip = new Tooltip(btn, label, {
      placement: "top",
      offset: 10,
      createAfter(element) {
        element.setAttribute("attatch-menu-el-id", button.name);
      },
    });
    state.tooltip = tooltip;

    const left = this.$el.querySelector(".md-editor-toolbar__left");
    left?.appendChild(btn);
  }

  register(button: EditorToolbarButtonConfig) {
    this.buttons[button.name] = button;
  }

  renderAll(iconManager: IconManager) {
    Object.values(this.buttons).forEach((button) => {
      this.removeDropdown(button.name);

      this.render(button, iconManager);
    });
  }

  removeDropdown(name: string) {
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
}

export interface EditorToolbarButtonConfig {
  name: string;
  label: string;

  activeLabel?: string;

  inActiveLabel?: string;

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

  defaultState?: EditorToolbarButtonState;
}

export type EditorToolbarDropdownItemConfig = Pick<
  EditorToolbarButtonConfig,
  "label" | "name" | "onAction"
>;

export interface EditorToolbarButtonState {
  isActive?: boolean;
  [key: string]: any;
}

function getCurrentLabel(button: EditorToolbarButtonConfig, isActive = false) {
  if (isActive && button.activeLabel) {
    return button.activeLabel || button.label;
  }

  return button.inActiveLabel || button.label;
}
