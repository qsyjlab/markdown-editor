import MarkdownIt from "markdown-it";

export const tablePlugin = (md: MarkdownIt) => {
  md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrJoin("class", "md-table");
    return self.renderToken(tokens, idx, options);
  };
};
