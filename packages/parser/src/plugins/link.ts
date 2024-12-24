import MarkdownIt from "markdown-it";

export function linkPlugin(
  md: MarkdownIt,
) {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    token.attrSet("target", "_blank");
    
    return self.renderToken(tokens, idx, options);
  };


}
