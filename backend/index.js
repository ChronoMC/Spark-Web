const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const mcutil = require('minecraft-server-util');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const yamlFront = require('yaml-front-matter');

// 读取 config.conf
function readConfig() {
  const configPath = path.join(__dirname, 'config.conf');
  const content = fs.readFileSync(configPath, 'utf-8');
  const config = {};
  content.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) config[key.trim()] = value.trim();
    }
  });
  return config;
}

const config = readConfig();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// 服务器状态 API
app.get('/api/server-status', async (req, res) => {
  try {
    const result = await mcutil.status(config.server_address, parseInt(config.server_port));
    
    // 打印服务器状态和玩家信息
    console.log('=== 服务器状态 ===');
    console.log(`在线状态: ${result.online ? '在线' : '离线'}`);
    console.log(`版本: ${result.version?.name || '未知'}`);
    console.log(`在线人数: ${result.players?.online || 0}/${result.players?.max || 0}`);
    
    if (result.players?.list && result.players.list.length > 0) {
      console.log('在线玩家:');
      result.players.list.forEach((player, index) => {
        console.log(`  ${index + 1}. ${player.name || player}`);
      });
    } else {
      
        console.log(result.players?.sample);
    }
    console.log('==================');
    
    res.json({ online: true, players: result.players, version: result.version });
  } catch (e) {
    console.log('服务器状态检查失败:', e.message);
    res.json({ online: false, error: e.message });
  }
});

// 玩家列表 API
app.get('/api/players', async (req, res) => {
  try {
    const result = await mcutil.status(config.server_address, parseInt(config.server_port));
    // 彻底展开打印所有内容
    console.log(JSON.stringify(result.players, null, 2));
    res.json({ players: result.players });
  } catch (e) {
    res.status(500).json({ error: '获取玩家列表失败', detail: e.message });
  }
});

// 地铁线路/地图 API（读取 metro-data.json）
app.get('/api/metro-map', async (req, res) => {
  try {
    const data = await readFile(path.join(__dirname, 'metro-data.json'), 'utf-8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (e) {
    res.status(500).json({ error: '无法读取地铁数据', detail: e.message });
  }
});

// 地铁线路SVG API - 支持深色/浅色主题
app.get('/api/metro-map/svg', async (req, res) => {
    try {
      // 获取主题模式参数，默认为深色模式
      const theme = req.query.theme || 'dark';
      
      let json;
      try {
        const data = await readFile(path.join(__dirname, 'metro-data.json'), 'utf-8');
        json = JSON.parse(data);
      } catch (e) {
        console.error('读取地铁数据失败:', e.message);
        res.status(500).json({ error: '无法读取地铁数据', detail: e.message });
        return;
      }
  
      const nodes = json.graph.nodes || [];
      const edges = json.graph.edges || [];
      const padding = 40;
  
      // 使用地铁数据文件中的坐标范围
      const viewBoxMin = json.svgViewBoxMin || { x: 0, y: 0 };
      const viewBoxZoom = json.svgViewBoxZoom || 60;
      
      // 计算边界
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const node of nodes) {
        const { x, y } = node.attributes;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
  
      const bboxWidth = maxX - minX;
      const bboxHeight = maxY - minY;
      const width = bboxWidth + padding * 2;
      const height = bboxHeight + padding * 2;
      const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;
  
      // 主题配色配置
      const themeColors = {
        dark: {
          background: 'transparent',
          stationFill: '#ffffff',
          stationStroke: '#393332',
          textFill: '#ffffff',
          textStroke: '#000000',
          textStrokeWidth: '0.5'
        },
        light: {
          background: 'transparent',
          stationFill: '#ffffff',
          stationStroke: '#393332',
          textFill: '#000000',
          textStroke: '#ffffff',
          textStrokeWidth: '0.5'
        }
      };
      
      const colors = themeColors[theme];
      
      // 工具函数：转义 XML
      function esc(s) {
        return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      }
  
      // 渲染线路
      function renderEdge(edge, nodes) {
        const { source, target, attributes } = edge;
        const src = nodes.find(n => n.key === source);
        const tgt = nodes.find(n => n.key === target);
        if (!src || !tgt) return '';
        const x1 = src.attributes.x;
        const y1 = src.attributes.y;
        const x2 = tgt.attributes.x;
        const y2 = tgt.attributes.y;
        const color = attributes['single-color']?.color?.[2] || '#E3002B';
        return `<path id="${edge.key}" d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" />`;
      }
  
      // 渲染站点
      function renderStation(node) {
        const { key, attributes } = node;
        const { x, y, type } = attributes;
        const names = attributes[type]?.names || [];
        const nameOffsetX = attributes[type]?.nameOffsetX === 'right' ? 15 : -15;
  
        let svg = `<g id="${key}" transform="translate(${x}, ${y})">`;
  
        // 根据站点类型渲染不同的圆圈
        if (type === 'shmetro-osysi') {
          // 换乘站：双圆圈
          svg += `<circle r="6" stroke="${colors.stationStroke}" stroke-width="2" fill="${colors.stationFill}" />`;
          svg += `<circle r="3" stroke="${colors.stationStroke}" stroke-width="1" fill="${colors.stationFill}" />`;
        } else {
          // 普通站：单圆圈
          svg += `<circle r="5" stroke="${colors.stationStroke}" stroke-width="1.5" fill="${colors.stationFill}" />`;
        }

        // 渲染站点名称
        if (names.length) {
          svg += `<g transform="translate(${nameOffsetX}, -15)" text-anchor="${nameOffsetX > 0 ? 'start' : 'end'}" stroke-width="${colors.textStrokeWidth}" paint-order="stroke" stroke="${colors.textStroke}" stroke-linejoin="round">`;
          svg += `<text dy="-1" dx="0" dominant-baseline="auto" font-size="12" font-family="SimHei, STHeiti, PingFang SC, sans-serif" fill="${colors.textFill}">${esc(names[0])}</text>`;
          if (names[1]) {
            svg += `<text dy="1" dx="1" dominant-baseline="hanging" font-size="8" font-family="Arial, sans-serif" fill="${colors.textFill}">${esc(names[1])}</text>`;
          }
          svg += `</g>`;
        }
        svg += `</g>`;
        return svg;
      }
  
      // 渲染徽章
      function renderBadge(node) {
        const { key, attributes } = node;
        const { x, y } = attributes;
        const badge = attributes['suzhourt-num-line-badge'];
        const color = badge?.color?.[2] || '#00a1e9';
        const num = badge?.num || '1';
        return `<g id="${key}" transform="translate(${x}, ${y})">
          <rect fill="${color}" width="18" height="18" rx="2" ry="2" />
          <text font-family="SimHei, STHeiti, PingFang SC, sans-serif" text-anchor="middle" dominant-baseline="middle" x="9" y="10" font-size="12" fill="white" font-weight="bold">${num}</text>
        </g>`;
      }
  
      // 构造 SVG
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">`;
  
      // 渲染线路
      for (const edge of edges) {
        svg += renderEdge(edge, nodes);
      }
  
      // 渲染节点
      for (const node of nodes) {
        if (node.attributes.type === 'suzhourt-num-line-badge') {
          svg += renderBadge(node);
        } else {
          svg += renderStation(node);
        }
      }
  
      svg += `</svg>`;
  
      res.set('Content-Type', 'image/svg+xml');
      res.send(svg);
    } catch (e) {
      console.error('生成地铁SVG失败:', e.message);
      res.status(500).json({ error: '无法生成地铁SVG', detail: e.message });
    }
  });
// 新闻/公告 API（只返回 yml 头部信息）
app.get('/api/news', async (req, res) => {
  try {
    const newsDir = path.join(__dirname, '../news');
    const files = await readdir(newsDir);
    const news = await Promise.all(files.filter(f => f.endsWith('.md')).map(async file => {
      const content = await readFile(path.join(newsDir, file), 'utf-8');
      const yml = yamlFront.loadFront(content);
      return {
        title: yml.title || '',
        abstract: yml.abstract || '',
        author: yml.author || '',
        filename: file.replace(/\.md$/, '')
      };
    }));
    res.json({ news });
  } catch (e) {
    res.status(500).json({ error: '无法读取新闻', detail: e.message });
  }
});

// 新闻全文 API
app.get('/api/news/get/:filename', async (req, res) => {
  try {
    const newsDir = path.join(__dirname, '../news');
    const file = req.params.filename + '.md';
    const content = await readFile(path.join(newsDir, file), 'utf-8');
    res.type('text/markdown').send(content);
  } catch (e) {
    res.status(404).json({ error: '未找到该新闻', detail: e.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});