import { createMarkdownParser, MarkdownParserProps } from "./src/markdown-parser";

export function createParser(props?: Partial<MarkdownParserProps>) {
  return createMarkdownParser(props);
}
