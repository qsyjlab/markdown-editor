import {
  createMarkdownParser,
  BlockPatcher,
  MarkdownParser,
  bindPreviewEvents,
  PreviewEventsBinding,
  StreamingRenderer,
  MarkdownParserProps,
  ParsedBlock,
} from "@md-doc-editor/parser";

import preview from "../ui/preview-image";

export interface MarkdownEditorPreviewOptions {
  parserOptions?: MarkdownParserProps;

  onPreview?(src: string, event: MouseEvent): void;
}

export class MarkdownEditorPreview {
  public $el?: HTMLElement;
  public contentEl?: HTMLElement;
  public parser?: MarkdownParser;

  /** 渲染的完整 HTML */
  public parsedHtmlText = "";

  /** 每次内容实际变化时自增，供滚动同步等做缓存失效 */
  public contentVersion = 0;

  protected _headings: MarkdownHeading[] = [];

  protected _isAniming = false;

  protected options?: MarkdownEditorPreviewOptions;

  private patcher?: BlockPatcher;

  private events?: PreviewEventsBinding;

  private streamSession?: StreamingRenderer;

  private text = "";

  constructor(options?: MarkdownEditorPreviewOptions) {
    this.options = options;
  }

  get parsedHtml() {
    return this.parsedHtmlText;
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

  protected _currentAnchor: MarkdownHeading | null = null;

  async init() {
    // @ts-ignore 主题包入口为 CSS，仅作为副作用加载
    import("@md-doc-editor/theme");

    this.parser = await createMarkdownParser(this.options?.parserOptions);
  }

  create() {
    this.contentEl = document.createElement("div");
    this.contentEl.classList.add("md-editor-preview-body");

    // 事件只在容器创建时绑定一次：委托模式对后续动态插入的节点持续生效
    this.patcher = new BlockPatcher(this.contentEl);
    this.events = bindPreviewEvents(this.contentEl, {
      onImagePreview: (src, e) => {
        if (this.options?.onPreview) {
          this.options.onPreview(src, e);
        } else {
          preview(e.target as HTMLElement);
        }
      },
    });

    this.$el = this.contentEl;

    return this.$el;
  }

  /**
   * 全量设置内容：块级增量解析 + 块级 DOM patch，
   * 未变化的块节点保持原样（不触发图片重载、不丢失滚动状态）。
   */
  setContent(text: string) {
    this.text = text;
    this.streamSession = undefined;

    if (!this.parser || !this.patcher) return;

    const result = this.parser.parseIncremental(text);
    this.applyResult(result.blocks, result.changedFrom, result.changedTo, result.html);
  }

  /**
   * 流式追加内容（AI 逐 chunk 输出场景）：
   * 只重渲染"进行中的最后一块"，已完成块 DOM 恒定。
   */
  appendStreaming(chunk: string) {
    if (!this.parser || !this.patcher) return;

    if (!this.streamSession) {
      this.streamSession = this.parser.createStreamingSession();
      this.streamSession.setText(this.text);
    }

    const range = this.streamSession.append(chunk);
    this.text = this.streamSession.getText();
    this.applyResult(
      this.streamSession.getBlocks(),
      range.changedFrom,
      range.changedTo,
      this.streamSession.getHtml()
    );
  }

  /** 结束流式会话并定稿渲染 */
  finishStreaming() {
    if (!this.streamSession) return;
    this.setContent(this.text);
  }

  /**
   * 事件刷新入口（供插件在内容 patch 后调用）：
   * 目前用于增量观察新出现的懒加载图片块。
   */
  refreshEvents() {
    this.events?.refresh();
  }

  private applyResult(
    blocks: ParsedBlock[],
    changedFrom: number,
    changedTo: number,
    html: string
  ) {
    if (!this.patcher) return;

    this.patcher.apply(blocks, changedFrom, changedTo);
    this.parsedHtmlText = html;

    if (changedFrom === changedTo) return;

    this.contentVersion++;
    this._headings = this.queryAllHeadings();
    this.events?.refresh();
  }

  queryAllHeadings(): MarkdownHeading[] {
    const headings = this.contentEl?.querySelectorAll("h1,h2,h3,h4,h5,h6") || [];
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

  destroy() {
    this.events?.destroy();
    this.events = undefined;
    this.patcher?.destroy();
    this.patcher = undefined;
    this.streamSession = undefined;
    this.parser?.destroy();
    this.parser = undefined;
    this.$el?.remove();
  }
}

export interface MarkdownHeading {
  level: number;
  title: string;
  el: HTMLElement;
  id: string;
}
