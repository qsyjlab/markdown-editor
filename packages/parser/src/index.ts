import { createMarkdownParser } from "./markdown-parser";

export { createMarkdownParser };
export { splitMarkdownBlocks, hashBlock, BlockStore, diffBlocks } from "./block";
export { StreamingRenderer } from "./streaming";
export { BlockPatcher } from "./patch";
export { hydrateMermaid } from "./plugins/mermaid";
export type { MermaidLike, HydrateMermaidOptions } from "./plugins/mermaid";
export type { ParsedBlock, IncrementalResult } from "./block";
export type { MarkdownParser, MarkdownParserProps } from "./markdown-parser";
export type { HighlighterProps } from "./highlight";
export type { PreviewEventsBinding, PreviewEventsOptions } from "./events";

export type MarkdownParserReturn = Awaited<ReturnType<typeof createMarkdownParser>>

export * from './events'
