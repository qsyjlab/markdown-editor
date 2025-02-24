export function clearElementChildren(element:HTMLElement) {
  // 检查元素是否有子元素
  if (element?.hasChildNodes?.()) {
    // 删除所有子元素
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}
