import { MarkdownParserProps } from "@md-doc-editor/parser";

import { createIconManager } from "./icon-manager";
import {
  EditorPlugin,
  EditorPluginFn,
  EditorPluginManager,
  createEditorPluginManager,
} from "./plugin";
import {
  boldPlugin,
  clearPlugin,
  codePlugin,
  contentPlugin,
  headerPlugin,
  LazyImagePlugin,
  linkPlugin,
  quotePlugin,
  splitLinePlugin,
  strickoutPlugin,
  tablePlugin,
  uploadImagePlugin,
} from "./plugins";
import { EditorToolbarManager } from "./toolbar";
import { CodemirrorManager } from "./code-mirror";
import { InsertCallback } from "./code-mirror/interface";
import { taskPlugin } from "./plugins/task";
import { SidebarManager } from "./sidebar-manager";
import { EditorPreviewManager } from './preview-manager'
import { debounce } from "lodash-es";
import { EditorScrollManager } from "./scroll-manager";
import { syncScrollPlugin } from "./plugins/sync-scroll";
import { getOffsetTop, getScroll, scrollTo, useId } from "./utils";
import { toggleLayoutPlugin } from "./plugins/toggle-layout";
import { fullscreenPlugin } from "./plugins/full-screen";
import { hisotryPlugin } from "./plugins/history";

import "./style/editor.scss";

interface MarkdownOptions {
  container: HTMLElement;

  height?: string;

  setup?: () => void;

  plugins?: (() => (editor: MarkdownEditor) => EditorPlugin)[];

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

    this.content = "";
    this.pluginManager = createEditorPluginManager(this);

    const updateCallback = debounce((val: string) => {
       this.previewManager?.setContent(val);

      this.pluginManager.update();
      this.sidebarManager.updateHeading( this.previewManager?.queryAllHeadings() || []);
      this.options?.onChange?.(val,  this.previewManager?.parserdHtmlText || "");
    }, 80);

    this.toolbarManager = new EditorToolbarManager({});
    this.editorManager = new CodemirrorManager({
      update: updateCallback,
      onBlur: this.options.onBlur,
      onFocus: this.options.onFocus,
    });

    this.sidebarManager = new SidebarManager({
      onClickHeading: (heading) => {
        const scrollTop = getScroll( this.previewManager?.$el!, true);

        const targetElement = heading.el;

        if (!targetElement) return;

        const eleOffsetTop = getOffsetTop(targetElement,  this.previewManager?.$el!);
        let y = scrollTop + eleOffsetTop;

         this.previewManager?.setAniming(true);
        scrollTo(y, {
          getContainer: () =>  this.previewManager?.$el!,
          callback: () => {
             this.previewManager?.setAniming(false);
          },
        });
      },
    });

    this.createEditor();
  }

  setContent(text: string) {
    this.editorManager.setContent(text);
     this.previewManager?.setContent(text);
    this.pluginManager.update();
    this.sidebarManager.updateHeading( this.previewManager?.queryAllHeadings() || []);
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
    this.editorContainer = document.createElement("div", {});
    this.editorContainer.classList.add("md-editor");
    this.editorContainer.style.height = this.options.height || "auto";

    this.setClientId(this.clientId);
    this.toolbarManager.setClientId(this.clientId);

    const plugins: EditorPluginFn[] = [
      LazyImagePlugin,
      clearPlugin,
      boldPlugin,
      strickoutPlugin,
      linkPlugin,
      codePlugin,
      quotePlugin,
      splitLinePlugin,
      headerPlugin,
      uploadImagePlugin,
      tablePlugin,
      taskPlugin,
      contentPlugin,
      syncScrollPlugin,
      toggleLayoutPlugin,
      fullscreenPlugin,
      hisotryPlugin,
    ];

    if (this.options.plugins && this.options.plugins.length) {
      plugins.push(...this.options.plugins);
    }

    this.pluginManager.registerPlugins(plugins);

    if (this.toolbarManager) {
      this.toolbarManager.renderAll(this.iconManager);
      this.editorContainer.appendChild(this.toolbarManager.getBody());
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

    const previewInstance = new EditorPreviewManager({
      parserOptions: this.options.parserOptions,
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

    if (this.options.isSyncScoll) {
      this.openSync();
    } else {
      this.closeSync();
    }
    createdEditorAfter(this);
  }

  toggleFullscreen(value?: boolean) {
    if (value !== void 0) {
      this.layoutState.fullscreen = value;
      return;
    }
    this.layoutState.fullscreen = !this.layoutState.fullscreen;

    if (!this.editorContainer) return;
    if (this.layoutState.fullscreen) {
      this.editorContainer?.classList.add("is-fullscreen");
      this.editorContainer.style.height = "";
    } else {
      this.editorContainer?.classList.remove("is-fullscreen");
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
  }

  setClientId(id: string) {
    this.clientId = id;
    this.editorContainer?.setAttribute("md-editor-client-id", id);
  }

  destory() {
    this.closeSync();
    this.pluginManager.destroy();
    this.toolbarManager.destory();
    this.editorManager.destory();
    this.editorContainer?.remove();
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
    },
    options
  );
}
