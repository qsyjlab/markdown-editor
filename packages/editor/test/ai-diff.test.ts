import { describe, expect, it } from "vitest";
import { collapseDiff, lineDiff } from "../src/ai/diff";

describe("lineDiff", () => {
  it("相同文本全为 same", () => {
    expect(lineDiff("a\nb", "a\nb")).toEqual([
      { type: "same", text: "a" },
      { type: "same", text: "b" },
    ]);
  });

  it("中段替换产生 del+add", () => {
    const diff = lineDiff("a\n旧标题\nb", "a\n新标题\nb");
    expect(diff).toEqual([
      { type: "same", text: "a" },
      { type: "del", text: "旧标题" },
      { type: "add", text: "新标题" },
      { type: "same", text: "b" },
    ]);
  });

  it("纯插入", () => {
    const diff = lineDiff("a\nb", "a\n新行\nb");
    expect(diff).toEqual([
      { type: "same", text: "a" },
      { type: "add", text: "新行" },
      { type: "same", text: "b" },
    ]);
  });

  it("纯删除", () => {
    const diff = lineDiff("a\n旧行\nb", "a\nb");
    expect(diff).toEqual([
      { type: "same", text: "a" },
      { type: "del", text: "旧行" },
      { type: "same", text: "b" },
    ]);
  });

  it("空原文 → 全部 add（AI 续写场景）", () => {
    expect(lineDiff("", "第一行\n第二行")).toEqual([
      { type: "add", text: "第一行" },
      { type: "add", text: "第二行" },
    ]);
  });

  it("全文重写", () => {
    const diff = lineDiff("旧一\n旧二", "新一\n新二");
    expect(diff.filter((l) => l.type === "del").map((l) => l.text)).toEqual([
      "旧一",
      "旧二",
    ]);
    expect(diff.filter((l) => l.type === "add").map((l) => l.text)).toEqual([
      "新一",
      "新二",
    ]);
  });

  it("行序交换产出 1 del + 1 add（路径顺序不敏感）", () => {
    const diff = lineDiff("a\nb", "b\na");
    expect(diff.filter((l) => l.type === "del").map((l) => l.text)).toEqual(["a"]);
    expect(diff.filter((l) => l.type === "add").map((l) => l.text)).toEqual(["a"]);
  });
});

describe("collapseDiff", () => {
  it("短 diff 不折叠", () => {
    const lines = lineDiff("a\nb", "a\nB");
    expect(collapseDiff(lines)).toEqual(lines);
  });

  it("长 same 区折叠为省略行", () => {
    const lines = [
      ...Array.from({ length: 10 }, (_, i) => ({ type: "same" as const, text: `l${i}` })),
      { type: "del" as const, text: "旧" },
      { type: "add" as const, text: "新" },
      ...Array.from({ length: 10 }, (_, i) => ({ type: "same" as const, text: `r${i}` })),
    ];
    const collapsed = collapseDiff(lines, 2);
    expect(collapsed.some((l) => l.text === "⋯")).toBe(true);
    expect(collapsed.length).toBeLessThan(lines.length);
    // 变化行必须保留
    expect(collapsed.some((l) => l.type === "del")).toBe(true);
    expect(collapsed.some((l) => l.type === "add")).toBe(true);
  });
});
