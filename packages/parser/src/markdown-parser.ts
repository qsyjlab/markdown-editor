import MarkdownIt from "markdown-it";
import attrsPlugin from "markdown-it-attrs";
import footnotePlugin from "markdown-it-footnote";
import subPlugin from "markdown-it-sub";
import supPlugin from "markdown-it-sup";
import markPlugin from "markdown-it-mark";
import katexPlugin, {
  type MarkdownKatexOptions,
} from "@vscode/markdown-it-katex";

import { createHighlighter, HighlighterProps } from "./highlight";
import { BlockStore, IncrementalResult, diffBlocks, hashBlock, splitMarkdownBlocks } from "./block";
import { StreamingRenderer } from "./streaming";
import {
  preWrapperPlugin,
  linkPlugin,
  lineNumberPlugin,
  createContainerPlugin,
  createAnchorPlugin,
  imagePlugin,
  tablePlugin,
  listPlugin,
  sourceLinePlugin,
  scopedStylePlugin,
} from "./plugins";

import {
  headersPlugin,
  type HeadersPluginOptions,
} from "@mdit-vue/plugin-headers";

import { ContainerOptions } from "./plugins/container";
import { slugify } from "./plugins/utils";
import { anchorLevel } from "./constant";
import { createTasksPlugin } from "./plugins/tasks";
import { mermaidPlugin } from "./plugins/mermaid";

export interface MarkdownParserProps {
  languages?: HighlighterProps["languages"];

  languageAlias?: HighlighterProps["languageAlias"];

  theme?: HighlighterProps["theme"];

  enableLineNumber?: boolean;

  /**
   * 自定义文本块配置
   */
  container?: ContainerOptions;

  /**
   * 数学公式渲染（KaTeX）。
   * 注意：KaTeX 样式（katex/dist/katex.min.css）由宿主自行引入。
   */
  math?: boolean | MarkdownKatexOptions;

  /**
   * Mermaid 图表：```mermaid 围栏渲染为图表占位块，预览侧自动 hydrate。
   * mermaid 为 optional peer 依赖，宿主未安装时优雅降级为源码展示。
   */
  mermaid?: boolean;

  /**
   * 扩展语法：脚注（[^1]）、下标（~x~）、上标（^x^）、高亮标记（==x==）。
   * true 时全部启用，也可按需单独开关。
   */
  extraMarks?: boolean | { footnote?: boolean; sub?: boolean; sup?: boolean; mark?: boolean };

  /**
   *  codeCopyButtonTitle
   */
  codeCopyButtonTitle?: string;

  /**
   * 块渲染 LRU 缓存容量
   * @default 512
   */
  blockCacheSize?: number;

  /**
   * 回调 markdown实例，可以自定义扩展
   */
  extend?: (md: MarkdownIt) => void;
}

export interface MarkdownParser {
  /** 全量解析：语义与逐字符 markdown-it 完全一致，无缓存 */
  parse(text: string): string;

  /**
   * 块级增量解析：只渲染内容发生变化的块（LRU 缓存），
   * 返回变化区间与块指纹。无状态：prevHashes 由消费方持有并传回。
   */
  parseIncremental(text: string, prevHashes?: string[]): IncrementalResult;

  /** 创建流式渲染会话（AI 逐 chunk 输出场景） */
  createStreamingSession(): StreamingRenderer;

  /** markdown-it 实例，可用于运行时扩展 */
  readonly md: MarkdownIt;

  clearCache(): void;

  destroy(): void;
}

export async function createMarkdownParser(
  props?: MarkdownParserProps
): Promise<MarkdownParser> {
  const { highlight, dispose } = await createHighlighter({
    languageAlias: props?.languageAlias,
    languages: props?.languages,
    theme: props?.theme,
  });

  const instance: MarkdownIt = new MarkdownIt({
    highlight,
  });

  instance.use(preWrapperPlugin, {
    codeCopyButtonTitle: "copy",
  });

  // 需在 preWrapper 之后包裹 fence：mermaid 块绕过代码块包装
  if (props?.mermaid) {
    instance.use(mermaidPlugin);
  }

  instance.use(linkPlugin);
  // 行号
  instance.use(lineNumberPlugin, props?.enableLineNumber);

  instance.use(
    createContainerPlugin,
    {},
    props?.container || {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    }
  );

  instance.use(attrsPlugin);

  if (props?.extraMarks) {
    const marks =
      typeof props.extraMarks === "object"
        ? { footnote: true, sub: true, sup: true, mark: true, ...props.extraMarks }
        : { footnote: true, sub: true, sup: true, mark: true };
    if (marks.footnote) instance.use(footnotePlugin);
    if (marks.sub) instance.use(subPlugin);
    if (marks.sup) instance.use(supPlugin);
    if (marks.mark) instance.use(markPlugin);
  }

  if (props?.math) {
    instance.use(
      katexPlugin,
      typeof props.math === "object"
        ? { enableFencedBlocks: true, ...props.math }
        : { enableFencedBlocks: true }
    );
  }

  instance.use(...createAnchorPlugin());
  instance.use(headersPlugin, {
    level: anchorLevel,
    slugify,
  } as HeadersPluginOptions);
  instance.use(imagePlugin);
  instance.use(createTasksPlugin);
  instance.use(tablePlugin);
  instance.use(listPlugin);
  instance.use(sourceLinePlugin);
  instance.use(scopedStylePlugin);

  props?.extend?.(instance);

  const store = new BlockStore(
    (source) => instance.render(source),
    props?.blockCacheSize
  );

  function parse(text: string) {
    return instance.render(text);
  }

  const destroy = () => {
    store.clear();
    dispose();
  };

  /**
   * 块级增量解析（无状态纯函数）：diff 基准由消费方持有并在下次调用时传回，
   * 避免多个消费方（编辑器预览、流式会话）共享 parser 时互相污染 diff 状态。
   */
  function parseIncremental(text: string, prevHashes: string[] = []): IncrementalResult {
    const sources = splitMarkdownBlocks(text);
    const hashes = sources.map(hashBlock);
    const blocks = sources.map((source, index) => ({
      index,
      hash: hashes[index],
      html: store.renderBlock(source),
    }));

    const { changedFrom, changedTo, removedTo } = diffBlocks(prevHashes, hashes);

    return {
      html: blocks.map((b) => b.html).join("\n"),
      blocks,
      hashes,
      changedFrom,
      changedTo,
      removedTo,
    };
  }

  return {
    parse,
    parseIncremental,
    createStreamingSession: () => new StreamingRenderer((source) => store.renderBlock(source)),
    md: instance,
    clearCache: () => store.clear(),
    destroy,
  };
}
