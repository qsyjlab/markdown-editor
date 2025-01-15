import { debounce } from "lodash-es";

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
  LazyImagePlugin,
  linkPlugin,
  strickoutPlugin,
} from "./plugins";
import { MarkdownEditorPreview } from "./preview";
import { createSelectionManager, SelectionManager } from "./selection";
import {
  createEditorToolbarManager,
  MarkdownEditorToolbarManager,
} from "./toolbar";

interface MarkdownOptions {
  container: HTMLElement;

  height?: string;

  setup?: () => void;

  plugins?: (() => (editor: MarkdownEditor) => EditorPlugin)[];
}

type InsertCallback = (
  selected: string,
  start: number,
  end: number
) => InsertCallbackResult;

interface InsertCallbackResult {
  start: number;
  end: number;
  formattedText: string;
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

  constructor(public options: MarkdownOptions) {
    this.container = options.container;

    this.content = "";
    this.pluginManager = createEditorPluginManager(this);
    this.toolbarManager = createEditorToolbarManager(this);
    this.selectionManager = createSelectionManager(this);

    this.createEditor();
  }

  setContent(text: string) {
    // this.content = text;

    if (this.editable) {
      this.editable.value = text;
    }

    this.content = this.editable?.value || "";
    this.preview?.setContent(text);
    this.pluginManager.update();
  }

  getContent() {
    return this.content;
  }

  insert(callback: InsertCallback) {
    if (!this.editable) return;

    const {
      selectedText,
      selectionStart = 0,
      selectionEnd = 0,
    } = this.selectionManager.getSelection() || {};
    const { start, end, formattedText } = callback(
      selectedText || "",
      selectionStart,
      selectionEnd
    );

    this.editable.focus();
    const content = this.content;

    const preStr = content.substring(0, selectionStart);
    const sufStr = content.substring(selectionEnd);
    const text = preStr + formattedText + sufStr;
    this.setContent(text);

    this.selectionManager.setSelectionRange(start, end);
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
    ];
    this.pluginManager.registerPlugins(plugins);

    if (this.toolbarManager) {
      this.toolbarManager.init();
      this.editorContainer.appendChild(this.toolbarManager?.$el);
    }

    // 创建 body
    const editorBody = document.createElement("div");
    editorBody.classList.add("md-editor-body");

    editorBody.appendChild(createEditorTextArea(this));

    const previewInstance = new MarkdownEditorPreview();
    await previewInstance.init();
    this.preview = previewInstance;

    editorBody.appendChild(previewInstance.create());

    this.editorContainer.appendChild(editorBody);

    this.container.append(this.editorContainer);

    createdEditorAfter(this);
  }
}

function createEditorTextArea(editor: MarkdownEditor) {
  const editable = document.createElement("textarea");

  editor.editable = editable;
  editable.setAttribute("spellcheck", "false");

  editable.addEventListener(
    "input",
    debounce(() => {
      const textContent = editable.value;
      editor.setContent(textContent);
      // editor.preview?.setContent(textContent);
    }, 200)
  );

  const wrap = document.createElement("div");

  wrap.classList.add("md-editor-editable");

  wrap.append(editable);

  return wrap;
}

function createdEditorAfter(editor: MarkdownEditor) {
  editor.preview?.setContent(editor.content);
  editor.pluginManager.update();
  editor.options?.setup?.();
}
