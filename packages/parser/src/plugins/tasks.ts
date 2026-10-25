import type MarkdownIt from "markdown-it";
import type { Options, Renderer, Token } from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";

export function createTasksPlugin(md: MarkdownIt) {
  md.use(markdownItTaskLists, { label: true, labelAfter: true });

  // 包装 task-lists 装好后的规则（checkbox 渲染依赖其原规则），
  // 在其产出的 contains-task-list 类基础上补 md-task-list
  const wrapTaskListRule = (
    previous: Renderer.RenderRule | undefined
  ): Renderer.RenderRule =>
    function (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) {
      const token = tokens[idx];
      const classes = token.attrGet("class") || "";
      if (classes.includes("contains-task-list")) {
        token.attrJoin("class", "md-task-list");
      }
      return previous
        ? previous(tokens, idx, options, env, self)
        : self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.bullet_list_open = wrapTaskListRule(
    md.renderer.rules.bullet_list_open
  );
  md.renderer.rules.ordered_list_open = wrapTaskListRule(
    md.renderer.rules.ordered_list_open
  );
}
