import MarkdownIt from "markdown-it";
import mathPlugin from "markdown-it-mathjax3";

/**
 *
 * math plugin
 */
export function createMathPlugin(md: MarkdownIt) {
  md.use(mathPlugin.default ?? mathPlugin, {});
  const orig = md.renderer.rules.math_block!;
  md.renderer.rules.math_block = (tokens, idx, options, env, self) => {
    return orig(tokens, idx, options, env, self).replace(
      /^<mjx-container /,
      '<mjx-container tabindex="0" '
    );
  };
}
