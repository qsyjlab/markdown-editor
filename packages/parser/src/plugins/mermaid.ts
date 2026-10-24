import MarkdownIt from "markdown-it";

/** mermaid 运行时的最小结构约束（避免库类型依赖，宿主可传入任意版本实例） */
export interface MermaidLike {
  initialize(options: Record<string, unknown>): void;
  render(id: string, code: string): Promise<{ svg: string }>;
}

export interface HydrateMermaidOptions {
  /** 宿主自备的 mermaid 实例；缺省时动态 import("mermaid")（peer 依赖） */
  mermaid?: MermaidLike;
  /** 主题切换时传入以重新 initialize（已渲染的图不重绘） */
  theme?: "default" | "dark";
}

let mermaidId = 0;
let initializedTheme: string | null = null;

/**
 * ```mermaid 围栏 → 占位容器。
 * 渲染交给 hydrateMermaid（宿主环境有 mermaid 时），
 * 无 mermaid 时保留源码展示（优雅降级）。
 * 注册顺序：需在 preWrapperPlugin 之前包裹 fence（mermaid 块不进代码块包装）。
 */
export function mermaidPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const info = token.info.trim().split(/\s+/)[0]?.toLowerCase();
    if (info !== "mermaid") {
      return fence(...args);
    }
    const code = md.utils.escapeHtml(token.content);
    return `<div class="md-mermaid" data-mermaid-pending><pre class="md-mermaid-source"><code>${code}</code></pre></div>\n`;
  };
}

/**
 * 渲染容器内尚未处理的 mermaid 占位块（块级 patch 后调用，只处理新增块）。
 * 宿主未安装 mermaid 时静默保留源码。
 */
export async function hydrateMermaid(
  container: HTMLElement | Document,
  options: HydrateMermaidOptions = {}
) {
  const targets = Array.from(
    container.querySelectorAll<HTMLElement>(".md-mermaid[data-mermaid-pending]")
  );
  if (!targets.length) return;

  let instance = options.mermaid;
  if (!instance) {
    try {
      const mod = await import("mermaid");
      instance = mod.default as unknown as MermaidLike;
    } catch {
      // 宿主未安装 mermaid（optional peer），保留源码展示
      return;
    }
  }

  if (initializedTheme !== (options.theme ?? "default")) {
    instance.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: options.theme ?? "default",
    });
    initializedTheme = options.theme ?? "default";
  }

  for (const target of targets) {
    const source = target.querySelector("code")?.textContent ?? "";
    try {
      const { svg } = await instance.render(`md-mermaid-${++mermaidId}`, source);
      target.innerHTML = svg;
      target.removeAttribute("data-mermaid-pending");
      target.setAttribute("data-mermaid-rendered", "");
    } catch (error) {
      target.setAttribute("data-mermaid-error", "");
      console.warn("[md-editor] mermaid render failed:", error);
    }
  }
}
