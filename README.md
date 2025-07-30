# SparkPixel Server Dashboard

一个现代化的 Minecraft 服务器状态监控仪表板，提供实时服务器状态、地铁线路图、新闻公告和工具栏功能。

## ✨ 功能特性

### 🖥️ 服务器监控
- **实时状态监控**：显示服务器在线状态、版本信息和玩家数量
- **玩家统计**：实时显示当前在线玩家数和最大容量
- **状态指示器**：直观的在线/离线状态显示

### 🚇 地铁线路图
- **交互式地图**：基于SVG的现代化地铁线路图
- **主题适配**：支持深色和浅色主题切换
- **动态渲染**：实时生成的地铁线路可视化

### 📰 新闻公告系统
- **Markdown支持**：支持完整的Markdown语法渲染
- **YAML前置数据**：支持标题、作者、标签等元数据
- **数学公式**：支持KaTeX数学公式渲染
- **代码高亮**：支持多种编程语言的语法高亮
- **弹窗阅读**：点击新闻条目弹出详细阅读窗口

### 🛠️ 工具栏
- **可展开设计**：支持展开/收起功能
- **快速链接**：官方网站、文档中心、社区论坛等
- **游戏相关**：游戏指南、活动中心、排行榜等
- **用户服务**：技术支持、充值中心、皮肤商店等

### 🎨 主题系统
- **多主题支持**：默认、GitHub、Dracula、Solarized、Nord等主题
- **系统主题适配**：自动检测并适配系统主题偏好
- **实时切换**：支持动态主题切换
- **响应式设计**：适配不同屏幕尺寸

## 🛠️ 技术栈

### 前端 (Vue 3 + TypeScript)
- **框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI组件**：自定义组件系统
- **Markdown渲染**：markdown-it + KaTeX + Prism.js
- **样式**：CSS3 + 主题系统

### 后端 (Node.js + Express)
- **运行时**：Node.js
- **框架**：Express.js
- **Minecraft集成**：minecraft-server-util
- **文件处理**：fs + path
- **数据解析**：yaml-front-matter

### 核心依赖
- **Markdown处理**：markdown-it, remark, rehype
- **数学公式**：KaTeX
- **代码高亮**：Prism.js
- **SVG处理**：svg.js, svgdom
- **YAML解析**：js-yaml

## 📦 安装和运行

### 环境要求
- Node.js 16+ 
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd web
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 3. 配置后端
编辑 `backend/config.conf` 文件：
```conf
# Minecraft服务器配置
server_address=your-server-ip
server_port=25565
```

### 4. 启动服务

#### 开发模式
```bash
# 启动后端服务
cd backend
npm run serve

# 启动前端开发服务器
cd ../frontend
npm run dev
```

#### 生产模式
```bash
# 构建前端
cd frontend
npm run build

# 启动后端
cd ../backend
node index.js
```

### 5. 访问应用
- 前端：http://localhost:5173
- 后端API：http://localhost:3000

## 📁 项目结构

```
web/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # Vue组件
│   │   │   ├── Card.vue     # 卡片组件
│   │   │   ├── MetroMap.vue # 地铁线路图
│   │   │   ├── ToolBar.vue  # 工具栏
│   │   │   └── ...
│   │   ├── styles/          # 样式文件
│   │   ├── types/           # TypeScript类型定义
│   │   └── App.vue          # 主应用组件
│   ├── public/              # 静态资源
│   └── package.json
├── backend/                  # 后端服务
│   ├── index.js             # 主服务器文件
│   ├── config.conf          # 配置文件
│   ├── metro-data.json      # 地铁线路数据
│   └── package.json
├── news/                     # 新闻公告文件
│   └── news/                # Markdown新闻文件
└── package.json
```

## 🔧 API接口

### 服务器状态
- `GET /api/server-status` - 获取服务器状态信息

### 新闻系统
- `GET /api/news` - 获取新闻列表
- `GET /api/news/get/:filename` - 获取指定新闻内容

### 地铁线路
- `GET /api/metro-map` - 获取地铁线路数据
- `GET /api/metro-map/svg?theme=dark|light` - 获取SVG格式的地铁图

## 🎨 主题定制

项目支持多种主题，可以通过以下方式切换：

1. **系统主题**：自动检测系统主题偏好
2. **手动切换**：点击浮动主题按钮
3. **样式主题**：点击浮动样式按钮切换不同主题风格

### 支持的主题
- 默认主题
- GitHub主题
- Dracula主题
- Solarized主题
- Nord主题

## 📝 新闻系统使用

### 创建新闻
在 `news/news/` 目录下创建 `.md` 文件，支持YAML前置数据：

```markdown
---
title: 新闻标题
author: 作者名
tags: [标签1, 标签2]
---

新闻内容支持完整的Markdown语法，包括：
- 数学公式：$E = mc^2$
- 代码块：```javascript
- 表格、列表等
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Express.js](https://expressjs.com/) - Node.js Web应用框架
- [minecraft-server-util](https://github.com/PassTheMayo/minecraft-server-util) - Minecraft服务器工具
- [KaTeX](https://katex.org/) - 数学公式渲染
- [Prism.js](https://prismjs.com/) - 代码语法高亮

---

**SparkPixel Server Dashboard** - 为Minecraft服务器提供现代化的监控体验 🎮 