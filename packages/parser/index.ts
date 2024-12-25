import { createMarkdownParser, MarkdownParserProps } from "./src/markdown-parser";


export * from './src/events'

export function createParser(props?: MarkdownParserProps) {
  return createMarkdownParser(props);
}
