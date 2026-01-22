import MarkdownIt from "markdown-it";

export const tablePlugin = (md: MarkdownIt) => {
  md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrJoin("class", "md-table");
    return `<div class="md-table-container">${self.renderToken(tokens, idx, options)}`;
  };

  md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
    return `${self.renderToken(tokens, idx, options)}</div>`;
  };
};
