/**
 * 编辑器事件总线：轻量发布/订阅，供插件与宿主解耦通信。
 *
 * 设计约束：
 * - 不引入 reactive 依赖，纯 Map 实现；
 * - 事件名与 payload 类型由 EditorEvents 接口约束，on/emit 双侧类型安全；
 * - off 未注册的 handler 是安全的 no-op。
 */
export interface EditorEvents {
  /** 文档内容变化（防抖后），payload 为最新 markdown 与渲染 HTML */
  change: { markdown: string; html: string };
  focus: void;
  blur: void;
  /** 主题切换，payload 为新主题 */
  themeChange: { theme: "light" | "dark" };
  /** 布局状态变化（全屏 / 仅编辑 / 仅预览 / 双栏） */
  layoutChange: { fullscreen: boolean; showPreview: boolean; showToolbar: boolean };
  /** 编辑器销毁前 */
  destroy: void;
}

export type EditorEventName = keyof EditorEvents;

export type EditorEventHandler<K extends EditorEventName> = (
  payload: EditorEvents[K]
) => void;

export class EditorEventBus {
  private handlers = new Map<EditorEventName, Set<EditorEventHandler<never>>>();

  on<K extends EditorEventName>(event: K, handler: EditorEventHandler<K>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as EditorEventHandler<never>);
    return () => this.off(event, handler);
  }

  off<K extends EditorEventName>(event: K, handler: EditorEventHandler<K>) {
    this.handlers.get(event)?.delete(handler as EditorEventHandler<never>);
  }

  emit<K extends EditorEventName>(event: K, payload: EditorEvents[K]) {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        (handler as EditorEventHandler<K>)(payload);
      } catch (error) {
        // 单个订阅者异常不阻断其他订阅者与编辑器主流程
        console.error(`[md-editor] ${String(event)} handler error:`, error);
      }
    }
  }

  clear() {
    this.handlers.clear();
  }
}
