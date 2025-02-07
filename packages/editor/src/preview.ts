import {
  createMarkdownParser,
  bindCodeGroupsEvent,
  bindCopyCodeEvent,
  bindLazyLoadImageEvent,
} from "@md-doc-editor/parser";

export class MarkdownEditorPreview {
  public $el?: HTMLElement;
  public parser?: Awaited<ReturnType<typeof createMarkdownParser>>;

  public parserdHtmlText: string;

  constructor() {
    this.parserdHtmlText = "";
  }

  async init() {
    this.parser = await createMarkdownParser();
  }

  create() {
    this.$el = document.createElement("div");
    this.$el.classList.add("md-editor-preview");

    bindPreviewEvent(this.$el)

    return this.$el;
  }

  setContent(text: string) {
    this.parserdHtmlText = this.parser?.parse(text) || "";
    this.render();
  }

  render() {
    if (!this.$el) return;
    this.$el.innerHTML = this.parserdHtmlText;

    bindPreviewEvent(this.$el);
  }
}

function bindPreviewEvent(container: HTMLElement | Document) {
  bindCodeGroupsEvent(container);
  bindCopyCodeEvent({
    $el: container,
  });

  bindLazyLoadImageEvent({
    $el: container,
  });
}
