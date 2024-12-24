import MarkdownIt from "markdown-it";

import { createHighlighter } from "./highlight";
import { preWrapperPlugin, linkPlugin,lineNumberPlugin } from "./plugins";

export interface MarkdownParserProps {
  languages?: string[];
  loadLanguage?: (language: string) => Promise<void>;
}

export async function createMarkdownParser(props?: MarkdownParserProps) {
  const { highlight } = await createHighlighter();

  const instance: MarkdownIt = new MarkdownIt({
    highlight,
  });

  instance.use(preWrapperPlugin);
  instance.use(linkPlugin);
  // 行号
  instance.use(lineNumberPlugin,false)

  function parse(text: string) {
    return instance.render(text);
  }

  return {
    parse,
  };
}
