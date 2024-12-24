import MarkdownIt, { Options } from "markdown-it";


export function preWrapperPlugin(md: MarkdownIt, options: Options) {
  const fence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];

    // remove title from info
    token.info = token.info.replace(/\[.*\]/, "");

    const active = / active( |$)/.test(token.info) ? " active" : "";
    token.info = token.info.replace(/ active$/, "").replace(/ active /, " ");

    const lang = extractLang(token.info);
    
    // `<button title="${options.codeCopyButtonTitle}" class="copy"></button>` +
    return (
      `<div class="code language-${lang}${active}">` +
      `<span class="lang">${lang}</span>` +
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

export { linkPlugin } from './link'
export * from './line-number'