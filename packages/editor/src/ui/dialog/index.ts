import "../../style/ui/dialog.scss";
import "../../style/ui/button.scss";

interface DialogProps {
  style?: Record<string, any>;
  class?: string;
  appendTo?: HTMLElement;
  destroyOnClose?: boolean;
  width?: string | number;
  content?: string | ((parent: HTMLElement) => HTMLElement | string);
  title?: string;
  onConfirm?: () => void;
}

const defaultDialogConfig: DialogProps = {
  title: "标题",
  width: "50%",
};

export class Dialog {
  $el: HTMLElement | null = null;

  $body: HTMLElement | null = null;

  $parent: HTMLElement | null = null;

  visbible: boolean;

  config: DialogProps;

  constructor(props?: DialogProps) {
    this.config = Object.assign({}, defaultDialogConfig, props);
    this.visbible = false;

    this.$parent = this.config?.appendTo || document.body;

    console.log("this.config", this.config);
  }

  create() {
    const overlay = document.createElement("div");
    overlay.classList.add("md-editor-overlay");
    overlay.style.display = "none";

    overlay.addEventListener("click", (event) => {
      event.stopPropagation();
      this.close();
    });

    const dialog = document.createElement("div");
    this.$body = dialog;

    dialog.classList.add("md-editor-dialog");
    overlay.appendChild(dialog);

    this.config.width && this.setWidth(this.config.width);

    dialog.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    const dialogHeader = document.createElement("div");
    dialogHeader.classList.add("md-editor-dialog__header");

    const title = document.createElement("span");
    title.classList.add("md-editor-dialog__title");
    title.innerText = this.config.title || "";
    dialogHeader.appendChild(title);

    const close = document.createElement("span");
    close.classList.add("md-editor-dialog__close");
    close.innerHTML = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px"><path d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128l-265.344 263.936-263.04-263.84C236.64 191.584 216.384 191.52 203.84 204 191.328 216.48 191.296 236.736 203.776 249.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248 6.24 6.272 14.464 9.44 22.688 9.44 8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408 8.192 0 16.352-3.136 22.592-9.344 12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z"></path></svg>`;

    close.addEventListener("click", (event) => {
      event.stopPropagation();
      this.close();
    });

    dialogHeader.appendChild(close);

    dialog.appendChild(dialogHeader);

    const dialogContent = document.createElement("div");
    dialogContent.classList.add("md-editor-dialog__content");

    if (typeof this.config.content === "string") {
      dialogContent.innerHTML = this.config.content;
    } else {
      const contentResult = this.config.content?.(dialogContent);

      if (typeof contentResult === "string") {
        dialogContent.innerHTML = contentResult;
      } else {
        contentResult && dialogContent?.appendChild(contentResult);
      }
    }

    dialog.appendChild(dialogContent);

    const dialogFooter = document.createElement("div");
    dialogFooter.classList.add("md-editor-dialog__footer");

    const footerWrap = document.createElement("div");
    footerWrap.className = "md-editor-dialog__footer-wrap";

    const confirmButton = document.createElement("button");
    confirmButton.className = "md-editor-button";
    confirmButton.innerHTML = "确定";
    this.config.onConfirm &&
      confirmButton.addEventListener("click", () => {
        this.config.onConfirm?.();
      });
    footerWrap.appendChild(confirmButton);

    dialogFooter.appendChild(footerWrap);
    dialog.appendChild(dialogFooter);

    this.$parent?.appendChild(overlay);

    this.$el = overlay;
  }

  show() {
    if (!this.$el) {
      this.create();
    }
    if (!this.$el) return;
    this.visbible = true;
    this.$el.style.display = "block";
  }

  close() {
    if (!this.$el) return;
    this.visbible = false;
    this.$el.style.display = "none";
    if (this.config.destroyOnClose) {
      this.destory();
    }
  }

  setWidth(width: string | number) {
    if (!this.$body) return;

    this.$body.style.cssText = `--md-editor-dialog-width: ${
      typeof width === "number" ? `${width}px` : width
    }`;
  }

  destory() {
    if (!this.$el) return;
    this.$parent?.removeChild(this.$el);
    this.$el = null;
  }
}
