import MarkdownIt from "markdown-it";

export function linkPlugin(md: MarkdownIt) {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    const linkType = token.attrGet("data-link-type");

    if (linkType !== "anchor") {
      token.attrSet("target", "_blank");
      token.attrJoin("class", "external-link");
    }
    return self.renderToken(tokens, idx, options);
  };
}
