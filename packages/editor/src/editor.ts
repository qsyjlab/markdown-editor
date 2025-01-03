import { IconManager } from "./icon-manager";
import { _EditorPlugin, EditorPluginManager } from "./plugin";
import { LazyImagePlugin } from "./plugins";
import { MarkdownEditorPreview } from "./preview";
import { MarkdownEditorToolbar } from "./toolbar";

interface MarkdownOptions {
  container: HTMLElement;

  height?: string;

  setup?: () => void;

  plugins?: _EditorPlugin[];
}

export class MarkdownEditor {
  public container: HTMLElement;

  public content: string;
  public editorContainer?: HTMLElement;
  public preview?: MarkdownEditorPreview;
  public toolbar?: MarkdownEditorToolbar;

  private pluginManager: EditorPluginManager;

  public iconManager = new IconManager();

  private editable?: HTMLTextAreaElement;

  constructor(public options: MarkdownOptions) {
    this.container = options.container;

    this.content = "";
    this.pluginManager = new EditorPluginManager(this);
    this.createEditor();
  }

  setContent(text: string) {
    this.content = text;

    if (this.editable) {
      this.editable.value = text;
    }

    this.preview?.setContent(text);
    this.pluginManager.update();
  }

  async createEditor() {
    this.editorContainer = document.createElement("div", {});
    this.editorContainer.classList.add("md-editor");
    this.editorContainer.style.height = this.options.height || "auto";

    const toolbar = new MarkdownEditorToolbar(this);

    if (toolbar.$el) {
      this.editorContainer.appendChild(toolbar.$el);
    }

    // 创建 body
    const editorBody = document.createElement("div");
    editorBody.classList.add("md-editor-body");

    editorBody.appendChild(this.createEditorTextArea());

    const previewInstance = new MarkdownEditorPreview();
    await previewInstance.init();
    this.preview = previewInstance;

    editorBody.appendChild(previewInstance.create());

    this.editorContainer.appendChild(editorBody);

    this.container.append(this.editorContainer);

    this.createdEditorAfter();
  }

  createdEditorAfter() {
    this.preview?.setContent(this.content);

    const plugins: _EditorPlugin[] = [LazyImagePlugin];

    if (this.options.plugins?.length) {
      plugins.push(...this.options.plugins);
    }

    this.pluginManager.registerPlugins(plugins);

    this.options?.setup?.();
  }
  createEditorTextArea() {
    const editable = document.createElement("textarea");

    this.editable = editable;
    editable.setAttribute("spellcheck", "false");

    editable.addEventListener("input", (e) => {
      const textContent = editable.value;

      this.preview?.setContent(textContent);
    });

    const wrap = document.createElement("div");

    wrap.classList.add("md-editor-editable");

    wrap.append(editable);

    return wrap;
  }
  
}
