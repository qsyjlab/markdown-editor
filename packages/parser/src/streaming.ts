import { ParsedBlock, splitMarkdownBlocks, hashBlock, diffBlocks } from "./block";

/** 一次流式更新引起的变化区间（新块插入 [from,to)，旧块移除 [from,removedTo)） */
export interface StreamingChangeRange {
  changedFrom: number;
  changedTo: number;
  removedTo: number;
}

/**
 * 流式渲染会话：面向 AI 逐 chunk 输出。
 *
 * - append(delta)：源码追加，只重渲染"进行中的最后一块"（未闭合围栏始终是活动块）；
 * - setText(full)：整段替换，内部走块 diff（头尾对齐），适合重置/回滚场景；
 * - 已完成块的 HTML 由 BlockStore 缓存冻结，DOM 侧配合 BlockPatcher 保持节点稳定。
 */
export class StreamingRenderer {
  private text = "";
  private sources: string[] = [];
  private hashes: string[] = [];
  private rendered: string[] = [];

  constructor(private renderBlock: (source: string) => string) {}

  append(chunk: string): StreamingChangeRange {
    this.text += chunk;
    return this.update();
  }

  setText(text: string): StreamingChangeRange {
    this.text = text;
    return this.update();
  }

  getBlocks(): ParsedBlock[] {
    return this.sources.map((source, index) => ({
      index,
      hash: this.hashes[index],
      html: this.rendered[index],
    }));
  }

  getHtml(): string {
    return this.rendered.join("\n");
  }

  getText(): string {
    return this.text;
  }

  reset(): void {
    this.text = "";
    this.sources = [];
    this.hashes = [];
    this.rendered = [];
  }

  private update(): StreamingChangeRange {
    const nextSources = splitMarkdownBlocks(this.text);
    const nextHashes = nextSources.map(hashBlock);
    const { changedFrom, changedTo, removedTo } = diffBlocks(this.hashes, nextHashes);

    const nextRendered: string[] = new Array(nextSources.length);

    for (let i = 0; i < nextSources.length; i++) {
      if (i < changedFrom) {
        nextRendered[i] = this.rendered[i];
      } else if (i >= changedTo) {
        // 尾部对齐区：新块 i 对应旧块 (旧数量 - (新数量 - i))
        nextRendered[i] = this.rendered[this.rendered.length - (nextSources.length - i)];
      } else {
        nextRendered[i] = this.renderBlock(nextSources[i]);
      }
    }

    this.sources = nextSources;
    this.hashes = nextHashes;
    this.rendered = nextRendered;

    return { changedFrom, changedTo, removedTo };
  }
}
