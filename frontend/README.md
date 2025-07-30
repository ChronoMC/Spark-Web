# Frontend - SparkPixel Server

## Markdown 渲染功能

### 重构说明

本次重构对markdown渲染系统进行了全面升级，主要改进包括：

#### 1. 组件化设计
- 将markdown渲染逻辑从App.vue中提取到独立的`MarkdownRenderer.vue`组件
- 支持可配置的渲染选项
- 更好的代码组织和维护性

#### 2. 功能增强
- **数学公式支持**: 使用KaTeX渲染LaTeX数学公式
- **容器块支持**: 支持info、warning、success、danger、tip等容器块
- **图片增强**: 
  - 懒加载支持
  - 点击放大功能
  - 错误处理
- **响应式设计**: 适配移动端显示

#### 3. 样式优化
- 统一的CSS变量系统
- 现代化的视觉效果
- 更好的可读性和用户体验
- 支持深色/浅色主题

#### 4. 性能优化
- 按需加载插件
- 图片懒加载
- 优化的渲染性能

#### 5. 主题支持
- **6种主题**: Default、GitHub、Dracula、Solarized、Nord、Monokai
- **深色/浅色模式**: 自动适配系统主题偏好
- **主题切换**: 支持实时切换主题和样式
- **统一设计**: 所有主题都保持一致的markdown渲染效果
- **自定义滚动条**: 每个主题都有独特的滚动条样式

### 使用方法

#### 基础使用
```vue
<template>
  <MarkdownRenderer :content="markdownContent" :options="{ enableMath: true }" />
</template>

<script setup>
import MarkdownRenderer from './components/MarkdownRenderer.vue'

const markdownContent = `
# 标题

这是一段**粗体**文本和*斜体*文本，还有==标记==文本。

## 上标和下标
这是上标：H^2^O
这是下标：H~2~O

## 数学公式
$E = mc^2$

## 代码块
\`\`\`javascript
console.log('Hello World!');
\`\`\`

:::tip 提示
这是一个提示信息
:::

:::warning 警告
这是一个警告信息
:::

:::success 成功
这是一个成功信息
:::

:::danger 危险
这是一个危险信息
:::

:::info 信息
这是一个信息提示
:::
`
</script>
```

#### 多主题使用
```vue
<template>
  <div :class="[`${currentTheme}-theme`, isDarkMode ? 'dark' : '', 'theme-markdown']">
    <MarkdownRenderer :content="markdownContent" />
  </div>
</template>

<script setup>
import MarkdownRenderer from './components/MarkdownRenderer.vue'
import './styles/themes.css'

const currentTheme = ref('github') // 可选: default, github, dracula, solarized, nord, monokai
const isDarkMode = ref(false)
</script>
```

#### 主题切换
```javascript
// 循环切换主题
function cycleTheme() {
  const themes = ['default', 'github', 'dracula', 'solarized', 'nord', 'monokai']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  currentTheme.value = themes[nextIndex]
}
```

### 支持的Markdown语法

#### 基础语法
- 标题 (H1-H6)
- 段落和文本格式化
- 列表 (有序/无序)
- 链接和图片
- 代码块和行内代码
- 表格
- 引用块
- 水平分割线

#### 扩展功能
- **数学公式**: 支持`$...$`和`$$...$$`语法
- **上标和下标**: 支持`^...^`上标和`~...~`下标语法（自定义实现）
- **标记文本**: 支持`==...==`语法高亮文本（自定义实现）
- **容器块**: 支持tip、warning、success、danger、info等
- **图片增强**: 懒加载、点击放大、错误处理

### 配置选项

```typescript
interface Options {
  enableMath?: boolean  // 是否启用数学公式渲染
}
```

### 样式定制

#### 默认主题
组件使用CSS变量系统，可以通过修改CSS变量来自定义样式：

```css
:root {
  --text-primary: #333;
  --text-secondary: #666;
  --accent-color: #007acc;
  --bg-secondary: #f5f5f5;
  --border-color: #ddd;
  --shadow-color: rgba(0, 0, 0, 0.1);
}
```

#### 可用主题

##### 🎨 默认主题 (Default)
- 简洁现代的设计
- 支持浅色和深色模式
- 适合日常使用

##### 🐙 GitHub主题
- GitHub官方风格
- 开发者友好的配色
- 完整的GitHub体验



##### 🧛 Dracula主题
- 深色主题为主
- 高对比度配色
- 适合夜间使用

##### ☀️ Solarized主题
- 护眼的配色方案
- 科学计算风格
- 长时间使用不疲劳

##### ❄️ Nord主题
- 北极风格配色
- 冷色调设计
- 清新简约

##### 🎭 Monokai主题
- 代码编辑器风格
- 高饱和度配色
- 复古编程风格

主题文件位置：`src/styles/themes.css`

### 滚动条特性
- **主题适配**: 每个主题都有独特的滚动条颜色
- **深色模式**: 深色模式下滚动条颜色自动调整
- **悬停效果**: 鼠标悬停时滚动条颜色变化
- **圆角设计**: 现代化的圆角滚动条
- **多浏览器支持**: 支持Webkit和Firefox浏览器
- **特定元素**: 代码块、对话框、新闻列表都有专门的滚动条样式

### 依赖说明

- `markdown-it`: 核心markdown解析器
- `markdown-it-katex`: 数学公式渲染
- `markdown-it-container`: 容器块支持
- `katex`: 数学公式样式

> 注意：上标、下标和标记文本功能使用自定义的markdown-it规则实现，不依赖额外插件

### 开发说明

1. 安装依赖: `npm install`
2. 启动开发服务器: `npm run dev`
3. 构建生产版本: `npm run build`

### 注意事项

- 确保在使用数学公式时启用`enableMath`选项
- 图片URL需要是可访问的
- 容器块语法需要严格按照格式使用
