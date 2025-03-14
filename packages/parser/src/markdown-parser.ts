import MarkdownIt from "markdown-it";
import attrsPlugin from "markdown-it-attrs";

import { createHighlighter, HighlighterProps } from "./highlight";
import {
  preWrapperPlugin,
  linkPlugin,
  lineNumberPlugin,
  createContainerPlugin,
  createAnchorPlugin,
  imagePlugin,
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
   * 回调 markdown实例，可以自定义扩展
   */
  extend?: (md: MarkdownIt) => void;
}

export async function createMarkdownParser(props?: MarkdownParserProps) {
  const { highlight, dispose } = await createHighlighter({
    languageAlias: props?.languageAlias,
    languages: props?.languages,
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

  // instance.use(createMathPlugin);
  instance.use(attrsPlugin);
  instance.use(...createAnchorPlugin());
  instance.use(headersPlugin, {
    level: anchorLevel,
    slugify,
  } as HeadersPluginOptions);
  instance.use(imagePlugin);
  instance.use(createTasksPlugin);

  props?.extend?.(instance);


  function parse(text: string) {
    return instance.render(text);
  }

  return {
    parse,
    destory: () => {
      dispose();
    },
  };
}
