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
  strikeoutPlugin,
  tablePlugin,
  uploadImagePlugin,
  toggleThemePlugin,
} from "./plugins";
import { taskPlugin } from "./plugins/task";
import { syncScrollPlugin } from "./plugins/sync-scroll";
import { toggleLayoutPlugin } from "./plugins/toggle-layout";
import { fullscreenPlugin } from "./plugins/full-screen";
import { historyPlugin } from "./plugins/history";
import { EditorPluginFn } from "./plugin";

export const defaultPlugins: EditorPluginFn[] = [
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
  historyPlugin,
  toggleThemePlugin
];
