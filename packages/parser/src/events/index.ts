export * from "./code-group";
export * from "./copy-code";
export * from "./image";

import { bindCodeGroupsEvent } from "./code-group";
import { bindCopyCodeEvent } from "./copy-code";
import { bindLazyLoadImageEvent, LazyImageBinding } from "./image";

export interface PreviewEventsOptions {
  onImagePreview?: (src: string, e: MouseEvent) => void;
}

export interface PreviewEventsBinding {
  /** 块级 patch 后调用，刷新懒加载观察（只观察新增图片块） */
  refresh(): void;
  /** 释放全部监听器与观察器 */
  destroy(): void;
}

/**
 * 预览容器事件统一入口：容器创建时调用一次。
 * 复制按钮 / 代码组 tab 均为事件委托，动态插入的节点自动生效；
 * 图片懒加载通过 refresh() 增量观察，避免每次渲染重复绑定。
 */
export function bindPreviewEvents(
  container: HTMLElement | Document,
  options?: PreviewEventsOptions
): PreviewEventsBinding {
  const disposers: Array<() => void> = [
    bindCodeGroupsEvent(container),
    bindCopyCodeEvent({ $el: container }),
  ];

  let lazy: LazyImageBinding | null = null;
  if (container instanceof HTMLElement || container === document) {
    lazy = bindLazyLoadImageEvent({
      $el: container,
      onClick(src, e) {
        options?.onImagePreview?.(src, e);
      },
    });
    disposers.push(() => lazy?.destroy());
  }

  return {
    refresh: () => lazy?.refresh(),
    destroy: () => {
      disposers.forEach((dispose) => dispose());
      disposers.length = 0;
    },
  };
}
