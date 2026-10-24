import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { MarkdownEditor } from "../editor";

/**
 * AI 选区浮动菜单：选中文本时在选区上方浮现 AI 动作条。
 * - 仅在已注入 provider 且编辑器聚焦时出现；
 * - 动作列表实时取自 editor.ai（自定义动作自动出现）；
 * - floating-ui 定位，自动翻转/避让屏幕边缘。
 */
export class AISelectionMenu {
  private $el: HTMLElement | null = null;

  private visible = false;

  private editor: MarkdownEditor;

  constructor(editor: MarkdownEditor) {
    this.editor = editor;

    const $el = document.createElement("div");
    $el.classList.add("md-editor-ai-menu");
    $el.style.display = "none";
    // 挂在编辑器容器下以继承 [md-theme] 主题作用域；fixed 定位不受影响
    (editor.editorContainer ?? document.body).appendChild($el);
    this.$el = $el;

    document.addEventListener("selectionchange", this.onSelectionChange);
  }

  private onSelectionChange = () => {
    const view = this.editor.editorManager.instance;
    if (!view || !view.hasFocus) {
      this.hide();
      return;
    }

    const selection = view.state.selection.main;
    if (selection.empty || !this.editor.ai.hasProvider) {
      this.hide();
      return;
    }

    this.show(selection.from, selection.to);
  };

  private async show(from: number, to: number) {
    const view = this.editor.editorManager.instance;
    const $el = this.$el;
    if (!view || !$el) return;

    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    if (!start || !end) return;

    const rect = {
      left: Math.min(start.left, end.left),
      right: Math.max(start.right ?? start.left, end.right ?? end.left),
      top: Math.min(start.top, end.top),
      bottom: Math.max(start.bottom ?? start.top, end.bottom ?? end.bottom),
    };

    this.renderActions();
    $el.style.display = "flex";

    const reference = {
      getBoundingClientRect: () => rect as DOMRect,
      getClientRects: () => [] as DOMRect[],
    };

    const { x, y } = await computePosition(reference, $el, {
      placement: "top-start",
      strategy: "fixed",
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    });

    // 定位完成前不可见，避免闪烁
    $el.style.left = `${x}px`;
    $el.style.top = `${y}px`;
    this.visible = true;
  }

  hide() {
    if (!this.$el || !this.visible) return;
    this.visible = false;
    this.$el.style.display = "none";
  }

  destroy() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
    this.$el?.remove();
    this.$el = null;
  }

  private renderActions() {
    const $el = this.$el;
    if (!$el) return;

    $el.textContent = "";
    const title = document.createElement("span");
    title.classList.add("md-editor-ai-menu__label");
    title.textContent = "AI";
    $el.appendChild(title);

    for (const action of this.editor.ai.getActions()) {
      const btn = document.createElement("span");
      btn.classList.add("md-editor-ai-menu__action");
      btn.setAttribute("role", "button");
      btn.textContent = action.label;

      if (!this.editor.ai.isActionEnabled(action.name)) {
        btn.classList.add("is-disabled");
      } else {
        btn.addEventListener("mousedown", (e) => {
          // mousedown 防止先触发编辑器 blur/选区丢失
          e.preventDefault();
          this.hide();
          this.editor.ai.runAction(action.name);
        });
      }

      $el.appendChild(btn);
    }
  }
}
