import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationErrorLevel,
  transformerMetaHighlight,
} from "@shikijs/transformers";

import {
  createHighlighterCore,
  enableDeprecationWarnings,
  HighlighterCoreOptions,
  createOnigurumaEngine,
  ShikiError,
} from "shiki";

import presetThemes from "./preset/theme";
import presetLangs from "./preset/lang";

export interface HighlighterProps {
  theme?: any;

  languages?: HighlighterCoreOptions["langs"];

  languageAlias?: Record<string, string>;
}

enableDeprecationWarnings(false);

export async function createHighlighter(options?: HighlighterProps) {
  const theme = options?.theme ?? {
    light: "github-light",
    dark: "github-dark",
  };

  const highlighter = await createHighlighterCore({
    themes: presetThemes,
    langs: options?.languages ? options.languages : [...presetLangs],
    engine: createOnigurumaEngine(() => import("shiki/dist/wasm.mjs")),
  });
  function highlight(str: string, lang: string, attrs: string) {
    lang = getRealLang(lang);

    // 先判断是否有这个语言
    try {
      const loadedLang = highlighter.getLanguage(lang);

      if (!loadedLang) {
        lang = "";
      }
    } catch (e) {
      console.warn((e as ShikiError).message);
      lang = "";
    }

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

  return lang
    .replace(lineNoStartRE, "")
    .replace(lineNoRE, "")
    .replace(vueRE, "")
    .toLowerCase();
}
