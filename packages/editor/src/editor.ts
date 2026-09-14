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
import { getOffsetTop, getScroll, scrollTo, useId } from "./utils";

import "./style/editor.scss";

interface MarkdownOptions {
  container: HTMLElement;

  height?: string;

  setup?: () => void;

  plugins?: (() => (editor: MarkdownEditor) => EditorPlugin)[];

  /**
   * 是否开启编辑/预览滚动同步
   * @default true
   */
  isSyncScroll?: boolean;

  /** @deprecated 拼写错误，请使用 isSyncScroll */
  isSyncScoll?: boolean;

  onFocus?: () => void;

  onBlur?: () => void;

  parserOptions?: MarkdownParserProps;

  leftToolbar?: string[];
  rightToolbar?: string[];

  /**
   * 图片上传
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

  public clientId: string = "";

  public layoutState = {
    showToolbar: true,
    showPreview: true,
    fullscreen: false,
  };

  constructor(public options: MarkdownOptions) {
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
      onBlur: this.options.onBlur,
      onFocus: this.options.onFocus,
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

    this.createEditor();
  }

  setContent(text: string) {
    this.content = text;
    // dispatch 增量替换，保留撤销历史；docChanged 会再调度一次管线更新（块缓存命中，开销极小）
    this.editorManager.setContent(text);

    // 立即渲染，保证编程式更新的即时性
    this.previewManager?.setContent(text);
    this.pluginManager.update();
    this.sidebarManager.updateHeading(this.previewManager?.headings ?? []);
  }

  getContent() {
    return this.content;
  }

  insert(callback: InsertCallback) {
    this.editorManager.insertAndSelectText(callback);
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
          ...(plugin.toolbar as Required<typeof plugin.toolbar>),
        });
      }
    });

    if (this.toolbarManager) {
      this.toolbarManager.renderAll(this.iconManager);
      this.editorContainer.appendChild(this.toolbarManager.getBody());
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

    // isSyncScroll 为修正后的选项名，isSyncScoll 为 v1 兼容回退
    const syncScrollEnabled =
      this.options.isSyncScroll ?? this.options.isSyncScoll ?? true;

    if (syncScrollEnabled) {
      this.openSync();
    } else {
      this.closeSync();
    }
    createdEditorAfter(this);
  }

  toggleFullscreen(value?: boolean) {
    this.layoutState.fullscreen =
      value !== undefined ? value : !this.layoutState.fullscreen;

    if (!this.editorContainer) return;
    if (this.layoutState.fullscreen) {
      this.editorContainer.classList.add("is-fullscreen");
      this.editorContainer.style.height = "";
    } else {
      this.editorContainer.classList.remove("is-fullscreen");
      this.editorContainer.style.height = this.options.height || "auto";
    }
  }

  onlyShowEditable() {
    this.editorBody?.classList.add("is-only-show-editable");
    this.editorBody?.classList.remove("is-only-show-preview");
    this.layoutState.showPreview = false;
    this.layoutState.showToolbar = true;
  }

  onlyShowPreview() {
    this.editorBody?.classList.remove("is-only-show-editable");
    this.editorBody?.classList.add("is-only-show-preview");
    this.layoutState.showPreview = true;
    this.layoutState.showToolbar = false;
  }

  resetLayout() {
    this.editorBody?.classList.remove("is-only-show-editable");
    this.editorBody?.classList.remove("is-only-show-preview");
    this.layoutState.showPreview = true;
    this.layoutState.showToolbar = true;
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
  }

  toggleTheme() {
    const theme = this.container.getAttribute("md-theme");
    const newTheme = theme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  destroy() {
    this.updatePipeline.cancel();
    this.closeSync();
    this.scrollManager?.destroy();
    this.pluginManager.destroy();
    this.toolbarManager.destroy();
    this.editorManager.destroy();
    this.previewManager?.destroy();
    this.editorContainer?.remove();
  }

  /** @deprecated 拼写错误，请使用 destroy() */
  destory() {
    this.destroy();
  }
}

function createdEditorAfter(editor: MarkdownEditor) {
  editor.previewManager?.setContent(editor.content);
  editor.pluginManager.update();
  editor.options?.setup?.();
}

function mergedDefaultOptions(options: MarkdownOptions) {
  return Object.assign(
    {} as MarkdownOptions,
    {
      isSyncScoll: true,
      leftToolbar: [
        "undo",
        "redo",
        "clear",
        "header",
        "bold",
        "strickout",
        "quote",
        "link",
        "table",
        "code",
        "splitLine",
        "task",
        "uploadImage",
      ],
      rightToolbar: [
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
