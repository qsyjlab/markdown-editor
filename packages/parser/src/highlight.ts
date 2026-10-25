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

/** 主题：单主题名 / 单主题对象 / 亮暗双主题名 */
export type HighlighterTheme =
  | string
  | HighlighterCoreOptions["themes"]
  | { light: string; dark: string };

export interface HighlighterProps {
  theme?: HighlighterTheme;

  languages?: HighlighterCoreOptions["langs"];

  languageAlias?: Record<string, string>;
}

enableDeprecationWarnings(false);

/** 代码高亮 LRU 容量：文档中未变更的代码块不会重复高亮 */
const HIGHLIGHT_CACHE_MAX = 200;

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

  const cache = new Map<string, string>();

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

    const cacheKey = `${lang}\u0000${attrs}\u0000${str}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      cache.delete(cacheKey);
      cache.set(cacheKey, cached);
      return cached;
    }

    const transformers = [
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationWordHighlight(),
      transformerNotationErrorLevel(),
      transformerMetaHighlight(),
    ];

    const highlighted = isDualTheme(theme)
      ? highlighter.codeToHtml(str, {
          lang: lang,
          meta: { __raw: attrs },
          transformers,
          // 双主题时关闭行内默认色，颜色全部走 --shiki-light/--shiki-dark CSS 变量，
          // 亮暗切换由主题包 CSS 完成，无需 !important（docs/ARCHITECTURE.md §7）
          themes: { light: theme.light, dark: theme.dark },
          defaultColor: false,
        })
      : highlighter.codeToHtml(str, {
          lang: lang,
          meta: { __raw: attrs },
          transformers,
          theme: theme as string,
        });

    cache.set(cacheKey, highlighted);
    if (cache.size > HIGHLIGHT_CACHE_MAX) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }

    return highlighted;
  }

  return {
    highlight,
    dispose: () => {
      cache.clear();
      highlighter.dispose();
    },
  };
}

/** 亮暗双主题形态判定 */
function isDualTheme(
  theme: HighlighterTheme
): theme is { light: string; dark: string } {
  return (
    typeof theme === "object" &&
    !Array.isArray(theme) &&
    "light" in theme &&
    "dark" in theme
  );
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
