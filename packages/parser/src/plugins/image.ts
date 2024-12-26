import type MarkdownIt from "markdown-it";

export interface Options {
  lazyLoading?: boolean;
}

export function imagePlugin(md: MarkdownIt, options: Options = {}){
  const { lazyLoading = true } = options;

  const imageRule = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    let url = token.attrGet("src");
    if (lazyLoading && url) {

      token.attrSet("loading", "lazy");
      token.attrSet('data-src',  url)
      token.attrSet('src',  '')
    }
    return `<span class="image-block">${imageRule(tokens, idx, options, env, self)}</span>`
  };
};
