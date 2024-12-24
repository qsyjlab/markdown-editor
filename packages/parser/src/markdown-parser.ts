import MarkdownIt from "markdown-it";

import { createHighlighter } from "./highlight";
import { preWrapperPlugin, linkPlugin, lineNumberPlugin } from "./plugins";

export interface MarkdownParserProps {
  languages?: string[];
  enableLineNumber?: boolean;
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

  function parse(text: string) {
    return instance.render(text);
  }

  return {
    parse,
  };
}
