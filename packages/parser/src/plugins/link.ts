import MarkdownIt from "markdown-it";

export function linkPlugin(md: MarkdownIt) {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    const lintType = token.attrGet("data-link-type");

    if (lintType !== "anchor") {
      token.attrSet("target", "_blank");
      token.attrSet(
        "class",
        [token.attrGet("class"), "externa-link"].filter(Boolean).join(" ")
      );
    }
    return self.renderToken(tokens, idx, options);
  };
}
