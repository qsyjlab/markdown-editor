
import mdText from './markdown.md?raw'
export const text = mdText

// export const text = `# Markdown 示例

// ## 1. 标题
// 这是一个 H1 标题
// ============

// 这是一个 H2 标题
// ------------

// ### 这是一个 H3 标题
// #### 这是一个 H4 标题

// ## 2. 强调和粗体
// **这是粗体文本**

// *这是斜体文本*

// ***这是粗斜体文本***

// ## 3. 列表
// ### 无序列表
// - 项目 1
// - 项目 2
//   - 子项目 2.1
//   - 子项目 2.2
// - 项目 3

// ### 有序列表
// 1. 第一项
// 2. 第二项
// 3. 第三项

// ## 4. 链接
// [GitHub](https://github.com)

// [百度](https://www.baidu.com)

// ## 5. 图片
// ![alt 文本](https://example.com/image.png)

// ## 6. 代码块

// ### 行内代码

// ### 代码块
// \`\`\` javascript
// function sayHello(name) {
//   console.log('Hello ' + name);
// }

// sayHello('World');
// \`\`\`

// \`\`\` python
// def say_hello(name):
//     print(f'Hello {name}')

// say_hello('World')\

// \`\`\`

// asdasd


// 突出显示一行。
// \`\`\` typescript
// console.log('Not highlighted')
// console.log('Highlighted') // [!code highlight]
// console.log('Not highlighted')
// \`\`\`



// 高亮单词
// \`\`\` typescript
// // [!code word:Hello]
// const message = 'Hello World'
// console.log(message) // prints Hello World
// \`\`\`


// 使用[!code error]和[!code warning]标记错误和警告级别的行。
// \`\`\` typescript

// console.log('No errors or warnings')
// console.error('Error') // [!code error]
// console.warn('Warning') // [!code warning]
// \`\`\`



// \`\`\` typescript

// type HeadConfig =
//   | [string, Record<string, string>]
//   | [string, Record<string, string>, string]

// \`\`\`


// \`\`\` typescript

// console.log('hewwo') // [!code --]
// console.log('hello') // [!code ++]
// console.log('goodbye')

// \`\`\`


// ### 代码块带行号
// \`\`\` javascript 
// let a = 10;
// let b = 20;
// console.log(a + b);
// \`\`\`

// ## 7. 引用
// > 这是一个引用文本

// ## 8. 表格

// | 姓名 | 年龄 | 性别 |
// |------|------|------|
// | 小明 | 18   | 男   |
// | 小红 | 20   | 女   |
// | 小李 | 22   | 男   |

// ## 9. 分割线

// ---

// ## 10. HTML

// <div style="color: red;">
//   <p>这是一个带有样式的段落</p>
// </div>

// ## 11. 脚本代码示例

// \`\`\` bash
// # 在命令行中运行的脚本
// echo "Hello, World!"
// \`\`\`

// ## 12. 任务列表
// - [x] 任务 1 已完成
// - [ ] 任务 2 未完成
// - [x] 任务 3 已完成

// ## 13. 自定义 HTML
// <p>这是一个自定义 HTML 元素。</p>

// ## 14. 内联代码高亮
// \`npm install markdown-it-prism\`
// `