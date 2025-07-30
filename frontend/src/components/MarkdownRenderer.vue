<template>
  <!-- 修复：统一使用 'markdown-content' 类名 -->
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItKatex from 'markdown-it-katex'
import markdownItContainer from 'markdown-it-container'

interface Props {
  content: string
  options?: {
    enableMath?: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    enableMath: true
  })
})

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

// 按需加载数学公式支持
if (props.options.enableMath) {
  md.use(markdownItKatex, {
    throwOnError: false,
    errorColor: '#cc0000'
  })
}

// 添加容器插件 (info, warning, success, danger, tip)
const createContainerRule = (name: string, titleEmoji: string, borderColor: string) => {
  md.use(markdownItContainer, name, {
    validate: (params: string) => params.trim().match(new RegExp(`^${name}\\s+(.*)$`)),
    render: (tokens, idx) => {
      const m = tokens[idx].info.trim().match(new RegExp(`^${name}\\s+(.*)$`))
      if (tokens[idx].nesting === 1) {
        // 使用 md.utils.escapeHtml 转义容器标题，防止 XSS
        return `<div class="md-container-${name}"><div class="md-container-title">${titleEmoji} ${md.utils.escapeHtml(m[1])}</div>\n`
      } else {
        return '</div>\n'
      }
    }
  })
}

createContainerRule('info', 'ℹ️', '#2196f3')
createContainerRule('warning', '⚠️', '#ff9800')
createContainerRule('success', '✅', '#4caf50')
createContainerRule('danger', '🚨', '#f44336')
createContainerRule('tip', '💡', '#67c23a')

// 自定义上标规则 ^text^
md.inline.ruler.push('superscript', function (state, silent) {
  if (silent) return false
  const start = state.pos
  const max = state.posMax

  if (state.src.charCodeAt(start) !== 0x5E/* ^ */) return false
  if (start + 1 >= max) return false

  let pos = start + 1
  let found = false
  while (pos < max) {
    if (state.src.charCodeAt(pos) === 0x5E/* ^ */) {
      found = true
      break
    }
    pos++
  }
  if (!found) return false

  const content = state.src.slice(start + 1, pos)
  if (!silent) {
    state.pos = start
    const token = state.push('html_inline', '', 0)
    // 注意：这会生成 <sup> 标签，可能与 KaTeX 冲突，如果需要纯 KaTeX，请移除此规则
    token.content = `<sup>${md.utils.escapeHtml(content)}</sup>`
    state.pos = pos + 1
  }
  return true
})

// 自定义下标规则 ~text~
md.inline.ruler.push('subscript', function (state, silent) {
  if (silent) return false
  const start = state.pos
  const max = state.posMax

  if (state.src.charCodeAt(start) !== 0x7E/* ~ */) return false
  if (start + 1 >= max) return false

  let pos = start + 1
  let found = false
  while (pos < max) {
    if (state.src.charCodeAt(pos) === 0x7E/* ~ */) {
      found = true
      break
    }
    pos++
  }
  if (!found) return false

  const content = state.src.slice(start + 1, pos)
  if (!silent) {
    state.pos = start
    const token = state.push('html_inline', '', 0)
    // 注意：这会生成 <sub> 标签，可能与 KaTeX 冲突，如果需要纯 KaTeX，请移除此规则
    token.content = `<sub>${md.utils.escapeHtml(content)}</sub>`
    state.pos = pos + 1
  }
  return true
})

// 自定义标记文本规则 ==text==
md.inline.ruler.push('mark', function (state, silent) {
  if (silent) return false
  const start = state.pos
  const max = state.posMax

  if (state.src.charCodeAt(start) !== 0x3D/* = */) return false
  if (start + 1 >= max) return false
  if (state.src.charCodeAt(start + 1) !== 0x3D/* = */) return false

  let pos = start + 2
  let found = false
  while (pos < max - 1) {
    if (state.src.charCodeAt(pos) === 0x3D/* = */ &&
        state.src.charCodeAt(pos + 1) === 0x3D/* = */) {
      found = true
      break
    }
    pos++
  }
  if (!found) return false

  const content = state.src.slice(start + 2, pos)
  if (!silent) {
    state.pos = start
    const token = state.push('html_inline', '', 0)
    token.content = `<mark>${md.utils.escapeHtml(content)}</mark>`
    state.pos = pos + 2
  }
  return true
})

// 渲染内容
const renderedContent = computed(() => {
  return md.render(props.content)
})

// 处理图片懒加载和错误处理
const handleImages = () => {
  nextTick(() => {
    // 修复：确保查询的类名与模板一致
    const images = document.querySelectorAll('.markdown-content img')
    images.forEach((element) => {
      const img = element as HTMLImageElement
      // 添加懒加载
      img.loading = 'lazy'
      // 错误处理
      img.onerror = () => {
        img.style.display = 'none'
        const errorDiv = document.createElement('div')
        errorDiv.className = 'image-error'
        errorDiv.textContent = '图片加载失败'
        img.parentNode?.insertBefore(errorDiv, img.nextSibling)
      }
      // 点击放大
      img.style.cursor = 'pointer'
      img.onclick = (e) => {
         e.stopPropagation(); // 防止事件冒泡可能干扰
         const modal = document.createElement('div')
         modal.className = 'image-modal'
         // 为 alt 提供默认值
         modal.innerHTML = `
           <div class="image-modal-content">
             <img src="${img.src}" alt="${img.alt || '图片'}">
             <span class="image-modal-close">&times;</span>
           </div>
         `
         document.body.appendChild(modal)

         // 关闭模态框的健壮逻辑
         const closeModal = () => {
            if (document.body.contains(modal)) {
              document.body.removeChild(modal);
            }
         };

         modal.onclick = closeModal;
         // 防止点击图片内容时关闭模态框
         modal.querySelector('img')!.onclick = (e) => e.stopPropagation();
      }
    })
  })
}

onMounted(() => {
  handleImages()
})
</script>

<style scoped>
/* --- 其他通用 Markdown 样式保持不变 --- */
/* 标题样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.markdown-content :deep(h1) {
  font-size: 2em;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.2em;
}

.markdown-content :deep(h3) { font-size: 1.25em; }
.markdown-content :deep(h4) { font-size: 1.1em; }
.markdown-content :deep(h5) { font-size: 1em; }
.markdown-content :deep(h6) { font-size: 0.9em; }

/* 段落和文本 */
.markdown-content :deep(p) {
  margin-bottom: 1em;
  text-align: justify;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-content :deep(em) {
  font-style: italic;
  color: var(--text-secondary);
}

.markdown-content :deep(mark) {
  background: linear-gradient(120deg, #ffd54f 0%, #ffb300 100%);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  color: #000;
}

/* 上标和下标样式 - 只影响普通markdown，不影响KaTeX */
.markdown-content :deep(:not(.katex) > sup) {
  vertical-align: super;
  font-size: 0.8em;
  line-height: 0;
  position: relative;
  top: -0.5em;
}

.markdown-content :deep(:not(.katex) > sub) {
  vertical-align: sub;
  font-size: 0.8em;
  line-height: 0;
  position: relative;
  bottom: -0.1em;
}

/* 确保KaTeX的上标下标不受影响 */
.markdown-content :deep(.katex sup),
.markdown-content :deep(.katex sub) {
  /* 移除自定义样式，让 KaTeX 使用自己的样式 */
  vertical-align: unset;
  font-size: unset;
  line-height: unset;
  position: unset;
  top: unset;
  bottom: unset;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5em;
  line-height: 1.6;
}

.markdown-content :deep(ul li) {
  list-style-type: disc;
}

.markdown-content :deep(ol li) {
  list-style-type: decimal;
}

/* 引用块 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--accent-color);
  padding: 1em 1.5em;
  margin: 1.5em 0;
  background: var(--bg-secondary);
  border-radius: 0 6px 6px 0;
  position: relative;
}

.markdown-content :deep(blockquote::before) {
  content: '"';
  font-size: 3em;
  color: var(--accent-color);
  position: absolute;
  left: 0.2em;
  top: -0.2em;
  opacity: 0.3;
}

/* 代码样式 */
.markdown-content :deep(code) {
  background: var(--bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.markdown-content :deep(pre) {
  background: var(--bg-secondary);
  padding: 1.5em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  border: 1px solid var(--border-color);
  position: relative;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  font-size: 0.9em;
  line-height: 1.5;
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: var(--accent-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--accent-color);
  color: var(--accent-color);
}

/* 表格样式 */
.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.8em;
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-content :deep(tr:nth-child(even)) {
  background: var(--bg-secondary);
}

.markdown-content :deep(tr:hover) {
  background: var(--bg-hover);
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.markdown-content :deep(img:hover) {
  transform: scale(1.02);
  box-shadow: 0 6px 20px var(--shadow-color);
}

/* 水平线 */
.markdown-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--accent-color), transparent);
  margin: 2em 0;
}

/* 容器块样式 */
.markdown-content :deep(.md-container-info),
.markdown-content :deep(.md-container-warning),
.markdown-content :deep(.md-container-success),
.markdown-content :deep(.md-container-danger),
.markdown-content :deep(.md-container-tip) {
  padding: 1em 1.5em;
  margin: 1.5em 0;
  border-radius: 8px;
  border-left: 4px solid;
}

.markdown-content :deep(.md-container-info) {
  background: rgba(33, 150, 243, 0.1);
  border-left-color: #2196f3;
}

.markdown-content :deep(.md-container-warning) {
  background: rgba(255, 152, 0, 0.1);
  border-left-color: #ff9800;
}

.markdown-content :deep(.md-container-success) {
  background: rgba(76, 175, 80, 0.1);
  border-left-color: #4caf50;
}

.markdown-content :deep(.md-container-danger) {
  background: rgba(244, 67, 54, 0.1);
  border-left-color: #f44336;
}

.markdown-content :deep(.md-container-tip) {
  background: rgba(103, 194, 58, 0.1);
  border-left-color: #67c23a;
}

.markdown-content :deep(.md-container-title) {
  font-weight: 600;
  margin-bottom: 0.5em;
  font-size: 1.1em;
}

/* --- 修复并简化 KaTeX 样式 --- */
/* KaTeX 数学公式样式 */
/* 重点：确保这些 :deep() 规则能匹配到由 markdown-it-katex 生成的 .katex 元素 */
.markdown-content :deep(.katex) {
  /* KaTeX 字体是关键，通常由 katex.min.css 提供 */
  /* font-family: KaTeX_Main, Times New Roman, serif; */ /* 不需要手动设置，由 CSS 文件处理 */
  font-size: 1.1em; /* 可根据需要调整 */
  /* direction: ltr; */ /* 通常由 CSS 文件处理 */
  /* text-align: left; */ /* 通常由 CSS 文件处理 */
  /* 其他复杂样式依赖于全局引入的 katex.min.css */
}

.markdown-content :deep(.katex-display) {
  margin: 1.5em 0;
  text-align: center; /* 块级公式居中 */
  padding: 1em;
  background: var(--bg-secondary); /* 可选：公式块背景 */
  border-radius: 8px; /* 可选：圆角 */
  border: 1px solid var(--border-color); /* 可选：边框 */
  overflow-x: auto; /* 防止长公式溢出容器 */
  /* display: flex; */ /* 避免与 KaTeX 内部布局冲突 */
  /* justify-content: center; */ /* 避免与 KaTeX 内部布局冲突 */
}

/* 图片错误提示 */
.markdown-content :deep(.image-error) {
  color: #f44336;
  font-style: italic;
  padding: 0.5em;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  text-align: center;
}

/* 图片模态框 */
/* 注意：模态框是动态创建的，不在组件根元素内，scoped 样式无效 */
/* 这里使用 :global() 确保样式生效 */
:global(.image-modal) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

:global(.image-modal-content) {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

:global(.image-modal-content img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

:global(.image-modal-close) {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 2em;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-content {
    font-size: 0.9rem;
  }
  .markdown-content :deep(pre) {
    padding: 1em;
    font-size: 0.8em;
  }
  .markdown-content :deep(table) {
    font-size: 0.8em;
  }
  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    padding: 0.5em;
  }
}
</style>