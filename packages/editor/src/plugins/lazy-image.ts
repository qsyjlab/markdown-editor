import { MarkdownEditor } from "../editor";

export function LazyImagePlugin(editor: MarkdownEditor) {
  return {
    name: "lazy-image",
    update: () => {
      // 懒加载观察由预览容器统一维护（bindPreviewEvents），这里只做增量刷新，
      // 修复 v1 每次更新重复创建 IntersectionObserver 的泄漏
      editor.previewManager?.refreshEvents();
    },
  };
}
