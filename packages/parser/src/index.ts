import { createMarkdownParser, } from "./markdown-parser";

export { createMarkdownParser };

export type { MarkdownParserProps } from './markdown-parser'
export type { HighlighterProps } from './highlight'
export type MarkdownParserReturn = Awaited<ReturnType<typeof createMarkdownParser>>

export * from './events'

