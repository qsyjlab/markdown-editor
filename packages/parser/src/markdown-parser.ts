import MarkdownIt from "markdown-it";
import attrsPlugin from "markdown-it-attrs";

import { createHighlighter } from "./highlight";
import {
  preWrapperPlugin,
  linkPlugin,
  lineNumberPlugin,
  createContainerPlugin,
  createMathPlugin,
  createAnchorPlugin,
} from "./plugins";

import {
  headersPlugin,
  type HeadersPluginOptions,
} from "@mdit-vue/plugin-headers";

import { ContainerOptions } from "./plugins/container";
import { slugify } from "./plugins/utils";
import { anchorLevel } from "./constant";

export interface MarkdownParserProps {
  languages?: string[];
  enableLineNumber?: boolean;

  /**
   * 自定义文本块配置
   */
  container?: ContainerOptions;
}

export async function createMarkdownParser(props?: MarkdownParserProps) {
  const { highlight } = await createHighlighter();

  const instance: MarkdownIt = new MarkdownIt({
    highlight,
  });

  instance.use(preWrapperPlugin);
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

  instance.use(createMathPlugin);
  instance.use(attrsPlugin);
  instance.use(...createAnchorPlugin());
  instance.use(headersPlugin, {
    level: anchorLevel,
    slugify
  } as HeadersPluginOptions);

  function parse(text: string) {
    return instance.render(text);
  }

  return {
    parse,
  };
}
