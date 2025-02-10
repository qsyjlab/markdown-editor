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
  headerPlugin,
  LazyImagePlugin,
  linkPlugin,
  quotePlugin,
  splitLinePlugin,
  strickoutPlugin,
  uploadImagePlugin,
} from "./plugins";
import { MarkdownEditorPreview } from "./preview";
import { createSelectionManager, SelectionManager } from "./selection";
import {
  createEditorToolbarManager,
  MarkdownEditorToolbarManager,
} from "./toolbar";
import { createCodeMirror } from "./code-mirror";
import { InsertCallback } from "./code-mirror/interface";

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

  public selectionManager: SelectionManager;

  public iconManager = createIconManager();

  public editable?: HTMLTextAreaElement;

  public editorManager = createCodeMirror(this);

  constructor(public options: MarkdownOptions) {
    this.container = options.container;

    this.content = "";
    this.pluginManager = createEditorPluginManager(this);
    this.toolbarManager = createEditorToolbarManager(this);
    this.selectionManager = createSelectionManager(this);

    this.createEditor();
  }

  setContent(text: string) {
    this.editorManager.setContent(text);
    this.preview?.setContent(text);
    this.pluginManager.update();
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

    this.container.append(this.editorContainer);

    createdEditorAfter(this);
  }
}

function createdEditorAfter(editor: MarkdownEditor) {
  editor.preview?.setContent(editor.content);
  editor.pluginManager.update();
  editor.options?.setup?.();
}
