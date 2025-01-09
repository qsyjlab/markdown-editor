import { bindLazyLoadImageEvent } from "@markdown-editor/parser";
import { MarkdownEditor } from "../editor";

export function LazyImagePlugin(editor: MarkdownEditor) {
  return {
    name:'lazy-image',
    update: () => {
      if (!editor.preview?.$el) return;
      bindLazyLoadImageEvent({
        $el: editor.preview.$el,
      });
    },
  };
}
