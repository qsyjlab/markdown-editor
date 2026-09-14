import { createApp } from 'vue'

import EditorDemo from './app2.vue'
import AiStreamDemo from './ai-demo.vue'

// ?demo=ai 进入 AI 流式渲染演示，默认进入编辑器演示
const App = new URLSearchParams(window.location.search).get('demo') === 'ai'
  ? AiStreamDemo
  : EditorDemo

createApp(App).mount('#app')
