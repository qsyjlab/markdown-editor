interface BindCopyCodeEventParams {
  $el?: HTMLElement | Document;

  /**
   * Custom copy handler
   */
  onCopy?: (text: string, el: HTMLElement) => Promise<void>;

  /**
   * Success delay
   * @default 1000
   */
  successDelay?: number;

  /**
   * Ignored nodes
   */
  ignoredNodes?: string[];
}

export function bindCopyCodeEvent(params?: BindCopyCodeEventParams) {
  const {
    successDelay = 1000,
    ignoredNodes = [".md-copy-ignore", ".diff.remove"],
    $el = document,
  } = params || {};

  const timeoutIdMap: WeakMap<HTMLElement, NodeJS.Timeout> = new WeakMap();

  function eventHandler(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (el.matches('div[class*="language-"] > button.copy')) {
      const parent = el.parentElement;
      const sibling = el.nextElementSibling?.nextElementSibling;
      if (!parent || !sibling) {
        return;
      }

      const clone = sibling.cloneNode(true) as HTMLElement;

      clone
        .querySelectorAll(ignoredNodes.join(","))
        .forEach((node) => node.remove());

      let text = clone.textContent || "";

      const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(
        parent.className
      );

      if (isShell) {
        text = text.replace(/^ *(\$|>) /gm, "").trim();
      }

      if (params?.onCopy) {
        params.onCopy(text, el).then(done);
        return;
      }

      copyToClipboard(text).then(done);

      function done() {
        el.classList.add("copied");
        clearTimeout(timeoutIdMap.get(el));
        const timeoutId = setTimeout(() => {
          el.classList.remove("copied");
          el.blur();
          timeoutIdMap.delete(el);
        }, successDelay);
        timeoutIdMap.set(el, timeoutId);
      }
    }
  }

  $el.addEventListener("click", (e) => {
    eventHandler(e as MouseEvent);
  });

  function stopEventListener() {
    window.removeEventListener("click", eventHandler);
  }

  return stopEventListener;
}

async function copyToClipboard(text: string) {
  try {
    return navigator.clipboard.writeText(text);
  } catch {
    const element = document.createElement("textarea");
    const previouslyFocusedElement = document.activeElement;

    element.value = text;

    // Prevent keyboard from showing on mobile
    element.setAttribute("readonly", "");

    element.style.contain = "strict";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.fontSize = "12pt"; // Prevent zooming on iOS

    const selection = document.getSelection();
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null;

    document.body.appendChild(element);
    element.select();

    // Explicit selection workaround for iOS
    element.selectionStart = 0;
    element.selectionEnd = text.length;

    document.execCommand("copy");
    document.body.removeChild(element);

    if (originalRange) {
      selection!.removeAllRanges(); // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange);
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      (previouslyFocusedElement as HTMLElement).focus();
    }
  }
}
