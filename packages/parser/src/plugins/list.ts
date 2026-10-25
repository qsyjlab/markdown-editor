import type MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";
import type { Options, Renderer } from "markdown-it";

/** 渲染规则包装：给指定 token 加类后交给原渲染器 */
export function createClassRule(
  previousRender: Renderer.RenderRule | undefined,
  ...classes: string[]
): Renderer.RenderRule {
  return (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) => {
    const token = tokens[idx];
    for (const cls of classes) token.attrJoin("class", cls);
    return previousRender
      ? previousRender(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options);
  };
}

export const listPlugin = (md: MarkdownIt) => {
  md.renderer.rules.bullet_list_open = createClassRule(
    md.renderer.rules.bullet_list_open,
    "md-list"
  );

  md.renderer.rules.ordered_list_open = createClassRule(
    md.renderer.rules.ordered_list_open,
    "md-list"
  );

  md.renderer.rules.list_item_open = createClassRule(
    md.renderer.rules.list_item_open,
    "md-list-item"
  );
};
