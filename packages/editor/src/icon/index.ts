/**
 * 统一图标工具：24×24 网格线性图标（lucide 风格）。
 * stroke 1.75 / round 端点 / currentColor 着色，保证全部图标同密度同风格。
 * 插件只需提供 path/shape 内容，不再自带 svg 包装与色彩属性。
 */
export function generateSvg(content: string) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">` +
    `${content}</svg>`
  );
}
