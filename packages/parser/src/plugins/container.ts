import MarkdownIt, { Options, Renderer, Token } from "markdown-it";
import container from "markdown-it-container";
import { nanoid } from "nanoid";
import { extractTitle } from "./utils";

export type RenderRule = (tokens: Token[], idx: number, options: Options, env: any, self: Renderer) => string;

export interface ContainerOptions {
  infoLabel?: string;
  noteLabel?: string;
  tipLabel?: string;
  warningLabel?: string;
  dangerLabel?: string;
  detailsLabel?: string;
  importantLabel?: string;
  cautionLabel?: string;
}

export function createContainerPlugin(
  md: MarkdownIt,
  options: Options,
  containerOptions?: ContainerOptions
) {
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
    )
    .use(
      ...createContainer(
        "important",
        containerOptions?.importantLabel || "Important",
        md
      )
    ).use(
      ...createContainer(
        "note",
        containerOptions?.noteLabel || "Note",
        md
      )
    ).use(
      ...createContainer(
        "caution",
        containerOptions?.cautionLabel || "Caution",
        md
      )
    ).use(...createCodeGroup(md))


    
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




function createCodeGroup(md: MarkdownIt): ContainerArgs {
  return [
    container,
    'code-group',
    {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          const name = nanoid(5)
          let tabs = ''
          let checked = 'checked'

          for (
            let i = idx + 1;
            !(
              tokens[i].nesting === -1 &&
              tokens[i].type === 'container_code-group_close'
            );
            ++i
          ) {
            const isHtml = tokens[i].type === 'html_block'

            if (
              (tokens[i].type === 'fence' && tokens[i].tag === 'code') ||
              isHtml
            ) {
              const title = extractTitle(
                isHtml ? tokens[i].content : tokens[i].info,
                isHtml
              )

              if (title) {
                const id = nanoid(7)
                tabs += `<input type="radio" name="group-${name}" id="tab-${id}" ${checked}><label data-title="${md.utils.escapeHtml(title)}" for="tab-${id}">${title}</label>`

                if (checked && !isHtml) tokens[i].info += ' active'
                checked = ''
              }
            }
          }

          return `<div class="md-code-group"><div class="tabs">${tabs}</div><div class="blocks">\n`
        }
        return `</div></div>\n`
      }
    }
  ]
}