interface InsertOptions {
  selected: string;

  insertGettter: (value: string, index: number) => string;

  selectedGetter: (value: string) => string;

  ignoreEmptyLine: boolean;
}

export function createInsertContent(params: InsertOptions) {
  const { selected, selectedGetter, insertGettter, ignoreEmptyLine } = params;

  let insertContent;
  let newSelected;

  if (selected) {
    newSelected = selectedGetter(selected);
    insertContent = insertGettter(selected, 1);

    // 如果当前选中的文本包含换行 则插入后选中插入的所有文本
    if (selected.indexOf("\n") !== -1) {
      insertContent = selected
        .split("\n")
        .map((rowText, index) => {
          const isEmptyLine = !rowText;
          if (ignoreEmptyLine && isEmptyLine) return "";

          return insertGettter(rowText, index + 1).replace(
            selectedGetter(''),
            ""
          );
        })
        .join("\n");

      newSelected = insertContent;
    }
  } else {
    insertContent = insertGettter('', 1);
    newSelected = selectedGetter(selected);
  }

  return {
    insertContent,
    newSelected,
  };
}
