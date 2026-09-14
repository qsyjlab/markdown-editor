/**
 * 代码组 tab 切换（事件委托）。
 *
 * v1 的问题：每次渲染都往 window 上挂一个 click 监听器且永不移除。
 * 现在监听器落在容器上并返回清理函数；首个 tab 的选中态由渲染器
 * 直接输出（checked / active），不再依赖绑定时的 DOM 重置。
 */
export function bindCodeGroupsEvent(container?: HTMLElement | Document) {
  const target = container || document;

  function eventHandler(e: MouseEvent) {
    const el = e.target as HTMLInputElement;

    if (el.matches(".md-code-group-tabs input")) {
      // input <- .md-code-group-tabs <- .md-code-group
      const group = el.parentElement?.parentElement;
      if (!group) return;

      const i = Array.from(group.querySelectorAll("input")).indexOf(el);
      if (i < 0) return;

      const blocks = group.querySelector(".md-code-group-blocks");
      if (!blocks) return;

      const current = Array.from(blocks.children).find((child) =>
        child.classList.contains("active")
      );
      if (!current) return;

      const next = blocks.children[i];
      if (!next || current === next) return;

      current.classList.remove("active");
      next.classList.add("active");

      const label = group?.querySelector(`label[for="${el.id}"]`);
      label?.scrollIntoView({ block: "nearest" });
    }
  }

  target.addEventListener("click", eventHandler);

  return () => {
    target.removeEventListener("click", eventHandler);
  };
}
