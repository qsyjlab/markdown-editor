import MarkdownIt from "markdown-it";

import { createHighlighter } from "./highlight";
import { preWrapperPlugin } from "./plugins";


export interface MarkdownParserProps {
  languages?: string[];
  loadLanguage?:(language: string)=>Promise<void>;
}

export async function createMarkdownParser(props?:MarkdownParserProps) {

    const { highlight } = await createHighlighter()

    const instance:MarkdownIt = new MarkdownIt({
        highlight
    })


    
    instance.use(preWrapperPlugin)

    
  function parse(text: string) {
    // if (props?.loadLanguage) {
    //   const regex = /```(\w+)\n/g;
    //   const languageMatches = [...text.matchAll(regex)];

    //   // 动态加载对应的语言模块
    //   for (const match of languageMatches) {
    //     const language = match[1];
    //     props?.loadLanguage(language);
    //   }
    // }

    return instance.render(text);
  }

  return {
    parse
  }
}
