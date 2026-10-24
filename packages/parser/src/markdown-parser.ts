import MarkdownIt from "markdown-it";
import attrsPlugin from "markdown-it-attrs";

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
   * 返回结果附带与上一次调用相比的变化区间，供 BlockPatcher 做局部 DOM 更新
   */
  parseIncremental(text: string): IncrementalResult;

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

  // 上一次增量解析的块指纹，用于计算变化区间
  let prevHashes: string[] = [];

  function parse(text: string) {
    return instance.render(text);
  }

  const destroy = () => {
    store.clear();
    prevHashes = [];
    dispose();
  };

  function parseIncremental(text: string): IncrementalResult {
    const sources = splitMarkdownBlocks(text);
    const hashes = sources.map(hashBlock);
    const blocks = sources.map((source, index) => ({
      index,
      hash: hashes[index],
      html: store.renderBlock(source),
    }));

    const { changedFrom, changedTo, removedTo } = diffBlocks(prevHashes, hashes);

    prevHashes = hashes;
    return {
      html: blocks.map((b) => b.html).join("\n"),
      blocks,
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
