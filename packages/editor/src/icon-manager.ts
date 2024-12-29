import clearSvg from "./icons/clear.svg?raw";

interface IconConfig {
  name: string;
  type: "html" | "font" | "image";
  src?: string;
  className?: string;
  html?: string;
}

export class IconManager {
  public iconsMap: Map<string, IconConfig>;

  public icons: IconConfig[];

  constructor() {
    this.iconsMap = new Map();
    this.icons = [];

    this.register({
      name: "clear",
      type: "html",
      html: clearSvg,
    });
  }

  get(name: string) {
    const config = this.iconsMap.get(name);

    if (!config) return;

    const icon = document.createElement("span");

    icon.className = `icon-${config.type}-${config.name}`;

    if (config.type === "html") {
      if (config.html) {
        icon.innerHTML = config.html;
      }
    } else if (config.type === "font" && config.className) {
      const fontIcon = document.createElement("i");
      fontIcon.className = `icon ${config.className}`;
      icon.appendChild(fontIcon);
    } else if (config.type === "image" && config.src) {
      const img = document.createElement("img");
      img.src = config.src;
      img.alt = config.name;
      img.className = "icon-img";
      icon.appendChild(img);
    }

    return icon;
  }

  register(icon: IconConfig) {
    this.iconsMap.set(icon.name, icon);
    this.icons.push(icon);
  }
}
