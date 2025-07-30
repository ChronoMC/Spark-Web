# 构建问题修复说明

## 问题描述
在构建过程中遇到 `crypto.hash is not a function` 错误，这是由于Vite和Vue插件版本不兼容导致的。

## 解决方案

### 1. 更新依赖版本
已将以下依赖版本调整为兼容版本：
- `vite`: `^7.0.4` → `^5.0.0`
- `@vitejs/plugin-vue`: `^6.0.0` → `^5.0.0`
- `vue`: `^3.5.17` → `^3.4.0`

### 2. 清理并重新安装依赖
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 3. 验证构建
```bash
npm run build
```

## 版本兼容性说明

### 推荐的版本组合
- **Vite**: 5.x
- **@vitejs/plugin-vue**: 5.x
- **Vue**: 3.4.x
- **Node.js**: 18+

### 避免的版本组合
- Vite 7.x + @vitejs/plugin-vue 6.x (不兼容)
- Vue 3.5.x + 较旧的Vite版本

## GitHub Actions 更新

工作流文件已更新为：
1. 删除现有的 `node_modules` 和 `package-lock.json`
2. 重新安装依赖以确保版本兼容性
3. 使用 `npm install` 而不是 `npm ci`

## 故障排除

如果仍然遇到构建问题：

1. **检查Node.js版本**：确保使用Node.js 18+
2. **清理缓存**：`npm cache clean --force`
3. **删除锁文件**：删除 `package-lock.json` 并重新安装
4. **检查Vite配置**：确保 `vite.config.ts` 配置正确

## 相关链接
- [Vite 5.x 迁移指南](https://vitejs.dev/guide/migration)
- [Vue 3.4 更新日志](https://blog.vuejs.org/posts/vue-3-4)
- [@vitejs/plugin-vue 兼容性](https://github.com/vitejs/vite-plugin-vue) 