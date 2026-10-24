import type { MarkdownEditor } from "./editor";

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
    destroy: () => {
      Object.values(plugins).forEach((plugin) => {
        plugin?.destroy?.();
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

  destroy: () => void

  plugins: Record<string, EditorPlugin>;

  add: (name: string, api: EditorPlugin) => void;

  registerPlugins: (plugins: EditorPluginFn[]) => void;
}

export interface EditorToolbarButtonConfig {
  /** 工具栏按钮标识（注册时可省略，默认取插件 name） */
  name?: string;
  icon: string;
  label: string;
  activeLabel?: string;
  inActiveLabel?: string;
  type?: "button" | "dropdown";
  dropTrigger?: "mouseover";
  fetch?: (
    callback: (menus: { label: string; name: string; onAction: () => void }[]) => void
  ) => void;
  onAction?: () => void;
  defaultState?: { isActive?: boolean };
  position?: 'left' | 'right';
}

export interface EditorPlugin {
  name: string;
  init?: () => void;

  toolbar?: EditorToolbarButtonConfig;

  onClick?: () => void;
  update?: () => void;

  destroy?: () => void;
}


export type EditorPluginFn = (editor: MarkdownEditor) => EditorPlugin
