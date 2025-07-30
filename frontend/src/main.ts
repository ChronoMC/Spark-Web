import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './styles/themes.css'
// KaTeX 样式
import 'katex/dist/katex.min.css'
import './assets/add-tool-bar.png'
const app = createApp(App)
app.mount('#app')

// 监听主题切换事件
window.addEventListener('theme-change', (e: any) => {
  const theme = e.detail
  document.body.classList.remove('dark', 'light')
  document.body.classList.add(theme)
})
