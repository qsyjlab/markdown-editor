import MarkdownIt from "markdown-it"



export interface Options {
    /**
     * Support native lazy loading for the `<img>` tag.
     *  <img src="xxx" => <img data-src="xxx" loading="lazy""
     * 
     * @default false
     */
    lazyLoading?: boolean
  }
  
  export function imagePlugin (md: MarkdownIt, options?: Options){

    const { lazyLoading = true } = options || {}

    const imageRenderRule = md.renderer.rules.image!
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx]
      let url = token.attrGet('src')

      if (url) {
        token.attrSet('data-src', decodeURIComponent(url))
        token.attrSet('src', '')
      }
      if (lazyLoading) {
        token.attrSet('loading', 'lazy')
      }

      return  (
        `<span class="md-image">` +
        imageRenderRule(tokens, idx, options, env, self) +
        "</span>"
      );
    }
  }
