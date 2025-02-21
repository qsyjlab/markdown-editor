import { debounce } from "lodash-es";
import { CodemirrorManager } from "./code-mirror";
import { MarkdownEditorPreview } from "./preview";

export class EditorScrollManager {
  private editorDom: HTMLElement;
  private previewDom: HTMLElement;

  private codeMirrorManager: CodemirrorManager;

  private previewMananger: MarkdownEditorPreview;

  private isSync = false;

  private _scrollTop: number = 0;
  constructor(
    codeMirrorManager: CodemirrorManager,
    previewMananger: MarkdownEditorPreview
  ) {
    this.codeMirrorManager = codeMirrorManager;
    this.editorDom = this.codeMirrorManager!.instance?.scrollDOM!;
    this.previewMananger = previewMananger;

    this.previewDom = this.previewMananger.$el!;
  }

  get scrollTop() {
    return this._scrollTop;
  }

  setSync(val: boolean) {
    debugger;
    this.isSync = val;
  }

  toggleSync() {
    this.isSync = !this.isSync;

    if (this.isSync) {
    }

    return this.isSync;
  }

  syncScroll() {
    if (!this.isSync) {
      return;
    }
    if (!this.editorDom) {
      return;
    }
    if (!this.previewDom) {
      return;
    }

    this._scrollTop = this.editorDom.scrollTop;

    if (this.editorDom.scrollTop < 5) {
      this.previewDom.scrollTo({ top: 0 });
    } // 如果在尾部附近
    else if (
      this.editorDom.clientHeight + this.editorDom.scrollTop >
      this.editorDom.scrollHeight - 20
    ) {
      this.previewDom.scrollTop = this.previewDom.scrollHeight;
    } else {
      const editableIns = this.codeMirrorManager.instance;
      const previewDom = this.previewDom;

      console.log("editableIns", editableIns);

      if (!editableIns) return;

      const matchHtmlTags =
        "p, h1, h2, h3, h4, h5, h6, ul, ol, li, pre, blockquote, hr, table, tr, iframe, span";

      // 文档头部, 距离整个浏览器的距离
      const top = editableIns.documentTop;
      // 获取可见位置最顶部的内容
      const topBlock = editableIns.lineBlockAtHeight(Math.abs(top) + 85);
      const invisibleMarkdown: string = editableIns.state.sliceDoc(
        0,
        topBlock.from
      );
      const invisibleHtml =
        this.previewMananger?.parser?.parse(invisibleMarkdown);

      const invisibleDomAll = new DOMParser().parseFromString(
        invisibleHtml,
        "text/html"
      );

      const editorDoms = invisibleDomAll.body.querySelectorAll(matchHtmlTags);

      const previewDoms = previewDom?.querySelectorAll(matchHtmlTags);

      const tagetDom = previewDoms?.[editorDoms.length];
      tagetDom?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }

  addListener() {
    this.editorDom.addEventListener(
      "scroll",
      debounce(this.syncScroll, 60).bind(this)
    );
  }

  removeListener() {
    this.editorDom.removeEventListener("scroll", this.syncScroll);
  }
}
