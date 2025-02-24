export interface IconConfig {
  name: string;
  type: "html" | "font" | "image";
  src?: string;
  className?: string;
  html?: string;
}

export function createIconManager(): IconManager {
  const iconsMap = new Map<string, IconConfig>();

  return {
    iconsMap,
    create(name: string) {
      const config = iconsMap.get(name);

      if (!config) return;

      const icon = document.createElement("span") as HTMLElement;

      icon.className = `md-editor-icon icon-${config.type}-${config.name}`;

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
    },
    register: (icon) => {
      iconsMap.set(icon.name, icon);
    },
  };
}

export interface IconManager {
  iconsMap: Map<string, IconConfig>
  create(name: string): HTMLElement | undefined;
  register(icon: IconConfig): void;
}
