import type { MarkdownEditor } from "../editor";

/**
 * 选区包裹切换：已有包裹则解包，否则包裹（工具栏与快捷键共用）。
 * 直接操作 CodeMirror 事务以读取选区外文本，支持三种识别：
 * 1. 选区两侧已有包裹符 → 移除
 * 2. 选区文本本身带包裹符 → 去掉
 * 3. 其余 → 包裹并保持内部文本选中
 */
export function toggleWrap(
  editor: MarkdownEditor,
  prefix: string,
  suffix: string = prefix
) {
  const view = editor.editorManager.instance;
  if (!view) return;

  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);

  const before = view.state.sliceDoc(
    Math.max(0, from - prefix.length),
    from
  );
  const after = view.state.sliceDoc(
    to,
    Math.min(view.state.doc.length, to + suffix.length)
  );

  if (before === prefix && after === suffix) {
    view.dispatch({
      changes: [
        { from: from - prefix.length, to: from, insert: "" },
        { from: to, to: to + suffix.length, insert: "" },
      ],
      selection: {
        anchor: from - prefix.length,
        head: to - prefix.length,
      },
    });
    return;
  }

  if (
    selected.length >= prefix.length + suffix.length &&
    selected.startsWith(prefix) &&
    selected.endsWith(suffix)
  ) {
    view.dispatch({
      changes: {
        from,
        to,
        insert: selected.slice(prefix.length, selected.length - suffix.length),
      },
    });
    return;
  }

  view.dispatch({
    changes: { from, to, insert: prefix + selected + suffix },
    selection: {
      anchor: from + prefix.length,
      head: from + prefix.length + selected.length,
    },
  });
}
