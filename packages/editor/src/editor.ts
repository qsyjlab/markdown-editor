// import { debounce } from "lodash-es";

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
import { MarkdownEditorPreview } from "./preview";
import {
  createEditorToolbarManager,
  MarkdownEditorToolbarManager,
} from "./toolbar";
import { createCodeMirror } from "./code-mirror";
import { InsertCallback } from "./code-mirror/interface";
import { taskPlugin } from "./plugins/task";
import { SidebarManager } from "./sidebar-manager";

interface MarkdownOptions {
  container: HTMLElement;

  height?: string;

  setup?: () => void;

  plugins?: (() => (editor: MarkdownEditor) => EditorPlugin)[];

  /**
   * 图片上传
   */
  imagesUploadHandler?: (
    file: File,
    success: (path: string) => void,
    failure: (msg: string) => void
  ) => void;
}

export class MarkdownEditor {
  public container: HTMLElement;

  public content: string;
  public editorContainer?: HTMLElement;
  public preview?: MarkdownEditorPreview;

  public toolbarManager?: MarkdownEditorToolbarManager;

  public pluginManager: EditorPluginManager;

  public iconManager = createIconManager();

  public sidebarManager = new SidebarManager();

  public editorManager = createCodeMirror(this);

  constructor(public options: MarkdownOptions) {
    this.container = options.container;

    this.content = "";
    this.pluginManager = createEditorPluginManager(this);
    this.toolbarManager = createEditorToolbarManager(this);

    this.createEditor();
    console.log("insntace", this);
  }

  setContent(text: string) {
    this.editorManager.setContent(text);
    this.preview?.setContent(text);
    this.pluginManager.update();

    const headings = this.preview?.queryAllHeadings();

    const headingsContent = document.createElement("div");

    headings?.forEach((item) => {
      const heading = document.createElement("div");
      heading.innerHTML = item.title || ''
      heading.classList.add(`md-editor-toc-item`);
      heading.style.paddingLeft = `${(item.level - 1) * 10}px`;
      headingsContent.appendChild(heading);
    });

    this.sidebarManager.$el?.append(headingsContent);

    // debugger
    console.log("headings", headings);
  }

  getContent() {
    return this.content;
  }

  insert(callback: InsertCallback) {
    this.editorManager.insertAndSelectText(callback);
  }

  async createEditor() {
    this.editorContainer = document.createElement("div", {});
    this.editorContainer.classList.add("md-editor");
    this.editorContainer.style.height = this.options.height || "auto";

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
    ];
    this.pluginManager.registerPlugins(plugins);

    if (this.toolbarManager) {
      this.toolbarManager.init();
      this.editorContainer.appendChild(this.toolbarManager?.$el);
    }

    // 创建 body
    const editorBody = document.createElement("div");
    editorBody.classList.add("md-editor-body");

    const wrap = document.createElement("div");

    wrap.classList.add("md-editor-editable");

    this.editorManager.init(wrap);
    editorBody.appendChild(wrap);

    const previewInstance = new MarkdownEditorPreview();
    await previewInstance.init();
    this.preview = previewInstance;

    editorBody.appendChild(previewInstance.create());

    this.editorContainer.appendChild(editorBody);

    this.sidebarManager.create();

    if (this.sidebarManager.$el) {
      editorBody.appendChild(this.sidebarManager.$el);
    }

    this.container.append(this.editorContainer);

    createdEditorAfter(this);
  }
}

function createdEditorAfter(editor: MarkdownEditor) {
  editor.preview?.setContent(editor.content);
  editor.pluginManager.update();
  editor.options?.setup?.();
}

function generateTocElement() {}
