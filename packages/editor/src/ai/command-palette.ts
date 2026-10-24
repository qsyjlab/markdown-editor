import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { MarkdownEditor } from "../editor";

/**
 * AI 命令面板（Cmd/Ctrl+K）：输入自然语言指令，交给 provider 的
 * "command" 动作执行，输出直接写入光标处（直接写入模式，可撤销）。
 * 面板定位在光标附近，Esc 取消，Enter 执行。
 *
 * provider 侧约定：收到 action === "command" 时，req.prompt 即用户的
 * 原始指令 + 编辑器上下文前缀（由 provider 自行解析）。
 */
export class AICommandPalette {
  private $el: HTMLElement | null = null;

  private inputEl: HTMLInputElement | null = null;

  private visible = false;

  private editor: MarkdownEditor;

  private disposers: Array<() => void> = [];

  /** command 动作的默认 prompt 前缀 */
  static COMMAND_PROMPT_PREFIX =
    "你是 markdown 编辑助手。根据用户指令对给出内容执行操作，只输出结果本身。\n用户指令：";

  constructor(editor: MarkdownEditor) {
    this.editor = editor;

    const $el = document.createElement("div");
    $el.classList.add("md-editor-ai-palette");
    $el.style.display = "none";

    const label = document.createElement("span");
    label.classList.add("md-editor-ai-palette__label");
    label.textContent = "AI ⌘K";

    const input = document.createElement("input");
    input.classList.add("md-editor-ai-palette__input");
    input.placeholder = "输入指令，如：为这段添加示例代码块…";
    input.type = "text";

    $el.appendChild(label);
    $el.appendChild(input);
    editor.editorContainer?.appendChild($el);
    this.$el = $el;
    this.inputEl = input;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.hide();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const text = input.value.trim();
        if (text) this.execute(text);
        this.hide();
      }
    });

    // Cmd/Ctrl+K 开关
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.toggle();
      }
    };
    document.addEventListener("keydown", onKeydown);
    this.disposers.push(() =>
      document.removeEventListener("keydown", onKeydown)
    );

    // 点击外部关闭
    const onMousedown = (e: MouseEvent) => {
      if (!this.visible || !this.$el) return;
      if (!this.$el.contains(e.target as Node)) this.hide();
    };
    document.addEventListener("mousedown", onMousedown);
    this.disposers.push(() =>
      document.removeEventListener("mousedown", onMousedown)
    );
  }

  toggle() {
    if (this.visible) this.hide();
    else this.show();
  }

  show() {
    if (!this.$el || !this.editor.ai.hasProvider) return;
    const view = this.editor.editorManager.instance;
    if (!view) return;

    this.$el.style.display = "flex";
    this.visible = true;
    this.inputEl!.value = "";

    // 定位到光标附近
    const coords = view.coordsAtPos(view.state.selection.main.head);
    if (coords) {
      const reference = {
        getBoundingClientRect: () => ({
          x: coords.left,
          y: coords.top,
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
          right: coords.right,
          width: 0,
          height: 0,
          toJSON: () => ({}),
        }),
        getClientRects: () => [] as DOMRect[],
      };
      void computePosition(reference as never, this.$el, {
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(6), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        if (!this.$el) return;
        this.$el.style.left = `${x}px`;
        this.$el.style.top = `${y}px`;
      });
    }

    this.inputEl?.focus();
  }

  hide() {
    if (!this.$el || !this.visible) return;
    this.visible = false;
    this.$el.style.display = "none";
    // 焦点还给编辑器
    this.editor.focus();
  }

  destroy() {
    this.disposers.forEach((off) => off());
    this.disposers = [];
    this.$el?.remove();
    this.$el = null;
  }

  private async execute(instruction: string) {
    const editor = this.editor;
    // 注册/更新 command 动作后走标准执行管线（直接写入模式）
    editor.ai.registerAction({
      name: "command",
      label: "命令面板",
      mode: "insert-cursor",
      prompt: ({ before, selection, after }) =>
        `${AICommandPalette.COMMAND_PROMPT_PREFIX}${instruction}\n\n` +
        (before ? `--- 光标前文 ---\n${before}\n` : "") +
        (selection ? `--- 选区 ---\n${selection}\n` : "") +
        (after ? `--- 光标后文 ---\n${after}` : ""),
    });
    await editor.ai.runAction("command");
  }
}
