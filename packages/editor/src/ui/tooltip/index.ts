import {
  computePosition,
  autoUpdate,
  ComputePositionConfig,
  flip,
  shift,
} from "@floating-ui/dom";

import "../../style/ui/tooltip.scss";

interface TooltipOptions extends ComputePositionConfig {
  //   placement: string;
  lazy?: boolean;
  offset: number;

  createAfter?: (element:HTMLElement) => void;
}

export class Tooltip {
  public options?: Partial<TooltipOptions>;
  public config: Partial<TooltipOptions>;
  public $el: HTMLElement | null = null;
  constructor(
    public triggerElement: HTMLElement,
    public text: string,
    options?: Partial<TooltipOptions>
  ) {
    this.triggerElement = triggerElement;
    this.text = text;
    this.options = options;

    // 默认配置
    const defaultOptions: Partial<TooltipOptions> = {
      placement: "top",
      offset: 10,
      lazy: true,
    };

    // 合并默认配置和传入的配置
    this.config = { ...defaultOptions, ...options };

    if (!this.config.lazy) {
      this.create();
    }
    // 绑定事件
    this.init();
  }

  create() {
    if (this.$el || !this.config.lazy) return;

    this.$el = this.createTooltipElement();

    this.config.createAfter?.(this.$el)

    autoUpdate(this.triggerElement, this.$el, () => {
      this.updateTooltipPosition();
    });
  }
  // 创建 tooltip 元素
  createTooltipElement() {
    const tooltip = document.createElement("div");
    tooltip.classList.add("md-editor-tooltip");
    tooltip.innerText = this.text;
    document.body.appendChild(tooltip);

    return tooltip;
  }

  // 更新 tooltip 的位置
  updateTooltipPosition() {
    if (!this.$el) return;
    computePosition(this.triggerElement, this.$el, {
      placement: this.config.placement,
      middleware: [flip(), shift()],
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
  }

  // 初始化事件监听
  init() {
    this.triggerElement.addEventListener("mouseenter", () => {
      this.showTooltip();
    });

    this.triggerElement.addEventListener("mouseleave", () => {
      this.hideTooltip();
    });
  }

  destroy() {
    if (!this.$el) return;
    this.$el.remove();
  }
}
