#!/bin/bash

# 删除现有的node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install

echo "Dependencies updated successfully!" 