import type { MarkdownEditor } from "../editor";
import { collapseDiff } from "./diff";

/**
 * AI 建议栏：asSuggestion 模式产生的建议以行级 diff 预览展示，
 * 用户逐条接受（写入并进撤销历史）或拒绝。
 * 监听 aiSuggestion / aiSuggestionAccept / Reject / Expire 事件自维护，
 * 宿主无需手动刷新。
 */
export class AISuggestionBar {
  private $el: HTMLElement | null = null;

  private editor: MarkdownEditor;

  private disposers: Array<() => void> = [];

  constructor(editor: MarkdownEditor) {
    this.editor = editor;

    const $el = document.createElement("div");
    $el.classList.add("md-editor-suggestions");
    // 挂编辑器容器内（相对定位），继承 [md-theme]
    editor.editorContainer?.appendChild($el);
    this.$el = $el;

    this.disposers.push(
      editor.on("aiSuggestion", () => this.render()),
      editor.on("aiSuggestionAccept", () => this.render()),
      editor.on("aiSuggestionReject", () => this.render()),
      editor.on("aiSuggestionExpire", () => this.render())
    );
  }

  destroy() {
    this.disposers.forEach((off) => off());
    this.disposers = [];
    this.$el?.remove();
    this.$el = null;
  }

  private render() {
    const $el = this.$el;
    if (!$el) return;

    $el.textContent = "";
    const suggestions = this.editor.ai.getSuggestions();
    if (!suggestions.length) {
      $el.style.display = "none";
      return;
    }
    $el.style.display = "flex";

    for (const suggestion of suggestions) {
      const item = document.createElement("div");
      item.classList.add("md-editor-suggestion");
      item.setAttribute("data-suggestion-id", suggestion.id);

      const head = document.createElement("div");
      head.classList.add("md-editor-suggestion__head");

      const label = document.createElement("span");
      label.classList.add("md-editor-suggestion__label");
      label.textContent =
        this.editor.ai.getActions().find((a) => a.name === suggestion.action)?.label ??
        suggestion.action;
      head.appendChild(label);

      const actions = document.createElement("span");
      actions.classList.add("md-editor-suggestion__actions");

      const accept = document.createElement("span");
      accept.classList.add("md-editor-suggestion__btn", "is-accept");
      accept.setAttribute("role", "button");
      accept.textContent = "接受";
      accept.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.editor.ai.acceptSuggestion(suggestion.id);
      });
      actions.appendChild(accept);

      const reject = document.createElement("span");
      reject.classList.add("md-editor-suggestion__btn", "is-reject");
      reject.setAttribute("role", "button");
      reject.textContent = "拒绝";
      reject.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.editor.ai.rejectSuggestion(suggestion.id);
      });
      actions.appendChild(reject);

      head.appendChild(actions);
      item.appendChild(head);

      const diffWrap = document.createElement("div");
      diffWrap.classList.add("md-editor-suggestion__diff");
      for (const line of collapseDiff(suggestion.diff, 1)) {
        const lineEl = document.createElement("div");
        lineEl.classList.add("md-editor-suggestion__line", `is-${line.type}`);
        lineEl.textContent = line.text || " ";
        diffWrap.appendChild(lineEl);
      }
      item.appendChild(diffWrap);

      $el.appendChild(item);
    }
  }
}
