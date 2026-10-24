import { debounce } from "lodash-es";
import type { MarkdownEditor } from "./editor";

/**
 * 编辑器唯一数据流入口：
 * CodeMirror docChanged → schedule（防抖）→ 增量渲染预览 → 同步 TOC/插件/回调。
 * v1 中散落在 editor.ts 的更新逻辑收敛于此，插件不再各自触发渲染。
 */
export interface UpdatePipeline {
  /** 调度一次更新（80ms 防抖，重复调度自动合并） */
  schedule(value: string): void;

  /** 立即执行挂起的更新（若存在） */
  flush(): void;

  /** 取消挂起的更新 */
  cancel(): void;
}

export function createUpdatePipeline(editor: MarkdownEditor): UpdatePipeline {
  const run = (value: string) => {
    editor.content = value;

    const preview = editor.previewManager;
    preview?.setContent(value);

    editor.pluginManager.update();
    // headings 已在预览 patch 后缓存，这里直接复用，避免重复 DOM 查询
    editor.sidebarManager.updateHeading(preview?.headings ?? []);

    const html = preview?.parsedHtml ?? "";
    editor.options?.onChange?.(value, html);
    editor.eventBus.emit("change", { markdown: value, html });
  };

  const debouncedRun = debounce(run, 80);

  return {
    schedule: debouncedRun,
    flush: () => debouncedRun.flush(),
    cancel: () => debouncedRun.cancel(),
  };
}
