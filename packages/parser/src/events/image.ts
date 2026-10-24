interface BindLazyLoadImageParams {
  $el?: HTMLElement | Document;

  /**
   * image load display mode
   * @default loaded
   */
  display?: "loaded" | "immediate";
  /**
   * click image
   */
  onClick?: (src: string, e: MouseEvent) => void;
}

/**
 * log image load status
 */
const loadedImageSets = new Set<string>();

export interface LazyImageBinding {
  /** 块级 patch 后调用：只观察新出现的图片块，已观察的不重复 */
  refresh(): void;
  /** 断开观察器并解绑 */
  destroy(): void;
}

/**
 * 图片懒加载 + 点击预览。
 *
 * v1 的问题：选择器是 `.image-block`，而渲染输出是 `.md-image-block`，
 * 懒加载从未真正生效；且每次渲染 new 一个 IntersectionObserver。
 */
export function bindLazyLoadImageEvent(
  params: BindLazyLoadImageParams = {}
): LazyImageBinding {
  const { display = "loaded", $el = document } = params;

  const observed = new WeakSet<Element>();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target.querySelector<HTMLImageElement>(
        "img[loading=lazy]"
      );
      if (!img) {
        observer.unobserve(entry.target);
        return;
      }
      const src = img.getAttribute("data-src");

      if (src) {
        if (display === "immediate") {
          img.src = src;
          loaded(false);
        } else if (display === "loaded") {
          img.src = src;
          img.removeAttribute("data-src");

          if (loadedImageSets.has(src)) {
            loaded(false);
          } else {
            img.onload = () => {
              loaded();
            };

            img.onerror = () => {
              img.classList?.add("loaded", "error");
              img.removeAttribute("loading");
            };
          }
        }
      } else {
        img.classList?.add("loaded", "error");
      }

      function bindClickEvent() {
        if (params.onClick) {
          img?.addEventListener("click", (e) => {
            params.onClick?.(src || "", e);
          });
        }
      }

      function loaded(anima = true) {
        if (!img || !src) return;
        loadedImageSets.add(src);

        if (anima) {
          requestAnimationFrame(() => {
            img.classList.add("loaded");
          });
        } else {
          img.classList.add("loaded");
        }

        img.removeAttribute("loading");
        bindClickEvent();
      }
    });
  });

  function refresh() {
    $el.querySelectorAll(".md-image-block").forEach((block) => {
      if (observed.has(block)) return;
      observed.add(block);
      observer.observe(block);
    });
  }

  refresh();

  return {
    refresh,
    destroy: () => {
      observer.disconnect();
    },
  };
}
