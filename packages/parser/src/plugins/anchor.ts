import anchorPlugin from "markdown-it-anchor";
import { slugify } from "./utils";
import { anchorLevel } from "../constant";

export function createAnchorPlugin(): [
  typeof anchorPlugin,
  anchorPlugin.AnchorOptions
] {
  const options: anchorPlugin.AnchorOptions = {
    permalink: anchorPlugin.permalink.linkInsideHeader({
      symbol: "&ZeroWidthSpace;",
      renderAttrs: () => {
        return {
          'data-link-type': 'anchor'
        };
      },
    }),
    level: anchorLevel,
    slugify,
  };

  return [anchorPlugin, options];
}
