import { MarkdownEditor } from "./editor";

export function createEditorPluginManager(
  editor: MarkdownEditor
): EditorPluginManager {
  const plugins: Record<string, EditorPlugin> = {};

  return {
    plugins,
    add: (name, api) => {
      plugins[name] = api;
    },
    update: () => {
      Object.values(plugins).forEach((plugin) => {
        plugin?.update?.();
      });
    },
    registerPlugins(plugins: EditorPluginFn[]) {
      plugins.forEach((plugin) => {
        const pluginResult = plugin(editor)
        this.add(pluginResult.name, pluginResult)
        pluginResult.init?.()
    
      });
    }
  };
}


export interface EditorPluginManager {
  update: () => void;

  plugins: Record<string, EditorPlugin>;

  add: (name: string, api: EditorPlugin) => void;

  registerPlugins: (plugins: EditorPluginFn[]) => void;
}
export interface EditorPlugin extends Record<string, any> {

  name:string
  init?: () => void;

  onClick?: () => void;
  update?: () => void;

  destroy?: () => void;
}


export type EditorPluginFn=  (editor: MarkdownEditor) => EditorPlugin