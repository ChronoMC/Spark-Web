# GitHub Actions 工作流说明

本项目包含多个GitHub Actions工作流文件，用于自动构建和部署前端应用。

## 工作流文件

### 1. `deploy.yml` - 基础部署工作流
- **触发条件**：推送到 main/master 分支或创建 Pull Request
- **功能**：构建前端并将dist文件推送到dist分支
- **特点**：使用原生Git命令进行部署

### 2. `deploy-safe.yml` - 安全部署工作流
- **触发条件**：推送到 main/master 分支或手动触发
- **功能**：构建前端并使用专门的deploy action部署到dist分支
- **特点**：更安全，使用artifacts传递构建文件

### 3. `deploy-simple.yml` - GitHub Pages部署工作流
- **触发条件**：推送到 main/master 分支或手动触发
- **功能**：构建前端并部署到GitHub Pages
- **特点**：使用GitHub Pages官方action，最稳定

### 4. `deploy-dist-branch.yml` - dist分支部署工作流
- **触发条件**：推送到 main/master 分支或手动触发
- **功能**：构建前端并推送到dist分支
- **特点**：专门为dist分支设计，权限配置正确

### 5. `deploy-reliable.yml` - 可靠部署工作流（推荐）
- **触发条件**：推送到 main/master 分支或手动触发
- **功能**：构建前端并推送到dist分支
- **特点**：更可靠的Git操作，处理分支冲突

## 使用方法

### 自动部署
1. 推送代码到 `main` 或 `master` 分支
2. GitHub Actions 会自动触发构建和部署
3. 构建完成后，dist文件会被推送到 `dist` 分支

### 手动部署
1. 在GitHub仓库页面，点击 "Actions" 标签
2. 选择 "Build and Deploy Frontend (Safe)" 工作流
3. 点击 "Run workflow" 按钮
4. 选择要部署的分支，点击 "Run workflow"

## 配置要求

### 仓库设置
1. 确保仓库有 `main` 或 `master` 分支
2. 确保GitHub Actions有写入权限

### 分支保护（可选）
如果启用了分支保护规则，需要：
1. 允许GitHub Actions推送到受保护的分支
2. 或者使用Personal Access Token（需要配置secrets）

## 部署结果

部署成功后：
- `dist` 分支将包含构建后的静态文件
- 可以通过 `https://your-username.github.io/your-repo/` 访问（如果启用了GitHub Pages）
- 或者将 `dist` 分支部署到其他静态文件托管服务

## 故障排除

### 常见问题
1. **构建失败**：检查前端依赖是否正确安装
2. **部署失败**：检查GitHub Actions权限设置
3. **文件路径错误**：确保前端构建输出目录为 `frontend/dist/`
4. **分支冲突**：使用 `deploy-reliable.yml` 工作流处理Git引用锁问题

### Git引用锁问题解决
如果遇到 `cannot lock ref` 错误：
1. 使用 `deploy-reliable.yml` 工作流
2. 确保只有一个工作流在运行
3. 检查并发控制配置
4. 手动删除dist分支后重新部署

### 调试步骤
1. 查看Actions页面的详细日志
2. 检查Node.js版本兼容性
3. 验证package.json中的构建脚本

## 自定义配置

### 修改触发条件
编辑工作流文件中的 `on` 部分：
```yaml
on:
  push:
    branches: [ main, master, develop ]  # 添加更多分支
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:  # 允许手动触发
```

### 修改Node.js版本
编辑 `node-version` 参数：
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 修改版本号
```

### 添加环境变量
在构建步骤中添加环境变量：
```yaml
- name: Build frontend
  run: |
    cd frontend
    npm run build
  env:
    NODE_ENV: production
    VITE_API_URL: ${{ secrets.API_URL }}
``` 