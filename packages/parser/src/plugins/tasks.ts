import MarkdownIt from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";

export function createTasksPlugin(md: MarkdownIt) {
  md.use(markdownItTaskLists, { label: true, labelAfter: true });
}
