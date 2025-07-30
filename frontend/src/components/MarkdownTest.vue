<template>
  <div class="markdown-test">
    <h2>Markdown 渲染测试</h2>
    <MarkdownRenderer :content="testContent" :options="{ enableMath: true }" />
  </div>
</template>

<script setup lang="ts">
import MarkdownRenderer from './MarkdownRenderer.vue'

const testContent = `
# Markdown 渲染测试

这是一个测试页面，用于验证重构后的markdown渲染功能。

## 基础功能测试

### 文本格式化
这是**粗体文本**，这是*斜体文本*，这是\`行内代码\`，这是==标记文本==。

### 上标和下标
这是上标文本：H^2^O 和 X^n^
这是下标文本：H~2~O 和 X~n~

数学公式中的上标：$x^2 + y^2 = z^2$
数学公式中的下标：$a_1 + a_2 + a_3$

### 列表
- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项
  - 另一个嵌套项

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

### 链接和图片
这是一个[链接](https://example.com)。

![测试图片](https://via.placeholder.com/300x200/007acc/ffffff?text=Test+Image)

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
  return 'Hello from SparkPixel Server!';
}
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

### 表格
| 功能 | 状态 | 说明 |
|------|------|------|
| 基础语法 | ✅ | 完全支持 |
| 数学公式 | ✅ | KaTeX渲染 |
| 容器块 | ✅ | 自定义样式 |
| 图片增强 | ✅ | 懒加载+放大 |

### 引用块
> 这是一个引用块
> 
> 可以包含多行内容
> 
> 支持嵌套的**格式化**

### 水平分割线
---

## 数学公式测试

### 行内公式
这是一个行内公式：$E = mc^2$，爱因斯坦的质能方程。

### 块级公式
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$

## 容器块测试

:::tip 提示信息
这是一个提示容器块，用于显示重要的提示信息。
:::

:::warning 警告信息
这是一个警告容器块，用于显示需要注意的警告信息。
:::

:::success 成功信息
这是一个成功容器块，用于显示操作成功的确认信息。
:::

:::danger 危险信息
这是一个危险容器块，用于显示错误或危险信息。
:::

:::info 信息提示
这是一个信息容器块，用于显示一般的信息提示。
:::

## 复杂示例

### 嵌套结构
1. 第一级列表
   - 第二级列表
     - 第三级列表
       > 引用块中的内容
       
       \`\`\`bash
       echo "代码块中的内容"
       \`\`\`
       
       | 表格 | 内容 |
       |------|------|
       | 行1  | 数据1 |
       | 行2  | 数据2 |

### 数学公式与文本混合
在数学中，我们经常使用 $\\alpha$, $\\beta$, $\\gamma$ 等希腊字母。

对于二次方程 $ax^2 + bx + c = 0$，其解为：

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### 图片与文本混合
下面是一张图片：

![示例图片](https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Example+Image)

图片上方和下方的文本应该正常显示。

---

## 测试完成

以上所有功能都应该正常渲染，包括：
- ✅ 标题层级
- ✅ 文本格式化
- ✅ 列表（有序/无序）
- ✅ 链接和图片
- ✅ 代码块
- ✅ 表格
- ✅ 引用块
- ✅ 数学公式
- ✅ 容器块
- ✅ 水平分割线
- ✅ 嵌套结构
`

</script>

<style scoped>
.markdown-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.markdown-test h2 {
  color: var(--text-accent);
  margin-bottom: 2rem;
  text-align: center;
}
</style> 