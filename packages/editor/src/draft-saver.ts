import { debounce } from "lodash-es";
import type { MarkdownEditor } from "./editor";

export interface DraftSaverOptions {
  /** localStorage 键名，默认按页面路径区分 */
  key?: string;
  /** 保存防抖毫秒数
   * @default 500
   */
  delay?: number;
}

interface DraftPayload {
  t: number;
  md: string;
}

const DEFAULT_DELAY = 500;

type DebouncedSave = ((md: string) => void) & {
  cancel(): void;
};

/**
 * 草稿自动保存：change 事件防抖写入 localStorage，
 * 崩溃/误关后下次初始化自动恢复。宿主 setup() 中的显式 setContent
 * 会在恢复之后执行、覆盖草稿（显式内容优先）。
 */
export class DraftSaver {
  private key: string;

  private offChange: (() => void) | null = null;

  private scheduleSave: DebouncedSave;

  constructor(
    private editor: MarkdownEditor,
    options: DraftSaverOptions = {}
  ) {
    const pathname =
      typeof location !== "undefined" ? location.pathname : "default";
    this.key = options.key ?? `md-doc-editor:draft:${pathname}`;
    this.scheduleSave = debounce(
      (md: string) => this.write(md),
      options.delay ?? DEFAULT_DELAY
    ) as DebouncedSave;
  }

  start() {
    if (this.offChange) return;
    this.offChange = this.editor.on("change", ({ markdown }) =>
      this.scheduleSave(markdown)
    );
  }

  /** 立即保存当前文档（快捷键 Mod-S） */
  saveNow() {
    this.scheduleSave.cancel();
    this.write(this.editor.getContent());
  }

  /** 恢复草稿；无草稿返回 false */
  restore(): boolean {
    const payload = this.read();
    if (!payload || !payload.md) return false;
    this.editor.setContent(payload.md);
    return true;
  }

  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch {
      /* storage 不可用时静默 */
    }
  }

  destroy() {
    this.offChange?.();
    this.offChange = null;
    this.scheduleSave.cancel();
  }

  private write(md: string) {
    try {
      const payload: DraftPayload = { t: Date.now(), md };
      localStorage.setItem(this.key, JSON.stringify(payload));
    } catch {
      /* 配额满 / 隐私模式：静默失败，不阻断编辑 */
    }
  }

  private read(): DraftPayload | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as DraftPayload) : null;
    } catch {
      return null;
    }
  }
}
