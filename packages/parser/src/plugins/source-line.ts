import MarkdownIt from "markdown-it";

export const sourceLinePlugin = (md: MarkdownIt) => {
  md.core.ruler.push("source_line", (state) => {
    state.tokens.forEach((token) => {
      if (token.map && token.type.endsWith("_open")) {
        token.attrSet("data-line", String(token.map[0]));
      }
    });
  });
};
