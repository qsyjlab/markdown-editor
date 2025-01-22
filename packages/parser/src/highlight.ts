import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationErrorLevel,
  transformerMetaHighlight,
} from "@shikijs/transformers";

import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'

import presetThemes from './preset/theme'
import presetLangs from './preset/lang'

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


  // const themes =
  //   typeof theme === "object" && "light" in theme && "dark" in theme
  //     ? [theme.light, theme.dark]
  //     : [theme];

  // const highlighter = await createShikiHighlighter({
  //   themes,
  //   langs: ["html", "css", "js", "bash", "typescript", "python", "md", "yaml"],
  //   langAlias: options?.languageAlias,
  // });

  const highlighter = await createHighlighterCore({
    themes: presetThemes,
    langs: presetLangs,
    // `shiki/wasm` contains the wasm binary inlined as base64 string.
    engine: createOnigurumaEngine(import('shiki/wasm'))
  })

  function highlight(str: string, lang: string, attrs: string) {

    lang = getRealLang(lang);


    const highlighted = highlighter.codeToHtml(str, {
      lang: lang,
      meta: { __raw: attrs },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationErrorLevel(),
        transformerMetaHighlight(),
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

function getRealLang(lang: string) {

  const vueRE = /-vue(?=:|$)/;
  const lineNoStartRE = /=(\d*)/;
  const lineNoRE = /:(no-)?line-numbers(=\d*)?$/;
  // const mustacheRE = /\{\{.*?\}\}/g;

  return (
    lang
      .replace(lineNoStartRE, "")
      .replace(lineNoRE, "")
      .replace(vueRE, "")
      .toLowerCase()
  );
}
