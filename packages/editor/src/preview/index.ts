import {
  createMarkdownParser,
  bindCodeGroupsEvent,
  bindCopyCodeEvent,
  bindLazyLoadImageEvent,
  MarkdownParserProps,
} from "@md-doc-editor/parser";

import preview from "../ui/preview-image";

export interface MarkdownEditorPreviewOpitons {
  parserOptions?: MarkdownParserProps;

  onPreview?(src: string, event: MouseEvent): void;
}

export class MarkdownEditorPreview {
  public $el?: HTMLElement;
  public parser?: Awaited<ReturnType<typeof createMarkdownParser>>;

  public parserdHtmlText: string;

  protected _headings: MarkdownHeading[] = [];

  protected _currentAnchor: MarkdownHeading | null = null;

  protected _isAniming = false;

  protected options?: MarkdownEditorPreviewOpitons;

  constructor(options?: MarkdownEditorPreviewOpitons) {
    this.parserdHtmlText = "";
    this.options = options;
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
    // @ts-ignore
    import('@md-doc-editor/theme/dist/index.css')
    this.parser = await createMarkdownParser(this.options?.parserOptions);


  }

  create() {
    this.$el = document.createElement("div");
    this.$el.classList.add("md-editor-preview-body");

    bindPreviewEvent(this.$el, this.options);

    return this.$el;
  }

  setContent(text: string) {
    this.parserdHtmlText = this.parser?.parse(text) || "";
    this.render();
  }

  render() {
    if (!this.$el) return;
    this.$el.innerHTML = this.parserdHtmlText;

    bindPreviewEvent(this.$el, this.options);

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
        id: heading.id,
      };
    });
  }

  destory() {
    this.parser?.destory();
    this.$el?.remove();
  }
}

function bindPreviewEvent(
  container: HTMLElement | Document,
  options?: MarkdownEditorPreviewOpitons
) {
  bindCodeGroupsEvent(container);
  bindCopyCodeEvent({
    $el: container,
  });

  bindLazyLoadImageEvent({
    $el: container,
    onClick(src, e) {
      if (options?.onPreview) {
        options.onPreview(src, e);
      } else {
        preview(e.target as HTMLElement);
      }
    },
  });
}

export interface MarkdownHeading {
  level: number;
  title: string;
  el: HTMLElement;
  id: string;
}
