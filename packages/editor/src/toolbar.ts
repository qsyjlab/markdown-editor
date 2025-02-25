import { clientAttrKey } from "./constants/attrs-key";
import { IconManager } from "./icon-manager";
import { DropdownMenu } from "./ui";
import { Tooltip } from "./ui/tooltip";

interface EditorToolbarManagerOptions {
  leftToolbar?: string[];

  rightToolbar?: string[];
}

const defaultLeftToolbar = [
  "clear",
  "undo",
  "redo",
  "bold",
  "strickout",
  "link",
  "code",
  "quote",
  "splitLine",
  "header",
  "uploadImage",
  "table",
  "task",
];

const defaultRightToolbar = [
  "content",
  "syncScroll",
  "onlyEditable",
  "onlyPreview",
  "fullscreen",
];

export class EditorToolbarManager {
  private buttons: Record<string, EditorToolbarButtonConfig> = {};

  private $el: HTMLElement;

  private clientId: string = "";

  private buttonsState: Record<
    string,
    EditorToolbarButtonState & {
      tooltip?: Tooltip;
      dropdown?: DropdownMenu;
    }
  > = {};

  private options?: EditorToolbarManagerOptions;

  constructor(options?: EditorToolbarManagerOptions) {
    this.options = options || {};

    if (!this.options.leftToolbar) {
      this.options.leftToolbar = [...defaultLeftToolbar];
    }

    if (!this.options.rightToolbar) {
      this.options.rightToolbar = [...defaultRightToolbar];
    }

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

  render(
    button: EditorToolbarButtonConfig,
    iconManager: IconManager,
    to?: "left" | "right"
  ) {
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
    const id = `md-editor-dropdown-popper-container-${this.clientId}`;
    let container = document.body.querySelector<HTMLElement>("#" + id);

    if (!container) {
      container = document.createElement("div");
      container.id = id;
      container.classList.add("md-editor-dropdown-popper-container");
      container.setAttribute('md-doc-editor-popper-client-id', this.clientId);
      document.body.appendChild(container);
    }

    if (button.type === "dropdown") {
      button.fetch?.((menus) => {
        icon && btn.appendChild(icon);

        const dropdown = new DropdownMenu({
          appendTo: container!,
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
                  icon.classList.add("md-editor-dropdown-menu-item__icon");
                  el.appendChild(icon);
                }

                const title = document.createElement("div");
                title.innerHTML = item.label;
                title.classList.add("md-editor-dropdown-menu-item__title");
                el.appendChild(title);
                return el;
              },
            };
          }),
        });

        dropdown.dropdown?.setAttribute("editor-dropdown-trigger", button.name);

        const left = this.$el.querySelector(".md-editor-toolbar__left");
        left?.appendChild(dropdown.container);

        this.updateMenuState(button.name, {
          dropdown,
        });
        return;
      });

      return;
    }

    if (icon) {
      btn.appendChild(icon);
    }

    // 尝试移除旧元素
    container
      ?.querySelectorAll(`[attatch-menu-el-id="${button.name}"]`)
      ?.forEach((node) => {
        node.remove();
      });

    const tooltip = new Tooltip(btn, label, {
      placement: "top",
      offset: 10,
      appendTo: container,
      createAfter(element) {
        element.setAttribute("attatch-menu-el-id", button.name);
      },
    });
    state.tooltip = tooltip;

    if (!to || to === "left") {
      const left = this.$el.querySelector(".md-editor-toolbar__left");
      left?.appendChild(btn);
    } else {
      const right = this.$el.querySelector(".md-editor-toolbar__right");
      right?.appendChild(btn);
    }
  }

  register(button: EditorToolbarButtonConfig) {
    this.buttons[button.name] = button;
  }

  renderAll(iconManager: IconManager) {
    Object.values(this.buttons).forEach((button) => {
      if (this.options?.rightToolbar?.includes(button.name)) {
        this.render(button, iconManager, "right");
      } else if (this.options?.leftToolbar?.includes(button.name)) {
        this.render(button, iconManager, "left");
      }
    });
  }

  setClientId(id: string) {
    this.clientId = id;
    this.$el.setAttribute(clientAttrKey, this.clientId);
  }

  destory() {
    Object.keys(this.buttonsState).forEach((key) => {
      const state = this.buttonsState[key];
      if (state.dropdown) {
        state.dropdown.destory();
        delete state.dropdown;
      }

      if (state.tooltip) {
        state.tooltip?.destroy();
      }
    });
    document.body
      .querySelector(`[md-doc-editor-popper-client-id="${this.clientId}"]`)
      ?.remove();
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
