import {
  createMarkdownParser,
  bindCodeGroupsEvent,
  bindCopyCodeEvent,
  bindLazyLoadImageEvent,
} from "@md-doc-editor/parser";


// interface MarkdownEditorPreviewOpitons {

//   onHeadingChange?: (currentActive: MarkdownHeading | null)=> void
// }

export class MarkdownEditorPreview {
  public $el?: HTMLElement;
  public parser?: Awaited<ReturnType<typeof createMarkdownParser>>;

  public parserdHtmlText: string;

  private _headings: MarkdownHeading[] = [];

  private _currentAnchor: MarkdownHeading | null = null;

  private _isAniming = false;

  constructor() {
    this.parserdHtmlText = "";
  }

  
  get isAniming() {
    return this._isAniming;
  }

  setAniming(val: boolean) {
    this._isAniming = val;
  }

  get headings() {
    return this._headings;
  }

  get currentAnchor() {
    return this._currentAnchor;
  }

  async init() {
    this.parser = await createMarkdownParser();
  }

  create() {
    this.$el = document.createElement("div");
    this.$el.classList.add("md-editor-preview");

    bindPreviewEvent(this.$el);

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

    this._headings = this.queryAllHeadings();
  }

  queryAllHeadings(): MarkdownHeading[] {
    const headings = this.$el?.querySelectorAll("h1,h2,h3,h4,h5,h6") || [];
    return Array.from(headings).map((heading) => {
      const level = parseInt(heading.tagName[1], 10);
      return {
        level,
        title: heading.textContent || "",
        el: heading as HTMLElement,
        id: heading.id
      };
    });
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

export interface MarkdownHeading {
  level: number;
  title: string;
  el: HTMLElement;
  id: string
}
