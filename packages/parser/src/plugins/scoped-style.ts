import MarkdownIt from "markdown-it";

export const scopedStylePlugin = (md: MarkdownIt) => {
  md.core.ruler.push("scoped-style", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === "heading_open") {
        token.attrJoin("class", `md-${token.tag}`);
      } else if (token.type === "paragraph_open") {
        token.attrJoin("class", "md-p");
      } else if (token.type === "bullet_list_open") {
        token.attrJoin("class", "md-ul");
      } else if (token.type === "ordered_list_open") {
        token.attrJoin("class", "md-ol");
      } else if (token.type === "list_item_open") {
        token.attrJoin("class", "md-li");
      } else if (token.type === "table_open") {
        token.attrJoin("class", "md-table");
      } else if (token.type === "thead_open") {
        token.attrJoin("class", "md-thead");
      } else if (token.type === "tbody_open") {
        token.attrJoin("class", "md-tbody");
      } else if (token.type === "tr_open") {
        token.attrJoin("class", "md-tr");
      } else if (token.type === "th_open") {
        token.attrJoin("class", "md-th");
      } else if (token.type === "td_open") {
        token.attrJoin("class", "md-td");
      } else if (token.type === "blockquote_open") {
        token.attrJoin("class", "md-blockquote");
      } else if (token.type === "hr") {
        token.attrJoin("class", "md-hr");
      } else if (token.type === "link_open") {
        token.attrJoin("class", "md-a");
      } else if (token.type === "image") {
        token.attrJoin("class", "md-img");
      } else if (token.type === "code_block" || token.type === "fence") {
        token.attrJoin("class", "md-code");
      } else if (token.type === "code_inline") {
         token.attrJoin("class", "md-code");
      }
    }
  });
};
