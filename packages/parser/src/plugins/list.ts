import MarkdownIt from "markdown-it";

export const listPlugin = (md: MarkdownIt) => {
  const addClass = (
    tokens: any[],
    idx: number,
    options: any,
    env: any,
    self: any,
    previousRender: any
  ) => {
    const token = tokens[idx];
    token.attrJoin("class", "md-list");
    return previousRender(tokens, idx, options, env, self);
  };

  const previousRenderBullet =
    md.renderer.rules.bullet_list_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.bullet_list_open = (tokens, idx, options, env, self) => {
    return addClass(tokens, idx, options, env, self, previousRenderBullet);
  };

  const previousRenderOrdered =
    md.renderer.rules.ordered_list_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.ordered_list_open = (tokens, idx, options, env, self) => {
    return addClass(tokens, idx, options, env, self, previousRenderOrdered);
  };

  const addItemClass = (
    tokens: any[],
    idx: number,
    options: any,
    env: any,
    self: any,
    previousRender: any
  ) => {
    const token = tokens[idx];
    token.attrJoin("class", "md-list-item");
    return previousRender(tokens, idx, options, env, self);
  };

  const previousRenderListItem =
    md.renderer.rules.list_item_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.list_item_open = (tokens, idx, options, env, self) => {
    return addItemClass(tokens, idx, options, env, self, previousRenderListItem);
  };
};
