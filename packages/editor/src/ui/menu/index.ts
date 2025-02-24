import { debounce } from "lodash-es";
import { setStyle, useId } from "../../utils";

import "../../style/ui/dropdown.scss";

interface MenuItem {
  title: string;
  action: string;
  onClick?: () => void;
  createdHandler?: (menuItem: HTMLElement, config: MenuItem) => HTMLElement;
}

interface DropdownMenuProps {
  style?: Record<string, any>;
  class?: string;
  triggerElement: HTMLElement | null;
  menus: MenuItem[];
  trigger: "mouseover" | "click";
  hideOnClick: boolean;
  appendTo?: HTMLElement;

}

const dropdownPoperIdPrefix = 'md-doc-editor--popper-' 

export class DropdownMenu {
  public container: HTMLElement;

  dropdown: HTMLElement | null = null;

  id: string;

  visbible: boolean;

  menus: MenuItem[];

  triggerElement: HTMLElement | null = null;

  appendTo:HTMLElement

  config: DropdownMenuProps;

  constructor(props: DropdownMenuProps) {

    this.appendTo = props.appendTo || document.body
    this.config = props;
    this.container = document.createElement("span");

    this.id = "";

    this.container.setAttribute("tabindex", "-1");
    const style = this.container.style;
    style.display = "inline-block";
    style.position = "relative";

    setStyle(this.container, props.style || {});

    this.container.classList.add("md-editor-dropdown");
    if (props.class) {
      this.container.classList.add(props.class);
    }

    this.visbible = false;
    this.menus = props.menus;
    this.triggerElement = props.triggerElement;
    this.createMenu();
    this.init();
  }

  // 动态创建下拉菜单
  createMenu() {
    // 创建图标按钮
    const button = this.triggerElement;

    if (!button) return;

    const dropdown = document.createElement("div");

    this.dropdown = dropdown;
    dropdown.classList.add("md-editor-dropdown-popper");
    this.id = useId().toString();
    this.dropdown.id = `${dropdownPoperIdPrefix}${this.id}`;

    const menuItems = this.menus;
    const ul = document.createElement("div");
    ul.classList.add("md-editor-dropdown-menus");

    menuItems.forEach((item) => {
      const li = document.createElement("div");
      if (item.onClick) {
        li.addEventListener("click", () => {
          if (this.config.hideOnClick) {
            this.hide();
          }
          item.onClick?.();
        });
      }

      li.classList.add("md-editor-dropdown-menu-item");

      if (item.createdHandler) {
        ul.appendChild(item.createdHandler(li, item));
      } else {
        li.textContent = item.title;
        ul.appendChild(li);
      }
    });

    dropdown.appendChild(ul);

    // 将按钮和菜单添加到容器中
    this.container.appendChild(button);


    this.appendTo.appendChild(dropdown)
  
  }

  // 显示下拉菜单
  show() {
    const dropdown = this.dropdown;

    if (!dropdown || !this.triggerElement) return;

    dropdown.style.display = "block";
    dropdown.setAttribute("tabindex", "-1");

    const buttonRect = this.triggerElement?.getBoundingClientRect();

    dropdown.style.left = `${buttonRect.left}px`;
    dropdown.style.top = `${buttonRect.bottom + window.scrollY}px`;

    dropdown.style.display = "block";
    this.visbible = true;
  }

  hide() {
    const dropdown = this.dropdown;

    if (!dropdown) return;

    dropdown.style.display = "none";
    this.visbible = false;
  }

  toggle() {
    if (this.visbible) {
      this.hide();
    } else {
      this.show();
    }
  }

  init() {
    const button = this.triggerElement;
    const dropdown = this.dropdown;

    if (!button) return;

    if (this.config.trigger === "mouseover") {
      const _hide = debounce(() => {
        this.hide();
      }, 200);
      this.container.addEventListener(this.config.trigger, () => {
        _hide.cancel();
        this.show();
      });

      this.container.addEventListener("mouseleave", () => {
        _hide();
      });

      if (dropdown) {
        dropdown.addEventListener("mouseenter", () => {
          _hide.cancel();
        });
        dropdown.addEventListener("mouseleave", () => {
          _hide();
        });
      }
    } else {
      this.container.addEventListener(this.config.trigger, () => {
        this.toggle();
      });
    }

    document.addEventListener("click", (e) => {
      if (!dropdown) return;

      if (
        this.visbible &&
        !dropdown.contains(e.target as any) &&
        e.target !== button
      ) {
        this.hide();
      }
    });
  }

  destory() {

    if(this.dropdown) {
      this.appendTo.removeChild(this.dropdown)
    }
  }
}
