import MarkdownIt, { Options } from "markdown-it";
import container from "markdown-it-container";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

export interface ContainerOptions {
  infoLabel?: string;
  // noteLabel?: string;
  tipLabel?: string;
  warningLabel?: string;
  dangerLabel?: string;
  detailsLabel?: string;
  // importantLabel?: string;
  // cautionLabel?: string;
}

export function createContainerPlugin(
  md: MarkdownIt,
  options: Options,
  containerOptions?: ContainerOptions
) {
  debugger
  md.use(...createContainer("tip", containerOptions?.tipLabel || "TIP", md))
    .use(...createContainer("info", containerOptions?.infoLabel || "INFO", md))
    .use(
      ...createContainer(
        "warning",
        containerOptions?.warningLabel || "WARNING",
        md
      )
    )
    .use(
      ...createContainer(
        "danger",
        containerOptions?.dangerLabel || "DANGER",
        md
      )
    )
    .use(
      ...createContainer(
        "details",
        containerOptions?.detailsLabel || "Details",
        md
      )
    );
}

type ContainerArgs = [typeof container, string, { render: RenderRule }];

function createContainer(
  klass: string,
  defaultTitle: string,
  md: MarkdownIt
): ContainerArgs {
  return [
    container,
    klass,
    {
      render(tokens, idx, _options) {
        const token = tokens[idx];
        const info = token.info.trim().slice(klass.length).trim();
        const attrs = md.renderer.renderAttrs(token);
        if (token.nesting === 1) {
          const title = md.renderInline(info || defaultTitle, {});
          if (klass === "details")
            return `<details class="${klass} custom-block"${attrs}><summary>${title}</summary>\n`;
          return `<div class="${klass} custom-block"${attrs}><p class="custom-block-title">${title}</p>\n`;
        } else return klass === "details" ? `</details>\n` : `</div>\n`;
      },
    },
  ];
}
