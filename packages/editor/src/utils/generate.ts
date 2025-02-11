/**
 * 生成markdown表格
 */
export function generateMarkdownTable(rows: number, cols: number) {
    let table = "";
  
    const headers =
      Array(cols)
        .fill("Column")
        .map((item, index) => `${item} ${index + 1}`)
        .join(" | ") + "\n";
    const separator = Array(cols).fill("---").join(" | ") + "\n";
    table += headers + separator;
  
    for (let i = 0; i < rows; i++) {
      const row =
        Array(cols)
          .fill(`Row ${i + 1}`)
          .join(" | ") + "\n";
      table += row;
    }
  
    return table;
  }