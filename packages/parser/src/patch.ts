import type { ParsedBlock } from "./block";

const BLOCK_ATTR = "data-md-block";

/**
 * 块级 DOM patch：按块替换变化的顶层节点区间，未变化块节点恒定。
 * 这是 AI 流式渲染"无闪烁"的关键 —— 已完成内容的 DOM 不被重建。
 *
 * 区间语义（与 diffBlocks 对齐）：
 * - 旧区间 [changedFrom, removedTo) 的节点被移除
 * - 新块 [changedFrom, changedTo) 渲染后插入同一位置
 * - 纯插入：removedTo === changedFrom < changedTo
 * - 纯删除：changedTo === changedFrom < removedTo
 */
export class BlockPatcher {
  /** 与 container 当前 DOM 对齐的块 → 顶层节点列表 */
  private nodeGroups: Node[][] | null = null;

  private template: HTMLTemplateElement | null = null;

  constructor(private container: HTMLElement) {}

  apply(blocks: ParsedBlock[], changedFrom: number, changedTo: number, removedTo: number) {
    const sane =
      this.nodeGroups !== null &&
      changedFrom >= 0 &&
      changedTo >= changedFrom &&
      removedTo >= changedFrom &&
      changedTo <= blocks.length &&
      removedTo <= this.nodeGroups.length;

    if (!sane) {
      this.rebuildAll(blocks);
      return;
    }

    if (changedFrom === changedTo && removedTo === changedFrom) return;

    const anchor = this.nodeGroups![removedTo]?.[0] ?? null;
    const newGroups: Node[][] = [];

    for (let i = changedFrom; i < changedTo; i++) {
      newGroups.push(this.mount(blocks[i].html, i, blocks[i].startLine ?? 0));
    }

    // 先移除旧区间节点，再插入新节点（anchor 引用的旧后继节点不受影响）
    for (let i = changedFrom; i < removedTo; i++) {
      for (const node of this.nodeGroups![i]) {
        (node as ChildNode).remove();
      }
    }

    for (const group of newGroups) {
      for (const node of group) {
        this.container.insertBefore(node, anchor);
      }
    }

    this.nodeGroups!.splice(
      changedFrom,
      removedTo - changedFrom,
      ...newGroups
    );

    // 区间长度变化时，后继块的索引标记需要修正
    if (changedTo - changedFrom !== removedTo - changedFrom) {
      for (let i = changedTo; i < this.nodeGroups!.length; i++) {
        for (const node of this.nodeGroups![i]) {
          if (node.nodeType === 1) {
            (node as Element).setAttribute(BLOCK_ATTR, String(i));
          }
        }
      }
    }
  }

  /** 丢弃 patch 状态；下次 apply 将整体重建 */
  invalidate() {
    this.nodeGroups = null;
  }

  destroy() {
    this.nodeGroups = null;
    this.template = null;
  }

  private rebuildAll(blocks: ParsedBlock[]) {
    this.container.textContent = "";
    const groups: Node[][] = [];
    for (const block of blocks) {
      groups.push(this.mount(block.html, block.index, block.startLine ?? 0));
    }
    const fragment = document.createDocumentFragment();
    for (const group of groups) {
      for (const node of group) fragment.appendChild(node);
    }
    this.container.appendChild(fragment);
    this.nodeGroups = groups;
  }

  /** 解析单块 HTML，打上块标记并修正 data-line 为全文档行号，返回未插入 DOM 的顶层节点组 */
  private mount(html: string, index: number, startLine: number): Node[] {
    if (!this.template) this.template = document.createElement("template");
    this.template.innerHTML = html;

    const group: Node[] = [];
    const nodes = Array.from(this.template.content.childNodes);
    for (const node of nodes) {
      if (node.nodeType === 1) {
        const el = node as Element;
        el.setAttribute(BLOCK_ATTR, String(index));
        // 块级独立渲染的 data-line 是块内行号，加 startLine 还原全文档行号
        el.querySelectorAll("[data-line]").forEach((lineEl) => {
          const local = parseInt(lineEl.getAttribute("data-line") || "0", 10);
          lineEl.setAttribute("data-line", String(local + startLine));
        });
        if (el.hasAttribute("data-line")) {
          const local = parseInt(el.getAttribute("data-line") || "0", 10);
          el.setAttribute("data-line", String(local + startLine));
        }
      }
      group.push(node);
    }
    return group;
  }
}
