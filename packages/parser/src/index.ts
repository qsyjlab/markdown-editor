import { createMarkdownParser, MarkdownParserProps } from "./markdown-parser";

export function createParser(props?: MarkdownParserProps) {
  return createMarkdownParser(props);
}

export { createMarkdownParser };
export * from './events'

