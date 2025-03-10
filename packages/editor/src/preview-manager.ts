import { MarkdownEditorPreview, MarkdownEditorPreviewOpitons } from "./preview";

export class EditorPreviewManager extends MarkdownEditorPreview {
  constructor(options?: MarkdownEditorPreviewOpitons) {
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

  destory() {
    this.$el?.remove();
    super.destory();
  }
}
