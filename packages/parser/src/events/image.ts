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

/**
 * handle lazy load image
 */
export function bindLazyLoadImageEvent(params: BindLazyLoadImageParams = {}) {
  const { display = "loaded", $el = document } = params;

  const imageBlocks = $el.querySelectorAll<HTMLElement>(".image-block");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target as HTMLImageElement;
        const img =
          entry.target.querySelector<HTMLImageElement>("img[loading=lazy]");
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
                img.classList?.add("loaded error");
                console.log("img.classList",img.classList)
                img.removeAttribute("loading");
              };
            }
          }
        } else {
          console.log("img.classList",img.classList)
          img.classList?.add("loaded");
          img.classList.add("error")
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
      }
    });
  });

  imageBlocks.forEach((block) => {
    observer.observe(block);
  });

  return () => {
    imageBlocks.forEach((block) => {
      observer.unobserve(block);
    });
    observer.disconnect();
  };
}
