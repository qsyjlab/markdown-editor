/**
 * 导出自包含 HTML：把渲染 HTML + 当前页面可访问的 CSS 快照内联为单文件。
 * shiki 配色是行内样式随 HTML 自带；主题/katex 样式来自运行中的 <style>/<link>。
 */
export interface ExportHtmlOptions {
  title?: string;
  /** 额外内联的 CSS 文本 */
  extraCss?: string;
  /** 内容容器类名（默认沿用预览容器，保证样式作用一致） */
  bodyClass?: string;
}

/** 收集当前文档可读取的内联与同源样式文本（跨域样式跳过） */
export function captureDocumentCss(): string {
  const parts: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      // 跨域样式表读取 cssRules 会抛错，跳过
      for (const rule of Array.from(sheet.cssRules)) {
        parts.push(rule.cssText);
      }
    } catch {
      /* cross-origin stylesheet, skip */
    }
  }

  for (const style of Array.from(document.querySelectorAll("style"))) {
    if (style.textContent) parts.push(style.textContent);
  }

  return parts.join("\n");
}

/** 组装完整 HTML 文档字符串 */
export function exportHtml(html: string, options: ExportHtmlOptions = {}) {
  const { title = "Markdown 导出", extraCss = "", bodyClass = "md-editor-preview-body" } = options;

  const css = captureDocumentCss();

  return [
    "<!DOCTYPE html>",
    '<html lang="zh-CN">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    `<style>${css}</style>`,
    extraCss ? `<style>${extraCss}</style>` : "",
    "</head>",
    `<body class="${bodyClass}">`,
    html,
    "</body>",
    "</html>",
  ]
    .filter(Boolean)
    .join("\n");
}

/** 触发浏览器下载导出的 HTML 文件 */
export function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
