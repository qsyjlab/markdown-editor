import { MarkdownHeading } from "./preview";

interface SidebarManagerOptions {
  onClickHeading?: (heading: MarkdownHeading) => void;
}

export class SidebarManager {
  $el: HTMLElement | null = null;

  showState = false;

  public options: SidebarManagerOptions;

  /** 上次渲染的 heading 签名，未变化时跳过 DOM 重建 */
  private headingsSignature = "";

  private headingMap = new Map<string, MarkdownHeading>();

  constructor(options: SidebarManagerOptions) {
    this.options = options;
  }

  create() {
    this.$el = document.createElement("div");
    this.$el.classList.add("md-editor-sidebar");

    // 事件委托：TOC 重建后无需重新绑定点击
    this.$el.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement).closest(".md-editor-toc-item");
      if (!target) return;

      const id = target.getAttribute("data-heading-id") || "";
      const heading = this.headingMap.get(id);
      this.updateActiveHeading(id);
      if (heading) {
        this.options.onClickHeading?.(heading);
      }
    });
  }

  show() {
    if (!this.$el) return;
    this.showState = true;
    this.$el.classList.add("is-active");
  }

  close() {
    if (!this.$el) return;

    this.showState = false;
    this.$el.classList.remove("is-active");
  }

  toggle() {
    if (this.showState) {
      this.close();
    } else {
      this.show();
    }
  }

  updateHeading(headings: MarkdownHeading[]) {
    const signature = headings
      .map((h) => `${h.id}|${h.level}|${h.title}`)
      .join("\n");

    if (signature === this.headingsSignature) return;
    this.headingsSignature = signature;

    const toc = document.createElement("div");
    toc.classList.add("md-editor-toc");

    const fragment = document.createDocumentFragment();

    this.headingMap.clear();
    headings?.forEach((item) => {
      const heading = document.createElement("div");
      // textContent 而非 innerHTML：标题为纯文本，避免注入与多余解析
      heading.textContent = item.title || "";
      heading.classList.add("md-editor-toc-item");
      heading.style.paddingLeft = `${item.level * 15}px`;
      heading.setAttribute("data-heading-id", item.id);
      heading.id = `md-doc-heading-${item.el.id}`;
      fragment.appendChild(heading);

      this.headingMap.set(item.id, item);
    });

    toc.appendChild(fragment);

    clearChildren(this.$el);
    this.$el?.appendChild(toc);
  }

  updateActiveHeading(id: string) {
    this.$el?.querySelectorAll(".md-editor-toc-item.is-active").forEach((item) => {
      item.classList.remove("is-active");
    });

    if (id) {
      const activeHeadingEl = this.$el?.querySelector(
        "#md-doc-heading-" + id
      );

      activeHeadingEl?.classList.add("is-active");
      activeHeadingEl?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }

  remove() {
    if (!this.$el) return;
    this.$el.remove();
  }
}

function clearChildren(element: HTMLElement | null) {
  if (element?.hasChildNodes?.()) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}
