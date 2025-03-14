import {
  computePosition,
  autoUpdate,
  ComputePositionConfig,
  flip,
  shift,
  arrow,
} from "@floating-ui/dom";

import "../../style/ui/tooltip.scss";

interface TooltipOptions extends ComputePositionConfig {
  //   placement: string;
  lazy?: boolean;
  offset: number;
  showArrow?: boolean;
  appendTo?: HTMLElement;
  hideAfterDestory?: boolean;
  createAfter?: (element: HTMLElement) => void;
}

export class Tooltip {
  public options?: Partial<TooltipOptions>;
  public config: Partial<TooltipOptions>;
  public $el: HTMLElement | null = null;
  private appendTo: HTMLElement;
  constructor(
    public triggerElement: HTMLElement,
    public text: string,
    options?: Partial<TooltipOptions>
  ) {
    this.appendTo = options?.appendTo || document.body;
    this.triggerElement = triggerElement;
    this.text = text;
    this.options = options;

    // 默认配置
    const defaultOptions: Partial<TooltipOptions> = {
      placement: "top",
      offset: 10,
      lazy: true,
      showArrow: true,
      hideAfterDestory: true,
    };

    // 合并默认配置和传入的配置
    this.config = { ...defaultOptions, ...options };

    if (!this.config.lazy) {
      this.create();
    }
    // 绑定事件
    this.init();
  }

  setText(text: string) {
    this.text = text;

    const content = this.$el?.querySelector(".md-editor-tooltip-content");
    content && (content.innerHTML = text);
  }

  create() {
    if (this.$el || !this.config.lazy) return;

    this.$el = createTooltipElement({
      arrow: this.config.showArrow || false,
      text: this.text,
      appendTo: this.appendTo,
    });

    this.config.createAfter?.(this.$el);

    autoUpdate(this.triggerElement, this.$el, () => {
      this.updateTooltipPosition();
    });
  }

  // 更新 tooltip 的位置
  updateTooltipPosition() {
    if (!this.$el) return;

    const arrowElement = this.$el.querySelector(".md-editor-tooltip-arrow");
    computePosition(this.triggerElement, this.$el, {
      placement: this.config.placement,
      middleware: [
        flip(),
        shift(),
        arrowElement
          ? arrow({
              element: arrowElement,
            })
          : null,
      ],
    }).then(({ x, y }) => {
      // 设置 tooltip 位置
      this.$el &&
        Object.assign(this.$el.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: "absolute",
        });
    });
  }

  // 显示 tooltip
  showTooltip() {
    this.create();
    if (!this.$el) return;
    this.$el.classList.add("visible");
  }

  // 隐藏 tooltip
  hideTooltip() {
    if (!this.$el) return;
    this.$el.classList.remove("visible");

    if (this.config?.hideAfterDestory) {
      this.$el.remove();
      this.$el = null;
    }
  }

  // 初始化事件监听
  init() {
    this.triggerElement.addEventListener("mouseenter", () => {
      console.log("tirgger");
      this.showTooltip();
    });

    this.triggerElement.addEventListener("mouseleave", () => {
      this.hideTooltip();
    });
  }

  destroy() {
    if (!this.$el) return;
    this.$el.remove();
    this.$el = null;
  }
}

interface CreateOptions {
  arrow: boolean;
  text: string;
  appendTo: HTMLElement;
}

// 创建 tooltip 元素
function createTooltipElement(options: CreateOptions) {
  const tooltip = document.createElement("div");
  tooltip.classList.add("md-editor-tooltip");

  if (options.arrow) {
    const arrow = document.createElement("div");
    arrow.classList.add("md-editor-tooltip-arrow");
    tooltip.appendChild(arrow);
  }

  const content = document.createElement("div");
  content.classList.add("md-editor-tooltip-content");
  content.innerHTML = options.text;
  tooltip.appendChild(content);
  options.appendTo?.appendChild(tooltip);

  return tooltip;
}
