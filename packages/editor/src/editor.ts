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
import { CodemirrorManager } from "./code-mirror";
import { InsertCallback } from "./code-mirror/interface";
import { taskPlugin } from "./plugins/task";
import { SidebarManager } from "./sidebar-manager";
import { debounce } from "lodash-es";
import { EditorScrollManager } from "./scroll-manager";
import { syncScrollPlugin } from "./plugins/sync-scroll";

interface MarkdownOptions {
  container: HTMLElement;

  height?: string;

  setup?: () => void;

  plugins?: (() => (editor: MarkdownEditor) => EditorPlugin)[];

  isSyncScoll?: boolean;

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

  public sidebarManager;

  public editorManager: CodemirrorManager;

  public scrollManager?: EditorScrollManager;

  constructor(public options: MarkdownOptions) {
    this.options = mergedDefaultOptions(options);
    this.container = this.options.container;

    this.content = "";
    this.pluginManager = createEditorPluginManager(this);
    this.toolbarManager = createEditorToolbarManager(this);

    const updateCallback = debounce((val: string) => {
      this.preview?.setContent(val);

      this.pluginManager.update();
    }, 80);

    this.editorManager = new CodemirrorManager({
      update: updateCallback,
    });

    this.sidebarManager = new SidebarManager({
      onClickHeading: (heading) => {
        this.preview?.$el?.querySelector(`#${heading.id}`)?.scrollIntoView({
          behavior: "smooth",
        })
      },
    });

    this.createEditor();
  }

  setContent(text: string) {
    this.editorManager.setContent(text);
    this.preview?.setContent(text);
    this.pluginManager.update();
    this.sidebarManager.updateHeading(this.preview?.queryAllHeadings() || []);
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
      syncScrollPlugin,
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

    this.editorManager.create(wrap);

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

    this.scrollManager = new EditorScrollManager(
      this.editorManager,
      this.preview,
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

  openSync() {
    this.scrollManager?.setSync(true);
    this.scrollManager?.addListener();
  }

  closeSync() {
    this.scrollManager?.setSync(false);
  }

  destroy() {
    this.closeSync();
    this.pluginManager.destroy();
    this.toolbarManager?.$el.remove();
  }
}

function createdEditorAfter(editor: MarkdownEditor) {
  editor.preview?.setContent(editor.content);
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
