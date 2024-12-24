import { createHighlighter as createShikiHighlighter } from "shiki";

import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationErrorLevel
} from '@shikijs/transformers'


interface HighlighterProps {
  theme?: any;

  languages?: string[];

  languageAlias?: Record<string, string>;
}

export async function createHighlighter(options?: HighlighterProps) {
  // const { theme = ["github-light", "github-dark"] } = options || {};
  const theme = options?.theme ?? {
    light: "github-light",
    dark: "github-dark",
  };

  const themes =
    typeof theme === "object" && "light" in theme && "dark" in theme
      ? [theme.light, theme.dark]
      : [theme];

  const highlighter = await createShikiHighlighter({
    themes,
    langs: ["html", "css", "js", "bash", "typescript", "python"],

    langAlias: options?.languageAlias,
  });

  function highlight(str: string, lang: string, attrs: string) {
    const highlighted = highlighter.codeToHtml(str, {
      lang: lang,
      meta: { __raw: attrs },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationErrorLevel()
      ],
      ...(typeof theme === "object" && "light" in theme && "dark" in theme
        ? { themes: theme, defaultColor: false }
        : { theme, defaultColor: true }),
    });

    return highlighted;
  }

  return {
    highlight,
    dispose: highlighter.dispose,
  };
}
