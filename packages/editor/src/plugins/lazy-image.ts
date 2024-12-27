import { bindLazyLoadImageEvent } from "@markdown-editor/parser";
import { MarkdownEditor } from "../editor";
import { EditorPlugin } from "../plugin";


export class LazyImagePlugin extends EditorPlugin {

    constructor(editor: MarkdownEditor) {
        super(editor);
    }

    update(): void {
        if(!this.editor.preview?.$el) return 
        bindLazyLoadImageEvent({
            $el: this.editor.preview.$el
        })
    }

}