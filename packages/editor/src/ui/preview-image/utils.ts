// 动态计算 缩放倍率
export function adaptScale(el: HTMLElement) {
  const { innerWidth, innerHeight } = window;
  const { offsetWidth: w, offsetHeight: h } = el; // 获取文档中图片的宽高
  let scale = 0;
  scale = innerWidth / w;
  if (h * scale > innerHeight - 200) {
    scale = (innerHeight - 200) / h;
  }
  return scale;
}

// 用于修改样式的工具类，并且可以减少回流重绘，后面代码中会频繁用到
export function updateStyle(el: HTMLElement, styleStringArr: string[]) {
  const original = el.style.cssText.split(";");
  original.pop();

  el.style.cssText = original.concat(styleStringArr).join(";") + ";";
}
