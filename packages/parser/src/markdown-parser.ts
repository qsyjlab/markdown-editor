import MarkdownIt from "markdown-it";

import { createHighlighter } from "./highlight";
import {
  preWrapperPlugin,
  linkPlugin,
  lineNumberPlugin,
  createContainerPlugin,
} from "./plugins";
import { ContainerOptions } from "./plugins/container";

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

  function parse(text: string) {
    return instance.render(text);
  }

  return {
    parse,
  };
}
