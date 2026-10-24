import { debounce } from "lodash-es";
import { CodemirrorManager } from "./code-mirror";
import { MarkdownEditorPreview, MarkdownHeading } from "./preview";
import { getOffsetTop } from "./utils";

interface ScrollManagerOptions {
  onHeadingAnchorChange?: (
    currentHeadingAnchor: MarkdownHeading | null
  ) => void;
}

export class EditorScrollManager {
  private editorDom: HTMLElement;
  private previewDom: HTMLElement;

  private codeMirrorManager: CodemirrorManager;

  private previewMananger: MarkdownEditorPreview;

  public isSync = true;

  private _scrollTop: number = 0;

  private _currentAnchor: MarkdownHeading | null = null;

  private options: ScrollManagerOptions;

  /** debounce 后的引用必须保留，removeEventListener 才能真正移除 */
  private syncScrollDebounced: () => void;

  private listening = false;

  private headingRafId: number | null = null;

  /** data-line 元素缓存，随 preview.contentVersion 失效 */
  private lineElements: Element[] = [];

  private lineElementsVersion = -1;

  constructor(
    codeMirrorManager: CodemirrorManager,
    previewMananger: MarkdownEditorPreview,
    options: ScrollManagerOptions
  ) {
    this.codeMirrorManager = codeMirrorManager;
    this.editorDom = this.codeMirrorManager.instance?.scrollDOM!;
    this.previewMananger = previewMananger;
    this.previewDom = this.previewMananger.$el!;
    this.options = options;

    this.syncScrollDebounced = debounce(() => this.syncScroll(), 60);

    this.previewDom.addEventListener("scroll", this.onPreviewScroll);
  }

  get currentAnchor() {
    return this._currentAnchor;
  }

  get scrollTop() {
    return this._scrollTop;
  }

  setSync(val: boolean) {
    this.isSync = val;
  }

  toggleSync() {
    this.isSync = !this.isSync;
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

      if (!editableIns) return;

      const scrollTop = this.editorDom.scrollTop;
      const topBlock = editableIns.lineBlockAtHeight(scrollTop + 10);
      const lineNumber = editableIns.state.doc.lineAt(topBlock.from).number;
      const targetLine = lineNumber - 1;

      const elements = this.getLineElements();
      let targetElement: Element | null = null;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const line = parseInt(el.getAttribute("data-line") || "-1", 10);
        if (line <= targetLine) {
          targetElement = el;
        } else {
          break;
        }
      }

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }
  }

  addListener() {
    if (this.listening) return;
    this.listening = true;
    this.editorDom.addEventListener("scroll", this.syncScrollDebounced);
  }

  removeListener() {
    if (!this.listening) return;
    this.listening = false;
    this.editorDom.removeEventListener("scroll", this.syncScrollDebounced);
  }

  updateHeading() {
    const currentActiveLink = getInternalCurrentAnchor(
      this.previewDom,
      this.previewMananger.headings,
      20,
      5
    );

    // 锚点未变化时不通知，避免 TOC 重复高亮刷新
    if (currentActiveLink?.id === this._currentAnchor?.id) return;

    this._currentAnchor = currentActiveLink;
    this.options.onHeadingAnchorChange?.(this.currentAnchor);
  }

  destroy() {
    this.removeListener();
    this.previewDom.removeEventListener("scroll", this.onPreviewScroll);
    if (this.headingRafId !== null) {
      cancelAnimationFrame(this.headingRafId);
      this.headingRafId = null;
    }
  }

  private onPreviewScroll = () => {
    if (this.previewMananger.isAniming) return;
    // rAF 节流：滚动高频事件下每帧最多计算一次当前锚点
    if (this.headingRafId !== null) return;
    this.headingRafId = requestAnimationFrame(() => {
      this.headingRafId = null;
      this.updateHeading();
    });
  };

  private getLineElements(): Element[] {
    const version = this.previewMananger.contentVersion;
    if (version !== this.lineElementsVersion) {
      this.lineElements = Array.from(
        this.previewDom.querySelectorAll("[data-line]")
      );
      this.lineElementsVersion = version;
    }
    return this.lineElements;
  }
}

function getInternalCurrentAnchor(
  container: HTMLElement,
  _links: MarkdownHeading[],
  _offsetTop = 0,
  _bounds = 5
): MarkdownHeading | null {
  const linkSections: { link: MarkdownHeading; top: number }[] = [];

  _links.forEach((link) => {
    const target = link.el;
    if (target && container) {
      const top = getOffsetTop(target, container);

      if (top < _offsetTop + _bounds) {
        linkSections.push({ link, top });
      }
    }
  });

  if (linkSections.length) {
    const maxSection = linkSections.reduce((prev, curr) =>
      curr.top > prev.top ? curr : prev
    );
    return maxSection.link;
  }
  return null;
}

export type AnchorContainer = HTMLElement | Window;
