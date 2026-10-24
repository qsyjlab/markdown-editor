import { describe, expect, it, vi } from "vitest";
import {
  BlockStore,
  diffBlocks,
  hashBlock,
  splitMarkdownBlocks,
} from "../src/block";
import { StreamingRenderer } from "../src/streaming";

describe("splitMarkdownBlocks", () => {
  it("按空行切分普通段落", () => {
    const blocks = splitMarkdownBlocks("# 标题\n\n第一段\n\n第二段");
    expect(blocks).toEqual(["# 标题", "第一段", "第二段"]);
  });

  it("连续行属于同一块", () => {
    const blocks = splitMarkdownBlocks("第一行\n第二行\n第三行");
    expect(blocks).toEqual(["第一行\n第二行\n第三行"]);
  });

  it("围栏代码块内部的空行不切块", () => {
    const md = "```ts\nconst a = 1;\n\nconst b = 2;\n```\n\n后续段落";
    expect(splitMarkdownBlocks(md)).toEqual([
      "```ts\nconst a = 1;\n\nconst b = 2;\n```",
      "后续段落",
    ]);
  });

  it("未闭合围栏整体是活动块（AI 流式中间态）", () => {
    const md = "段落\n\n```ts\nconst a = 1;\n\nconst b";
    expect(splitMarkdownBlocks(md)).toEqual(["段落", "```ts\nconst a = 1;\n\nconst b"]);
  });

  it("波浪线围栏同样识别", () => {
    const md = "~~~\n\n内容\n\n~~~";
    expect(splitMarkdownBlocks(md)).toEqual(["~~~\n\n内容\n\n~~~"]);
  });

  it("引用块跨空行合并", () => {
    const md = "> 第一行\n\n> 第二行";
    expect(splitMarkdownBlocks(md)).toEqual(["> 第一行\n\n> 第二行"]);
  });

  it("松散列表跨空行合并", () => {
    const md = "- a\n\n- b";
    expect(splitMarkdownBlocks(md)).toEqual(["- a\n\n- b"]);
  });

  it("引用与列表互不合并", () => {
    const md = "- item\n\n> quote";
    expect(splitMarkdownBlocks(md)).toEqual(["- item", "> quote"]);
  });

  it("CRLF 归一化", () => {
    expect(splitMarkdownBlocks("a\r\n\r\nb")).toEqual(["a", "b"]);
  });

  it("空文本与纯空行返回空数组", () => {
    expect(splitMarkdownBlocks("")).toEqual([]);
    expect(splitMarkdownBlocks("\n\n\n")).toEqual([]);
  });

  it("容器内部空行不切块（::: tip ... :::）", () => {
    const md = "::: tip\n第一段\n\n第二段\n:::\n\n后续段落";
    expect(splitMarkdownBlocks(md)).toEqual([
      "::: tip\n第一段\n\n第二段\n:::",
      "后续段落",
    ]);
  });

  it("嵌套容器整体一块", () => {
    const md = "::: tip\n外层\n\n::: warning\n内层\n:::\n\n收尾\n:::";
    expect(splitMarkdownBlocks(md)).toEqual([md]);
  });

  it("容器内含代码围栏（含空行）不切块", () => {
    const md = "::: tip\n```ts\nconst a = 1;\n\nconst b = 2;\n```\n:::";
    expect(splitMarkdownBlocks(md)).toEqual([md]);
  });

  it("代码围栏内的 ::: 不被误认为容器", () => {
    const md = "```md\n::: tip\n内容\n:::\n```";
    expect(splitMarkdownBlocks(md)).toEqual([md]);
  });
});

describe("hashBlock", () => {
  it("同内容稳定，异内容不同", () => {
    expect(hashBlock("# a")).toBe(hashBlock("# a"));
    expect(hashBlock("# a")).not.toBe(hashBlock("# b"));
  });
});

describe("diffBlocks", () => {
  it("中段单块替换只暴露该块", () => {
    const prev = ["a", "b", "c", "d"].map(hashBlock);
    const next = ["a", "b2", "c", "d"].map(hashBlock);
    expect(diffBlocks(prev, next)).toEqual({
      changedFrom: 1,
      changedTo: 2,
      removedTo: 2,
    });
  });

  it("中段多块连续替换暴露整个区间", () => {
    const prev = ["a", "b", "c", "d"].map(hashBlock);
    const next = ["a", "b2", "c2", "d"].map(hashBlock);
    expect(diffBlocks(prev, next)).toEqual({
      changedFrom: 1,
      changedTo: 3,
      removedTo: 3,
    });
  });

  it("尾部追加只暴露追加区间（纯插入）", () => {
    const prev = ["a", "b"].map(hashBlock);
    const next = ["a", "b", "c", "d"].map(hashBlock);
    expect(diffBlocks(prev, next)).toEqual({
      changedFrom: 2,
      changedTo: 4,
      removedTo: 2,
    });
  });

  it("头部插入全部失效（保守处理）", () => {
    const prev = ["a", "b"].map(hashBlock);
    const next = ["x", "a", "b"].map(hashBlock);
    expect(diffBlocks(prev, next)).toEqual({
      changedFrom: 0,
      changedTo: 1,
      removedTo: 0,
    });
  });

  it("删除尾部暴露删除区间（纯删除：changedFrom === changedTo）", () => {
    const prev = ["a", "b", "c"].map(hashBlock);
    const next = ["a"].map(hashBlock);
    expect(diffBlocks(prev, next)).toEqual({
      changedFrom: 1,
      changedTo: 1,
      removedTo: 3,
    });
  });

  it("内容完全一致时为空区间", () => {
    const prev = ["a", "b"].map(hashBlock);
    const next = ["a", "b"].map(hashBlock);
    expect(diffBlocks(prev, next)).toEqual({
      changedFrom: 2,
      changedTo: 2,
      removedTo: 2,
    });
  });
});

describe("BlockStore", () => {
  it("未变更块命中缓存，不重复渲染", () => {
    const render = vi.fn((src: string) => `<p>${src}</p>`);
    const store = new BlockStore(render);

    store.renderBlock("a");
    store.renderBlock("b");
    store.renderBlock("a");

    expect(render).toHaveBeenCalledTimes(2);
  });

  it("超过容量逐出最久未使用的块", () => {
    const render = vi.fn((src: string) => `<p>${src}</p>`);
    const store = new BlockStore(render, 2);

    store.renderBlock("a");
    store.renderBlock("b");
    store.renderBlock("a"); // a 变为最近使用
    store.renderBlock("c"); // 逐出 b

    store.renderBlock("b"); // 缓存未命中，重新渲染
    expect(render).toHaveBeenCalledTimes(4);
  });
});

describe("StreamingRenderer", () => {
  function createCountedRenderer() {
    const rendered: string[] = [];
    const renderBlock = vi.fn((src: string) => {
      const html = `<p>${src}</p>`;
      rendered.push(src);
      return html;
    });
    return { session: new StreamingRenderer(renderBlock), renderBlock };
  }

  it("追加 chunk 只重渲染活动块，已完成块冻结", () => {
    const { session, renderBlock } = createCountedRenderer();

    session.append("# 标题\n\n");
    expect(renderBlock).toHaveBeenCalledTimes(1);

    // 段落完成后继续追加新块：标题块不重渲染
    session.append("第一段正在生成");
    expect(renderBlock).toHaveBeenCalledTimes(2);

    session.append(" 继续生成");
    // 同一块内容变化，重渲染该块；标题块仍是缓存结果
    expect(renderBlock).toHaveBeenCalledTimes(3);
    expect(session.getBlocks()[0].html).toBe("<p># 标题</p>");
  });

  it("setText 走块 diff，共同前缀不重渲染", () => {
    const { session, renderBlock } = createCountedRenderer();

    session.setText("a\n\nb\n\nc");
    expect(renderBlock).toHaveBeenCalledTimes(3);

    session.setText("a\n\nb!\n\nc");
    expect(renderBlock).toHaveBeenCalledTimes(4);
  });

  it("未闭合围栏是活动块，每个 chunk 只重渲染它", () => {
    const { session, renderBlock } = createCountedRenderer();

    session.append("```ts\nconst a");
    session.append(" = 1;\n");
    session.append("const b = 2;");

    // 三次 append 均只渲染这一个块
    expect(renderBlock).toHaveBeenCalledTimes(3);
    expect(session.getBlocks()).toHaveLength(1);
  });

  it("getHtml 为全部块拼接结果", () => {
    const { session } = createCountedRenderer();
    session.setText("a\n\nb");
    expect(session.getHtml()).toBe("<p>a</p>\n<p>b</p>");
  });

  it("reset 清空会话", () => {
    const { session, renderBlock } = createCountedRenderer();
    session.setText("a\n\nb");
    session.reset();
    expect(session.getBlocks()).toHaveLength(0);
    session.setText("a\n\nb");
    expect(renderBlock).toHaveBeenCalledTimes(4);
  });
});
