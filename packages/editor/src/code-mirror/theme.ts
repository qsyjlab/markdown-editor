import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

/**
 * 自定义高亮样式
 * 通过 class 映射，配合 CSS 变量实现主题切换
 */
export const markdownHighlightStyle = HighlightStyle.define([
  { tag: tags.link, class: "cm-md-link-text" },
  { tag: tags.url, class: "cm-md-link-url" },
  { tag: tags.heading, fontWeight: "bold" },
]);

export const markdownTheme = syntaxHighlighting(markdownHighlightStyle);
