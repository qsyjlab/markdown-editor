import { createMarkdownParser, MarkdownParserProps } from "./src/markdown-parser";


export * from './src/events'

export function createParser(props?: Partial<MarkdownParserProps>) {
  return createMarkdownParser(props);
}
