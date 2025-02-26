import { bindLazyLoadImageEvent } from "@md-doc-editor/parser";
import { MarkdownEditor } from "../editor";
import preview from "../ui/preview-image";

export function LazyImagePlugin(editor: MarkdownEditor) {
  return {
    name:'lazy-image',
    update: () => {
      if (!editor.preview?.$el) return;
      bindLazyLoadImageEvent({
        $el: editor.preview.$el,
        onClick(src, e) {
          preview(e.target as HTMLElement)
        },
      });
    },
  };
}
