/**
 * 块级增量解析：切分、哈希与渲染缓存
 *
 * 设计说明（docs/ARCHITECTURE.md §5）：
 * - 按顶层空行切块，围栏代码块内部不切块（含未闭合围栏，AI 流式输出的关键）；
 * - 引用块 / 列表项跨越单个空行时并入同一块，保证松散列表等结构的渲染正确性；
 * - 渲染缓存以块源码原文为 key（零碰撞、无需哈希比对），LRU 限量防止长会话膨胀；
 * - 已知取舍：跨块的引用式链接定义（[ref]: url）等极少用的上下文依赖结构
 *   在增量模式下退化为字面渲染，需要严格一致时使用 parse() 全量解析。
 */

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const LIST_ITEM_RE = /^ {0,3}(?:[-+*]|\d{1,9}[.)])(?:\s|$)/;
const QUOTE_RE = /^ {0,3}>/;

export interface ParsedBlock {
  index: number;
  hash: string;
  html: string;
}

export interface IncrementalResult {
  /** 拼接后的完整 HTML（兼容整体渲染的消费方） */
  html: string;
  blocks: ParsedBlock[];
  /** 新块空间：替换区间 [changedFrom, changedTo)，渲染并插入这些块 */
  changedFrom: number;
  changedTo: number;
  /** 旧块空间：被替换的旧区间 [changedFrom, removedTo)。
   *  纯删除尾部块时 changedFrom === changedTo 但 removedTo > changedFrom，
   *  必须据此移除旧 DOM，否则残留已删除内容 */
  removedTo: number;
}

/**
 * 将 markdown 源码切分为顶层块。
 * 块边界 = 不处于围栏内、且不延续列表/引用结构的空行。
 */
export function splitMarkdownBlocks(text: string): string[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let pendingBlank = false;
  let fence: string | null = null;

  const flush = () => {
    if (current.length) {
      blocks.push(current.join("\n"));
      current = [];
    }
  };

  for (const line of lines) {
    const fenceMatch = line.match(FENCE_RE);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) {
        fence = marker[0].repeat(marker.length);
      } else if (
        marker[0] === fence[0] &&
        marker.length >= fence.length &&
        !fenceMatch[2].trim()
      ) {
        fence = null;
      }
      pendingBlank = false;
      current.push(line);
      continue;
    }

    if (fence) {
      current.push(line);
      continue;
    }

    if (!line.trim()) {
      if (current.length) pendingBlank = true;
      continue;
    }

    if (pendingBlank) {
      const prev = current[current.length - 1] ?? "";
      const continues =
        (LIST_ITEM_RE.test(prev) && LIST_ITEM_RE.test(line)) ||
        (QUOTE_RE.test(prev) && QUOTE_RE.test(line));
      if (continues) {
        current.push("", line);
        pendingBlank = false;
        continue;
      }
      flush();
      pendingBlank = false;
    }

    current.push(line);
  }

  flush();
  return blocks;
}

/** 块内容指纹：内容 + 长度（用于 diff 对齐，非缓存 key） */
export function hashBlock(source: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < source.length; i++) {
    const c = source.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 + c, 0x85ebca6b);
  }
  return (
    (h1 >>> 0).toString(36) + "." + (h2 >>> 0).toString(36) + "." + source.length.toString(36)
  );
}

/**
 * 块渲染 LRU 缓存。key 为块源码原文，value 为渲染后的 HTML。
 * 命中即跳过 markdown-it 与 Shiki（代码块高亮还有 lang+code 级缓存兜底）。
 */
export class BlockStore {
  private cache = new Map<string, string>();

  constructor(
    private render: (source: string) => string,
    private capacity = 512
  ) {}

  renderBlock(source: string): string {
    const cached = this.cache.get(source);
    if (cached !== undefined) {
      // 触碰一次，保持 LRU 顺序
      this.cache.delete(source);
      this.cache.set(source, cached);
      return cached;
    }

    const html = this.render(source);
    this.cache.set(source, html);

    if (this.cache.size > this.capacity) {
      const oldest = this.cache.keys().next();
      if (!oldest.done) this.cache.delete(oldest.value);
    }
    return html;
  }

  clear() {
    this.cache.clear();
  }
}

/**
 * 对齐两次块列表：头尾双向比对哈希，返回替换区间。
 * - 新块空间：[changedFrom, changedTo) 为需要渲染插入的块
 * - 旧块空间：[changedFrom, removedTo) 为需要从 DOM 移除的旧块
 * 在文档中段编辑时，未受影响的块零成本。
 */
export function diffBlocks(
  prevHashes: string[],
  nextHashes: string[]
): { changedFrom: number; changedTo: number; removedTo: number } {
  const maxPrefix = Math.min(prevHashes.length, nextHashes.length);
  let prefix = 0;
  while (prefix < maxPrefix && prevHashes[prefix] === nextHashes[prefix]) prefix++;

  const maxSuffix = Math.min(prevHashes.length - prefix, nextHashes.length - prefix);
  let suffix = 0;
  while (
    suffix < maxSuffix &&
    prevHashes[prevHashes.length - 1 - suffix] === nextHashes[nextHashes.length - 1 - suffix]
  ) {
    suffix++;
  }

  return {
    changedFrom: prefix,
    changedTo: nextHashes.length - suffix,
    removedTo: prevHashes.length - suffix,
  };
}
