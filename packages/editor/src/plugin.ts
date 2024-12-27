import { MarkdownEditor } from "./editor";

export class EditorPluginManager {
  public editor: MarkdownEditor;

  public plugins: EditorPlugin[];

  constructor(editor: MarkdownEditor) {
    this.editor = editor;
    this.plugins = [];
  }

  registerPlugins(plugins: _EditorPlugin[]) {
    plugins.forEach((PluginClass) => {
      const plugin = new PluginClass(this.editor);
      plugin.init();
      this.plugins.push(plugin);
    });
  }

  update() {
    this.plugins.forEach((plugin) => {
      plugin.update();
    });
  }
}

export class EditorPlugin {
  editor: MarkdownEditor;
  constructor(editor: MarkdownEditor) {
    this.editor = editor; // 插件需要访问编辑器实例
  }

  /**
   * 初始化插件
   */
  init() {}

  onClick() {}

  update() {}

  destroy() {}
}

export type _EditorPlugin = new (editor: MarkdownEditor) => EditorPlugin
