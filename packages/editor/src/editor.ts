import { MarkdownParserProps } from "@md-doc-editor/parser";

import { createIconManager } from "./icon-manager";
import {
  EditorPlugin,
  EditorPluginFn,
  EditorPluginManager,
  createEditorPluginManager,
} from "./plugin";
import { defaultPlugins } from "./default-plugins";
import { EditorToolbarManager } from "./toolbar";
import { CodemirrorManager } from "./code-mirror";
import { InsertCallback } from "./code-mirror/interface";
import { SidebarManager } from "./sidebar-manager";
import { EditorPreviewManager } from './preview-manager'
import { EditorScrollManager } from "./scroll-manager";
import { createUpdatePipeline, UpdatePipeline } from "./update-pipeline";
import { EditorEventBus, EditorEventName, EditorEventHandler } from "./event-bus";
import { EditorAIManager } from "./ai/ai-manager";
import { AISelectionMenu } from "./ai/selection-menu";
import { AISuggestionBar } from "./ai/suggestion-bar";
export type {
  AIAction,
  AIContext,
  AICompleteRequest,
  AIProvider,
  AIStreamMode,
} from "./ai/provider";
import { getOffsetTop, getScroll, scrollTo, useId } from "./utils";
import { exportHtml, downloadHtml, type ExportHtmlOptions } from "./utils/export-html";
import { toggleWrap } from "./utils/format";
import { DraftSaver, type DraftSaverOptions } from "./draft-saver";

import "./style/editor.scss";

export interface EditorStats {
  /** 非空白字符数 */
  characters: number;
  /** 词数（CJK 字符 + 西文单词） */
  words: number;
  lines: number;
}

export interface EditorOptions {
  container: HTMLElement;

  height?: string;

  setup?: () => void;

  plugins?: (() => (editor: MarkdownEditor) => EditorPlugin)[];

  /**
   * 是否开启编辑/预览滚动同步
   * @default true
   */
  isSyncScroll?: boolean;

  /**
   * 是否显示工具栏右侧字数状态栏
   * @default true
   */
  statusBar?: boolean;

  /**
   * 选中文本时是否显示 AI 动作浮动菜单（需注入 AIProvider）
   * @default true
   */
  aiSelectionMenu?: boolean;

  /**
   * AI 建议栏：选区动作默认以建议模式执行（diff 预览 + 接受/拒绝），
   * 此开关只控制建议栏 UI；关闭后建议仍可通过 ai.getSuggestions() 读取
   * @default true
   */
  aiSuggestionBar?: boolean;

  /**
   * 草稿自动保存（localStorage，防抖）。初始化时在 setup() 之后恢复草稿
   * （草稿优先）；需要初始内容优先传 { restore: false } 或 setup 中 clearDraft()。
   */
  autoSave?: boolean | DraftSaverOptions;

  onFocus?: () => void;

  onBlur?: () => void;

  parserOptions?: MarkdownParserProps;

  leftToolbar?: string[];
  rightToolbar?: string[];

  /**
   * 图片上传（工具栏上传、粘贴、拖拽共用此处理器）
   */
  imagesUploadHandler?: (
    file: File,
    success: (path: string) => void,
    failure: (msg: string) => void
  ) => void;

  onPreview?: (path: string) => void;

  onChange?: (mdText: string, htmlText: string) => void;

  theme?: "light" | "dark";
}

export class MarkdownEditor {
  public container: HTMLElement;

  public content: string;
  public editorContainer?: HTMLElement;

  public editorBody?: HTMLElement;

  public previewManager?: EditorPreviewManager;

  public toolbarManager: EditorToolbarManager;

  public pluginManager: EditorPluginManager;

  public iconManager = createIconManager();

  public sidebarManager;

  public editorManager: CodemirrorManager;

  public scrollManager?: EditorScrollManager;

  public updatePipeline: UpdatePipeline;

  /** 事件总线：change / focus / blur / themeChange / layoutChange / aiStream* / destroy */
  public readonly eventBus = new EditorEventBus();

  /** AI 写作：宿主经 setProvider 注入模型，内置/自定义动作流式写入文档 */
  public readonly ai: EditorAIManager;

  private aiSelectionMenu: AISelectionMenu | null = null;

  private aiSuggestionBar: AISuggestionBar | null = null;

  public clientId: string = "";

  public layoutState = {
    showToolbar: true,
    showPreview: true,
    fullscreen: false,
  };

  private statusBarEl: HTMLElement | null = null;

  private draftSaver: DraftSaver | null = null;

  constructor(public options: EditorOptions) {
    this.clientId = useId().toString();

    this.options = mergedDefaultOptions(options);
    this.container = this.options.container;

    if (this.options.theme) {
      this.setTheme(this.options.theme);
    }

    this.content = "";
    this.pluginManager = createEditorPluginManager(this);

    this.updatePipeline = createUpdatePipeline(this);

    this.toolbarManager = new EditorToolbarManager({
      leftToolbar: this.options.leftToolbar,
      rightToolbar: this.options.rightToolbar,
    });
    this.editorManager = new CodemirrorManager({
      update: (val) => this.updatePipeline.schedule(val),
      onBlur: () => {
        this.options.onBlur?.();
        this.eventBus.emit("blur", undefined);
      },
      onFocus: () => {
        this.options.onFocus?.();
        this.eventBus.emit("focus", undefined);
      },
      hotkeys: [
        { key: "Mod-b", run: () => (toggleWrap(this, "**"), true) },
        { key: "Mod-i", run: () => (toggleWrap(this, "*"), true) },
        { key: "Mod-Shift-x", run: () => (toggleWrap(this, "~~"), true) },
        {
          key: "Mod-k",
          run: () => (this.toolbarManager.runAction("link"), true),
        },
        {
          key: "Mod-s",
          preventDefault: true,
          run: () => {
            if (!this.draftSaver) return false;
            this.draftSaver.saveNow();
            return true;
          },
        },
      ],
    });

    this.sidebarManager = new SidebarManager({
      onClickHeading: (heading) => {
        const previewEl = this.previewManager?.$el;
        if (!previewEl) return;

        const scrollTop = getScroll(previewEl, true);

        const targetElement = heading.el;

        if (!targetElement) return;

        const eleOffsetTop = getOffsetTop(targetElement, previewEl);
        const y = scrollTop + eleOffsetTop;

        this.previewManager?.setAniming(true);
        scrollTo(y, {
          getContainer: () => previewEl,
          callback: () => {
            this.previewManager?.setAniming(false);
          },
        });
      },
    });

    this.eventBus.on("change", () => this.refreshStatusBar());

    this.ai = new EditorAIManager(this);

    if (this.options.autoSave) {
      this.draftSaver = new DraftSaver(
        this,
        typeof this.options.autoSave === "object" ? this.options.autoSave : {}
      );
    }

    this.createEditor();
  }

  /** 订阅编辑器事件，返回取消订阅函数 */
  on<K extends EditorEventName>(event: K, handler: EditorEventHandler<K>): () => void {
    return this.eventBus.on(event, handler);
  }

  off<K extends EditorEventName>(event: K, handler: EditorEventHandler<K>) {
    this.eventBus.off(event, handler);
  }

  setContent(text: string) {
    this.content = text;
    // dispatch 增量替换，保留撤销历史；docChanged 会调度管线更新
    this.editorManager.setContent(text);
    // 立即 flush：单一路径完成预览渲染/插件/TOC/onChange，避免与直连渲染重复执行
    this.updatePipeline.flush();
  }

  /** 当前文档内容（以 CodeMirror 文档为准，避免防抖窗口内的旧值） */
  getContent() {
    return this.editorManager.instance?.state.doc.toString() ?? this.content;
  }

  /** 文档统计：字符数 / 词数 / 行数 */
  getStats(): EditorStats {
    const text = this.getContent();
    const characters = text.replace(/\s/g, "").length;
    // CJK 按字计数，西文按单词计数
    const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).length;
    const latinWords = (
      text.replace(/[\u4e00-\u9fff\u3040-\u30ff]/g, " ").match(/[a-zA-Z0-9_'-]+/g) || []
    ).length;
    const lines = this.editorManager.instance
      ? this.editorManager.instance.state.doc.lines
      : text.split("\n").length;
    return { characters, words: cjk + latinWords, lines };
  }

  insert(callback: InsertCallback) {
    this.editorManager.insertAndSelectText(callback);
  }

  /**
   * AI 流式写入：将增量 chunk 追加到文档末尾（经 CodeMirror dispatch，
   * 自然进入统一更新管线做块级增量渲染，支持撤销）。
   * 预览侧的纯流式渲染可单独使用 previewManager.appendStreaming。
   */
  appendStreaming(chunk: string) {
    const view = this.editorManager.instance;
    if (!view) return;
    const end = view.state.doc.length;
    view.dispatch({ changes: { from: end, to: end, insert: chunk } });
  }

  /** 结束流式写入：立即 flush 更新管线，保证预览与回调定稿 */
  finishStreaming() {
    this.updatePipeline.flush();
  }

  /**
   * 导出当前文档为自包含 HTML 字符单文件
   * （渲染 HTML + 页面样式快照内联，shiki 配色为行内样式自带）
   */
  exportHtml(options?: ExportHtmlOptions) {
    return exportHtml(this.previewManager?.parsedHtmlText ?? "", {
      title: "Markdown 导出",
      ...options,
    });
  }

  /** 导出并触发浏览器下载 */
  downloadHtml(filename = "markdown-export") {
    downloadHtml(filename, this.exportHtml());
  }

  /** 立即保存草稿（开启 autoSave 时可用，快捷键 Mod-S） */
  saveDraft() {
    this.draftSaver?.saveNow();
  }

  /**
   * 存在草稿且 autoSave.restore 未关闭时恢复草稿（setup 之后调用，草稿优先）。
   * 宿主也可在任意时机手动调用。
   */
  restoreDraftIfEnabled(): boolean {
    if (!this.draftSaver) return false;
    const restoreEnabled =
      typeof this.options.autoSave === "object"
        ? this.options.autoSave.restore !== false
        : true;
    return restoreEnabled ? this.draftSaver.restore() : false;
  }

  /** 清除草稿 */
  clearDraft() {
    this.draftSaver?.clear();
  }

  /** 打开查找替换面板（快捷键 Mod-F） */
  openSearch() {
    this.editorManager.openSearch();
  }

  /** 关闭查找替换面板 */
  closeSearch() {
    this.editorManager.closeSearch();
  }

  focus() {
    this.editorManager.instance?.focus();
  }

  blur() {
    const view = this.editorManager.instance;
    if (view?.hasFocus) view.contentDOM.blur();
  }

  undo() {
    this.editorManager.undo();
  }

  redo() {
    this.editorManager.redo();
  }

  async createEditor() {
    this.editorContainer = document.createElement("div");
    this.editorContainer.classList.add("md-editor");
    this.editorContainer.style.height = this.options.height || "auto";

    this.setClientId(this.clientId);
    this.toolbarManager.setClientId(this.clientId);

    const plugins: EditorPluginFn[] = [...defaultPlugins];

    if (this.options.plugins && this.options.plugins.length) {
      plugins.push(...this.options.plugins);
    }

    this.pluginManager.registerPlugins(plugins);

    Object.values(this.pluginManager.plugins).forEach((plugin) => {
      if (plugin.toolbar) {
        this.toolbarManager.register({
          name: plugin.name,
          ...plugin.toolbar,
        });
      }
    });

    if (this.toolbarManager) {
      this.toolbarManager.renderAll(this.iconManager);
      this.editorContainer.appendChild(this.toolbarManager.getBody());
    }

    if (this.options.statusBar !== false) {
      this.createStatusBar();
    }

    const currentTheme = this.container.getAttribute("md-theme");
    if (currentTheme) {
      const popperContainer = document.body.querySelector(
        `[md-doc-editor-popper-client-id="${this.clientId}"]`
      );
      if (popperContainer) {
        popperContainer.setAttribute("md-theme", currentTheme);
      }
    }

    // 创建 body
    const editorBody = document.createElement("div");
    editorBody.classList.add("md-editor-body");

    const wrap = document.createElement("div");

    wrap.classList.add("md-editor-editable");

    this.editorManager.create(wrap);

    this.setupImageDropPaste(wrap);

    if (this.options.aiSelectionMenu !== false) {
      this.aiSelectionMenu = new AISelectionMenu(this);
    }

    if (this.options.aiSuggestionBar !== false) {
      this.aiSuggestionBar = new AISuggestionBar(this);
    }

    this.editorManager.instance?.dom.addEventListener("mousedown", () => {
      this.scrollManager?.syncScroll();
    });

    editorBody.appendChild(wrap);

    this.editorBody = editorBody;

    const parserOptions = {
      ...this.options.parserOptions,
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
    }

    const previewInstance = new EditorPreviewManager({
      parserOptions: parserOptions,
      onPreview: this.options.onPreview
    });
    await previewInstance.init();
    this.previewManager = previewInstance;

    editorBody.appendChild(previewInstance.create());

    this.editorContainer.appendChild(editorBody);

    this.sidebarManager.create();

    if (this.sidebarManager.$el) {
      editorBody.appendChild(this.sidebarManager.$el);
    }

    this.container.append(this.editorContainer);

    this.scrollManager = new EditorScrollManager(
      this.editorManager,
      this.previewManager,
      {
        onHeadingAnchorChange: (currentAnchor) => {
          this.sidebarManager.updateActiveHeading(currentAnchor?.id || "");
        },
      }
    );

    if (this.options.isSyncScroll) {
      this.openSync();
    } else {
      this.closeSync();
    }

    // 草稿保存在 setup() 之后启动（恢复逻辑见 createdEditorAfter）
    this.draftSaver?.start();

    createdEditorAfter(this);
  }

  toggleFullscreen(value?: boolean) {
    this.layoutState.fullscreen =
      value !== undefined ? value : !this.layoutState.fullscreen;

    if (this.editorContainer) {
      if (this.layoutState.fullscreen) {
        this.editorContainer.classList.add("is-fullscreen");
        this.editorContainer.style.height = "";
      } else {
        this.editorContainer.classList.remove("is-fullscreen");
        this.editorContainer.style.height = this.options.height || "auto";
      }
    }

    this.emitLayoutChange();
  }

  onlyShowEditable() {
    this.editorBody?.classList.add("is-only-show-editable");
    this.editorBody?.classList.remove("is-only-show-preview");
    this.layoutState.showPreview = false;
    this.layoutState.showToolbar = true;
    this.emitLayoutChange();
  }

  onlyShowPreview() {
    this.editorBody?.classList.remove("is-only-show-editable");
    this.editorBody?.classList.add("is-only-show-preview");
    this.layoutState.showPreview = true;
    this.layoutState.showToolbar = false;
    this.emitLayoutChange();
  }

  resetLayout() {
    this.editorBody?.classList.remove("is-only-show-editable");
    this.editorBody?.classList.remove("is-only-show-preview");
    this.layoutState.showPreview = true;
    this.layoutState.showToolbar = true;
    this.emitLayoutChange();
  }

  openSync() {
    this.scrollManager?.setSync(true);
    this.scrollManager?.addListener();
  }

  closeSync() {
    this.scrollManager?.setSync(false);
    this.scrollManager?.removeListener();
  }

  setClientId(id: string) {
    this.clientId = id;
    this.editorContainer?.setAttribute("md-editor-client-id", id);
  }

  setTheme(theme: "light" | "dark") {
    this.container.setAttribute("md-theme", theme);
    const popperContainer = document.body.querySelector(
      `[md-doc-editor-popper-client-id="${this.clientId}"]`
    );
    if (popperContainer) {
      popperContainer.setAttribute("md-theme", theme);
    }
    this.eventBus.emit("themeChange", { theme });
  }

  toggleTheme() {
    const theme = this.container.getAttribute("md-theme");
    const newTheme = theme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  destroy() {
    this.eventBus.emit("destroy", undefined);
    this.updatePipeline.cancel();
    this.aiSelectionMenu?.destroy();
    this.aiSelectionMenu = null;
    this.aiSuggestionBar?.destroy();
    this.aiSuggestionBar = null;
    this.draftSaver?.destroy();
    this.draftSaver = null;
    this.closeSync();
    this.scrollManager?.destroy();
    this.pluginManager.destroy();
    this.toolbarManager.destroy();
    this.editorManager.destroy();
    this.previewManager?.destroy();
    this.editorContainer?.remove();
    this.eventBus.clear();
  }

  private emitLayoutChange() {
    this.eventBus.emit("layoutChange", { ...this.layoutState });
  }

  private createStatusBar() {
    const right = this.toolbarManager
      .getBody()
      .querySelector(".md-editor-toolbar__right");
    if (!right) return;

    this.statusBarEl = document.createElement("span");
    this.statusBarEl.classList.add("md-editor-status");
    right.appendChild(this.statusBarEl);
    this.refreshStatusBar();
  }

  private refreshStatusBar() {
    if (!this.statusBarEl) return;
    const { characters, words, lines } = this.getStats();
    this.statusBarEl.textContent = `${words} 词 · ${characters} 字符 · ${lines} 行`;
  }

  /**
   * 粘贴 / 拖拽图片统一走 imagesUploadHandler，
   * 上传成功后以 markdown 图片语法插入光标处。
   */
  private setupImageDropPaste(el: HTMLElement) {
    const handler = this.options.imagesUploadHandler;
    if (!handler) return;

    const uploadFiles = (files: File[]) => {
      files
        .filter((file) => file.type.startsWith("image/"))
        .forEach((file) => {
          handler(
            file,
            (path) => {
              this.insert(({ start, end }) => ({
                start,
                end,
                formattedText: `\n![${file.name}](${path})`,
              }));
            },
            (msg) => {
              console.error("[md-editor] image upload failed:", msg);
            }
          );
        });
    };

    el.addEventListener("paste", (e) => {
      const files = Array.from(e.clipboardData?.files || []);
      if (!files.length) return;
      e.preventDefault();
      uploadFiles(files);
    });

    el.addEventListener("dragover", (e) => e.preventDefault());

    el.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) return;
      e.preventDefault();
      uploadFiles(files);
    });
  }
}

function createdEditorAfter(editor: MarkdownEditor) {
  editor.previewManager?.setContent(editor.content);
  editor.sidebarManager.updateHeading(editor.previewManager?.headings ?? []);
  editor.pluginManager.update();
  editor.options?.setup?.();

  // 草稿优先：setup() 之后存在草稿则恢复用户上次编辑。
  // 初始内容优先的宿主传 autoSave: { restore: false } 或在 setup 中 clearDraft()
  editor.restoreDraftIfEnabled();
}

function mergedDefaultOptions(options: EditorOptions) {
  return Object.assign(
    {} as EditorOptions,
    {
      isSyncScroll: true,
      statusBar: true,
      leftToolbar: [
        "undo",
        "redo",
        "clear",
        "header",
        "bold",
        "italic",
        "strikeout",
        "quote",
        "link",
        "table",
        "code",
        "splitLine",
        "task",
        "uploadImage",
      ],
      rightToolbar: [
        "ai",
        "syncScroll",
        "onlyEditable",
        "onlyPreview",
        "fullscreen",
        "toggle-theme",
        "content",
      ],
    },
    options
  );
}
