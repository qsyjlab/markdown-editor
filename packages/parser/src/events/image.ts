interface BindLazyLoadImageParams {
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
 * handle lazy load image
 */
export function bindLazyLoadImageEvent(params: BindLazyLoadImageParams = {}) {
  const { display = "loaded" } = params;

  const imageBlocks = document.querySelectorAll<HTMLElement>(".image-block");

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
            img.removeAttribute("data-src");
            img.removeAttribute("loading");
            bindClickEvent();
          } else if (display === "loaded") {
            img.src = src;
            img.removeAttribute("data-src");
          
            img.onload = () => {
              requestAnimationFrame(()=> {
                img.classList.add("loaded");
              })
              img.removeAttribute("loading");
              bindClickEvent();
            };
            img.onerror = () => {
              img.classList.add("loaded error");
              img.removeAttribute("loading");
            };
          }
        }else {
          img.classList.add("loaded error");
        }

        function bindClickEvent() {
          if (params.onClick) {
            img?.addEventListener("click", (e) => {
              params.onClick?.(src || "", e);
            });
          }
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
