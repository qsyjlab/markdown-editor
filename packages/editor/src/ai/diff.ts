/**
 * 行级 diff（LCS）：AI 建议预览用。
 * 先裁剪公共前后缀把 DP 规模压到变化中段，整文档行级对比 O(n·m) 只落在改动区。
 */
export interface DiffLine {
  type: "same" | "del" | "add";
  text: string;
}

export function lineDiff(oldText: string, newText: string): DiffLine[] {
  // 空文本视为 0 行（"".split("\n") 会得到 [""]，产生虚假 del 行）
  const a = oldText === "" ? [] : oldText.split("\n");
  const b = newText === "" ? [] : newText.split("\n");

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;

  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  const n = midA.length;
  const m = midB.length;

  const out: DiffLine[] = [];
  for (let k = 0; k < start; k++) out.push({ type: "same", text: a[k] });

  if (n === 0 || m === 0) {
    for (const text of midA) out.push({ type: "del", text });
    for (const text of midB) out.push({ type: "add", text });
  } else {
    // dp[i][j] = midA[i..] 与 midB[j..] 的 LCS 长度
    const dp: Uint32Array[] = Array.from(
      { length: n + 1 },
      () => new Uint32Array(m + 1)
    );
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] =
          midA[i] === midB[j]
            ? dp[i + 1][j + 1] + 1
            : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (midA[i] === midB[j]) {
        out.push({ type: "same", text: midA[i] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        out.push({ type: "del", text: midA[i] });
        i++;
      } else {
        out.push({ type: "add", text: midB[j] });
        j++;
      }
    }
    while (i < n) out.push({ type: "del", text: midA[i++] });
    while (j < m) out.push({ type: "add", text: midB[j++] });
  }

  for (let k = endA; k < a.length; k++) out.push({ type: "same", text: a[k] });
  return out;
}

/** 供 UI 折叠显示：只保留变化区上下文各 context 行 */
export function collapseDiff(lines: DiffLine[], context = 2): DiffLine[] {
  if (lines.length <= context * 2 + 2) return lines;

  const keep = new Array(lines.length).fill(false);
  lines.forEach((line, index) => {
    if (line.type === "same") return;
    for (let k = Math.max(0, index - context); k <= Math.min(lines.length - 1, index + context); k++) {
      keep[k] = true;
    }
  });

  const out: DiffLine[] = [];
  let skipping = false;
  lines.forEach((line, index) => {
    if (keep[index]) {
      skipping = false;
      out.push(line);
    } else if (!skipping) {
      skipping = true;
      out.push({ type: "same", text: "⋯" });
    }
  });
  return out;
}
