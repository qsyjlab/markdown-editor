import { MarkdownHeading } from "./preview";
import { clearElementChildren } from "./utils";


interface SidebarManagerOptions {
  onClickHeading?: (heading: MarkdownHeading)=> void
}


export class SidebarManager {
  $el: HTMLElement | null = null;

  showState = false;

  public options:SidebarManagerOptions

  constructor(options: SidebarManagerOptions) {
    this.options = options
  }

  create() {
    this.$el = document.createElement("div");
    this.$el.classList.add("md-editor-sidebar");
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
    const headingsContent = document.createElement("div");
    headingsContent.classList.add("md-editor-toc");

    headings?.forEach((item) => {
      const heading = document.createElement("div");
      heading.innerHTML = item.title || "";
      heading.classList.add(`md-editor-toc-item`);
      heading.style.paddingLeft = `${item.level * 15}px`;

      heading.id = `md-doc-heading-${item.el.id}`;
      headingsContent.appendChild(heading);

      heading.addEventListener("click", () => {
        this.updateActiveHeading(item.id);
        this.options.onClickHeading?.(item)
      });
    });

    clearElementChildren(this.$el!)

    this.$el?.append(headingsContent)
  }

  updateActiveHeading(id: string) {
    this.$el?.querySelectorAll(".md-editor-toc-item").forEach((item) => {
      item.classList.remove("is-active");
    });

    if (id) {
      const activeHeadingEl = this.$el?.querySelector("#md-doc-heading-" + id);

      activeHeadingEl?.classList.add("is-active");
      activeHeadingEl?.scrollIntoView({
        behavior: "smooth",
        block: 'nearest'
      });
    }
  }

  remove() {
    if (!this.$el) return;
    this.$el.remove();
  }
}
