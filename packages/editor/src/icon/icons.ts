/**
 * 图标集：24×24 lucide 风格线性图标（stroke 1.75 / round）。
 * 内容仅为 path/shape 片段，经 generateSvg() 包装为完整 svg。
 * 新增图标请保持同网格同线宽，勿内联完整 svg 字符串。
 */
export const icons = {
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>',
  eraser:
    '<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 19"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  heading: '<path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/>',
  h1: '<path d="M4 4v16"/><path d="M11 4v16"/><path d="M4 12h7"/><path d="m17 9 2-1v9"/>',
  h2: '<path d="M4 4v16"/><path d="M11 4v16"/><path d="M4 12h7"/><path d="M15 10h4l-4 7h5"/>',
  h3: '<path d="M4 4v16"/><path d="M11 4v16"/><path d="M4 12h7"/><path d="M15 9h4l-3 3h1a3 3 0 1 1-2 5"/>',
  h4: '<path d="M4 4v16"/><path d="M11 4v16"/><path d="M4 12h7"/><path d="M16 9v5h5"/><path d="M21 9v8"/>',
  h5: '<path d="M4 4v16"/><path d="M11 4v16"/><path d="M4 12h7"/><path d="M15 9h5l-1 3h-1a3 3 0 1 0 0 5"/>',
  h6: '<path d="M4 4v16"/><path d="M11 4v16"/><path d="M4 12h7"/><circle cx="18" cy="10.5" r="1.5"/><circle cx="18" cy="16.5" r="1.5"/>',
  bold: '<path d="M7 4h7a4 4 0 0 1 0 8H7z"/><path d="M7 12h8a4 4 0 0 1 0 8H7z"/>',
  italic: '<path d="M19 4h-9"/><path d="M14 20H5"/><path d="M15 4 9 20"/>',
  strikethrough: '<path d="M16 4H9a3 3 0 0 0-2.6 4.5"/><path d="M14 12a4 4 0 0 1 0 8H6"/><path d="M4 12h16"/>',
  quote:
    '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  table:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M9 5v14"/><path d="M15 5v14"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  minus: '<path d="M5 12h14"/>',
  task: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8.5 12 2.5 2.5 5-5"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.6-3.6a1 1 0 0 0-1.4 0L6 21"/>',
  imagePlus:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><circle cx="9" cy="11" r="2"/><path d="m21 17-3.6-3.6a1 1 0 0 0-1.4 0L6 21"/><path d="M17 2v6"/><path d="M14 5h6"/>',
  sync:
    '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
  columns: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 3v18"/>',
  maximize:
    '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  sparkles:
    '<path d="M9.9 4.2 11.3 8a2 2 0 0 0 1.2 1.2l3.8 1.4-3.8 1.4a2 2 0 0 0-1.2 1.2l-1.4 3.8-1.4-3.8a2 2 0 0 0-1.2-1.2L3.5 10.6l3.8-1.4a2 2 0 0 0 1.2-1.2z"/><path d="M19 3v4"/><path d="M21 5h-4"/>',
} as const;

export type IconName = keyof typeof icons;
