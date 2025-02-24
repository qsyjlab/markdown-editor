import { MarkdownEditor } from "./editor";

interface EditorCommand {
  id: string; // 命令唯一 ID
  label: string; // 命令名称（显示在菜单）
  shortcut?: string; // 绑定的快捷键（可选）
  execute: (editor: MarkdownEditor) => void; // 执行命令
}

export class EditorCommandManager {
  private commands: Record<string, EditorCommand> = {};

  register(command: EditorCommand) {
    this.commands[command.id] = command;
  }

  exec() {}
}
