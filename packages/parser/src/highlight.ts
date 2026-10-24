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
      // 双主题时关闭行内默认色，颜色全部走 --shiki-light/--shiki-dark CSS 变量，
      // 亮暗切换由主题包 CSS 完成，无需 !important（docs/ARCHITECTURE.md §7）
      ...(typeof theme === "object" && "light" in theme && "dark" in theme
        ? { themes: theme, defaultColor: false }
        : { theme, defaultColor: true }),
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
