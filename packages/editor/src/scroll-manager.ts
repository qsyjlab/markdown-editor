import { debounce } from "lodash-es";
import { CodemirrorManager } from "./code-mirror";
import { MarkdownEditorPreview, MarkdownHeading } from "./preview";

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

  constructor(
    codeMirrorManager: CodemirrorManager,
    previewMananger: MarkdownEditorPreview,
    options: ScrollManagerOptions
  ) {
    this.codeMirrorManager = codeMirrorManager;
    this.editorDom = this.codeMirrorManager!.instance?.scrollDOM!;
    this.previewMananger = previewMananger;
    this.previewDom = this.previewMananger.$el!;
    this.options = options;

    this.previewDom.addEventListener("scroll", () => {
      if (this.previewMananger.isAniming) return;
      this.updateHeading();
    });
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
      const previewDom = this.previewDom;

      if (!editableIns) return;

      const scrollTop = this.editorDom.scrollTop;
      const topBlock = editableIns.lineBlockAtHeight(scrollTop + 10);
      const lineNumber = editableIns.state.doc.lineAt(topBlock.from).number;
      const targetLine = lineNumber - 1;

      const elements = previewDom.querySelectorAll("[data-line]");
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
    this.editorDom.addEventListener(
      "scroll",
      debounce(this.syncScroll, 60).bind(this)
    );
  }

  removeListener() {
    this.editorDom.removeEventListener("scroll", this.syncScroll);
  }

  updateHeading() {
    const currentActiveLink = getInternalCurrentAnchor(
      this.previewDom,
      this.previewMananger.queryAllHeadings(),
      20,
      5
    );
    this._currentAnchor = currentActiveLink;
    this.options.onHeadingAnchorChange?.(this.currentAnchor);
  }
}

function getInternalCurrentAnchor(
  container: HTMLElement,
  _links: MarkdownHeading[],
  _offsetTop = 0,
  _bounds = 5
): MarkdownHeading | null {
  const linkSections: any[] = [];

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

function getOffsetTop(
  element: HTMLElement,
  container: AnchorContainer
): number {
  if (!element.getClientRects().length) {
    return 0;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width || rect.height) {
    if (container === window) {
      container = document.documentElement;
      return rect.top - container.clientTop;
    }
    return rect.top - (container as HTMLElement).getBoundingClientRect().top;
  }

  return rect.top;
}

export type AnchorContainer = HTMLElement | Window;
