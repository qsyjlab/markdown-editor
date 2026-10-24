import { MarkdownEditorPreview, MarkdownEditorPreviewOptions } from "./preview";

export class EditorPreviewManager extends MarkdownEditorPreview {
  constructor(options?: MarkdownEditorPreviewOptions) {
    super(options);
    this.options = options;
  }

  create() {
    const preview = super.create();
    this.$el = document.createElement("div");
    this.$el.classList.add("md-editor-preview");
    this.$el.appendChild(preview);
    return this.$el;
  }

  destroy() {
    this.$el?.remove();
    super.destroy();
  }
}
