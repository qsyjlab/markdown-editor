export class SidebarManager {
  $el: HTMLElement | null = null;

  showState = false;

  constructor() {}

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

  remove() {
    if (!this.$el) return;
    this.$el.remove();
  }
}
