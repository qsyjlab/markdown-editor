import MarkdownIt, { Options } from "markdown-it";

export function preWrapperPlugin(
  md: MarkdownIt,
  options: Options & { codeCopyButtonTitle: string }
) {
  const fence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];

    // remove title from info
    token.info = token.info.replace(/\[.*\]/, "");

    const active = / active( |$)/.test(token.info) ? " active" : "";
    token.info = token.info.replace(/ active$/, "").replace(/ active /, " ");

    const lang = extractLang(token.info);

    return (
      `<div class="language-${lang}${active} md-code-block ">` +
      `<button title="${options.codeCopyButtonTitle}" class="md-copy-btn"></button>` +
      `<span class="md-code-lang">${lang}</span>` +
      fence(...args) +
      "</div>"
    );
  };
}

function extractLang(info: string) {
  return info
    .trim()
    .replace(/=(\d*)/, "")
    .replace(/:(no-)?line-numbers({| |$|=\d*).*/, "")
    .replace(/(-vue|{| ).*$/, "")
    .replace(/^vue-html$/, "template")
    .replace(/^ansi$/, "");
}

export { linkPlugin } from "./link";
export * from "./line-number";
export * from "./container";
export * from "./anchor";
export * from './image'
export * from "./table";
export * from "./list";
export * from "./source-line";
export * from "./scoped-style";
