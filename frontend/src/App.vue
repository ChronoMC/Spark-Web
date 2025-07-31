<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import yaml from 'js-yaml'
import MetroMap from './components/MetroMap.vue'
import MarkdownRenderer from './components/MarkdownRenderer.vue'
import Card from './components/Card.vue'
import './styles/themes.css'
import ToolBar from './components/ToolBar.vue'

const serverStatus = ref<any>(null);
// const metroMap = ref<any>({ lines: [] }); // 未使用，注释掉
const newsList = ref<any[]>([]);
const newsLoading = ref(false);
const currentTheme = ref<'dark' | 'light'>('dark');
const currentStyle = ref<'default' | 'github' | 'dracula' | 'solarized' | 'nord'>('github');

// 检测系统主题偏好
function detectSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

// 检查主题是否不匹配
function checkThemeMismatch() {
  const systemTheme = detectSystemTheme();
  const userTheme = currentTheme.value;
  const isMismatch = systemTheme !== userTheme;
  if (isMismatch) {
    document.body.classList.add('theme-mismatch');
  } else {
    document.body.classList.remove('theme-mismatch');
  }
}

// 监听系统主题变化
function setupThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  mediaQuery.addEventListener('change', (e) => {
    currentTheme.value = e.matches ? 'light' : 'dark';
    checkThemeMismatch();
  });
}

// 监听主题变化并派发事件
watch(currentTheme, (theme) => {
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
  checkThemeMismatch();
}, { immediate: true });

const showDialog = ref(false)
const dialogTitle = ref('')
const dialogAuthor = ref('')
const dialogTags = ref<string[]>([])
// const dialogContent = ref('') // 未使用，注释掉
const dialogRawContent = ref('')

function parseMarkdownWithYaml(text: string) {
  const match = text.match(/^---\s*([\s\S]*?)---\s*([\s\S]*)$/)
  if (match) {
    const yml = yaml.load(match[1]) || {}
    return {
      title: yml.title || '',
      author: yml.author || '',
      tags: yml.tags || [],
      content: match[2] || ''
    }
  } else {
    return { title: '', author: '', tags: [], content: text }
  }
}

async function openNews(filename: string) {
  const res = await fetch(`https://api.cdpyx.top/api/news/get/${filename}`)
  const text = await res.text()
  const parsed = parseMarkdownWithYaml(text)
  dialogTitle.value = parsed.title
  dialogAuthor.value = parsed.author
  dialogTags.value = parsed.tags
  dialogRawContent.value = parsed.content
  showDialog.value = true
}

// 主题切换函数
function cycleTheme() {
  const themes = ['default', 'github', 'dracula', 'solarized', 'nord']
  const currentIndex = themes.indexOf(currentStyle.value)
  const nextIndex = (currentIndex + 1) % themes.length
  currentStyle.value = themes[nextIndex] as any
}

// 获取主题图标
function getThemeIcon() {
  const icons = {
    'default': '🎨',
    'github': '🐙',
    'dracula': '🧛',
    'solarized': '☀️',
    'nord': '❄️'
  }
  return icons[currentStyle.value] || '🎨'
}

//跳转网页/下载
function jumpTo(url: string) {
  window.open(url, '_blank')
}



async function fetchAll() {
  // 服务器状态
  const statusRes = await fetch('https://api.cdpyx.top/api/server-status');
  serverStatus.value = await statusRes.json();
  // 新闻列表
  newsLoading.value = true;
  const newsRes = await fetch('https://api.cdpyx.top/api/news');
  newsList.value = (await newsRes.json()).news;
  newsLoading.value = false;
}

const addtoolButtons = ref([
  {
    icon: '🎮',
    text: '游戏指南',
    onClick: () => jumpTo('https://sparkpixel.net/guide'),
  },
  {
    icon: '🎯',
    text: '活动中心',
    onClick: () => jumpTo('https://sparkpixel.net/events'),
  },
  {
    icon: '🏆',
    text: '排行榜',
    onClick: () => jumpTo('https://sparkpixel.net/leaderboard'),
  },
  {
    icon: '🛠️',
    text: '技术支持',
    onClick: () => jumpTo('https://sparkpixel.net/support'),
  },
  {
    icon: '📢',
    text: '公告板',
    onClick: () => jumpTo('https://sparkpixel.net/announcements'),
  },
  {
    icon: '🎨',
    text: '皮肤商店',
    onClick: () => jumpTo('https://sparkpixel.net/skins'),
  },
  {
    icon: '💰',
    text: '充值中心',
    onClick: () => jumpTo('https://sparkpixel.net/recharge'),
  },
  {
    icon: '👥',
    text: '玩家群组',
    onClick: () => jumpTo('https://sparkpixel.net/groups'),
  },
]);

const toolButtons = ref([
  {
    icon: '🔗',
    text: '官方网站',
    onClick: () => jumpTo('https://sparkpixel.net'),
  },
  {
    icon: '📚',
    text: '文档中心',
    onClick: () => jumpTo('https://docs.sparkpixel.net'),
  },
  {
    icon: '💬',
    text: '社区论坛',
    onClick: () => jumpTo('https://forum.sparkpixel.net'),
  },
  {
    img: new URL('./assets/add-tool-bar.png', import.meta.url).href,
    text: '展开工具栏',
    onClick: () => expandToolbar(),
  },
  // 可继续添加更多按钮
]);

const toolbarExpanded = ref(false);

function expandToolbar() {
  if (toolbarExpanded.value) return; // 已经展开过就不再追加
  toolbarExpanded.value = true;
  toolButtons.value = [
    ...toolButtons.value.filter(btn => btn.text !== '展开工具栏'),
    ...addtoolButtons.value,
    {
      img: new URL('./assets/add-tool-bar.png', import.meta.url).href,
      text: '收起工具栏',
      onClick: () => collapseToolbar(),
    }
  ];
}

function collapseToolbar() {
  toolbarExpanded.value = false;
  toolButtons.value = [
    {
      icon: '🔗',
      text: '官方网站',
      onClick: () => jumpTo('https://sparkpixel.net'),
    },
    {
      icon: '📚',
      text: '文档中心',
      onClick: () => jumpTo('https://docs.sparkpixel.net'),
    },
    {
      icon: '💬',
      text: '社区论坛',
      onClick: () => jumpTo('https://forum.sparkpixel.net'),
    },
    {
      img: new URL('./assets/add-tool-bar.png', import.meta.url).href,
      text: '展开工具栏',
      onClick: () => expandToolbar(),
    },
  ];
}

onMounted(() => {
  // 初始化系统主题
  currentTheme.value = detectSystemTheme();
  // 设置主题监听器
  setupThemeListener();
  // 检查主题匹配状态
  checkThemeMismatch();
  fetchAll();
  // 确保初始主题立即生效
  window.dispatchEvent(new CustomEvent('theme-change', { detail: currentTheme.value }));
});

// 展开工具栏函数
</script>

<template>
  <div class="wide-layout" :class="[`${currentStyle}-theme`, currentTheme === 'dark' ? 'dark' : '', 'theme-markdown']">
    <div class="page-title">SparkPixel Server</div>
    <div class="content-container">
      <div class="main-left">
        <Card title="服务器状态" type="status" >
          <div v-if="serverStatus" class="status-content">
            <div v-if="serverStatus.online" class="status-online">
              <div class="status-header">
              <span class="online-dot"></span>
              <span class="online-text">在线</span>
              </div>
              <div class="status-info">
              <span class="version">版本: {{ serverStatus.version?.name }}</span>
              <span class="players">人数: {{ serverStatus.players?.online }}/{{ serverStatus.players?.max }}</span>
              </div>
            </div>
            <div v-else class="status-offline">
              <div class="offline-text">离线</div>
            </div>
          </div>
          <div v-else class="status-loading">加载中...</div>
        </Card>
        <Card title="地铁线路" type="metro" style="font-size: 1.5em;text-align: center">
          <MetroMap :theme="currentTheme" />
        </Card>
      </div>
      <div class="main-right">
        <Card title="工具栏" type="tools">
          <ToolBar :buttons="toolButtons" />
        </Card>
        <Card title="新闻公告" type="news">
          <template #title-icon>📰</template>
          <div v-if="newsLoading">加载中...</div>
          <ul v-else class="news-list">
            <li
              v-for="n in newsList"
              :key="n.filename"
              class="news-item"
              @click="openNews(n.filename)"
              style="cursor:pointer"
            >
              <div class="news-title">{{ n.title }}</div>
              <div class="news-meta">by {{ n.author }}</div>
              <div class="news-abstract">{{ n.abstract }}</div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
    <!-- 新闻详情弹窗 -->
    <div v-if="showDialog" class="news-dialog-mask" @click.self="showDialog = false">
      <div class="news-dialog">
        <div class="news-dialog-title">
          {{ dialogTitle }}
          <span class="news-dialog-close" @click="showDialog = false">×</span>
        </div>
        <div class="news-dialog-meta">
          <span class="meta-icon">📰</span>
          <span class="news-dialog-author">by {{ dialogAuthor }}</span>
          <div v-if="dialogTags.length > 0" class="news-dialog-tags">
            <span v-for="tag in dialogTags" :key="tag" class="news-tag">{{ tag }}</span>
          </div>
        </div>
        <div class="news-dialog-content">
          <MarkdownRenderer :content="dialogRawContent" />
        </div>
      </div>
    </div>
    <!-- 圆形主题切换按钮 -->
    <button @click="currentTheme = currentTheme === 'dark' ? 'light' : 'dark'" class="floating-theme-btn">
      {{ currentTheme === 'dark' ? '🌙' : '☀️' }}
    </button>
    <!-- 样式切换按钮 -->
    <button @click="cycleTheme" class="floating-style-btn">
      {{ getThemeIcon() }}
    </button>
  </div>
</template>

<style scoped>
.wide-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  /* min-width: 100%; */ /* 移除可能导致问题的 min-width */
  width: 100%; /* 使用 width 确保占满容器 */
  max-width: 2000px;
  margin: 0 auto;
  max-height: 100%; /* 修复：添加单位 */
  height: 100%;
  padding: 20px; /* 添加基础内边距 */
}

.page-title {
  font-size: 3.5em;
  font-weight: bold;
  color: var(--text-accent);
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 12px;
  text-shadow: 0 2px 12px var(--shadow-color);
  background: linear-gradient(to right, var(--text-accent), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.content-container {
  display: flex;

  width: 100%;
  /* max-width: 1400px; */ /* 考虑移除或根据需要调整，避免限制主容器 */
  align-items: flex-start;
  justify-content: center; /* 居中对齐两列 */
  margin: 0 auto;
}

.main-left,
.main-right {
  flex: 0 0 auto; /* 不放大，不缩小，保持内容大小 */
  min-width: 0; /* 防止内容溢出 */
  /* 移除 min-width: 100%; 这是导致卡片无法并排的主要原因 */
  display: flex;
  flex-direction: column;
  padding: 10px 50px;
  gap: 20px;
  align-items: center; /* 居中对齐卡片 */
}

/* 卡片通用样式 */
.big-card {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: 0 4px 24px var(--shadow-color);
  padding: 1em;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  width: 520px; /* 固定宽度为520px */
  /* flex: 1; */ /* 卡片本身通常不需要 flex: 1，除非需要填充父容器 */
}

/* 服务器状态卡片 */
.status-card {
  flex: 0 0 auto; /* 不放大，不缩小，基础大小由内容决定 */
  min-height: 120px; /* 保持最小高度 */
}

.card-title {
  color: var(--text-accent);
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 1.2em;
  letter-spacing: 1px;
}

.status-card .online-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4caf50;
  margin-right: 0.5em;
  vertical-align: middle;
}

.status-card .online-text {
  color: #4caf50;
  margin-right: 1em;
  font-weight: bold;
}

.status-card .offline-text {
  color: #e53935;
  font-weight: bold;
}

/* 服务器状态内容样式 */
.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  /* padding: 2em; */
}

.status-online {
  display: flex;
  flex-direction: column;
  align-items: center;

}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
}

.status-offline {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.status-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.status-card .version,
.status-card .players {
  color: var(--text-secondary);
  font-size: 1.1em;
  text-align: center;
}

/* 地铁线路卡片 */
.metro-card {
  min-height: 600px;
  /* max-height: 900px; */ /* 考虑移除或使用 flex */
  display: flex;
  flex-direction: column;
  flex: 1; /* 允许放大以填充空间 */
}
/* .metro-card .metro-line, .metro-card .line-name, .metro-card .stations { */ /* 这些样式似乎未在模板中直接使用 */
/*   ... */
/* } */


/* 工具栏卡片 */
.tools-card {
  width: 520px; /* 固定宽度为520px */
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: 0 4px 24px var(--shadow-color);
  padding: 2em;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 新闻卡片 */
.news-card {
  /* max-width: 900px; */ /* 移除，让卡片适应容器 */
  width: 520px; /* 固定宽度为520px */
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: 0 4px 24px var(--shadow-color);
  padding: 0;
  margin-bottom: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1; /* 允许放大 */
}

.news-list {
  list-style: none;
  padding: 0 2em 3em 2em;
  margin: 0;
  overflow-y: auto;
  flex: 1; /* 填充剩余空间 */
  scrollbar-width: thin;
  scrollbar-color: #adb5bd transparent;
  /* max-height: calc(900px - 120px); */ /* 移除基于固定高度的计算，使用 flex */
}

.news-item {
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 2px 12px var(--shadow-color);
  margin-bottom: 2em;
  padding: 1.7em 1.5em 1.2em 1.5em;
  color: var(--text-secondary);
  transition: box-shadow 0.2s, transform 0.2s;
  border-left: 6px solid var(--text-accent);
  position: relative;
}

.news-item:last-child {
  margin-bottom: 0;
}

.news-item:hover {
  box-shadow: 0 8px 32px #0006;
  transform: translateY(-2px) scale(1.01);
}

.news-title {
  font-size: 1.35em;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.5em;
  letter-spacing: 1px;
}

.news-meta {
  color: var(--text-accent);
  font-size: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.news-abstract {
  color: var(--text-secondary);
  font-size: 1.08em;
  margin-top: 0.5em;
}

.news-dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-dialog {
  background: var(--bg-card);
  border-radius: 16px;
  text-align: left;
  box-shadow: 0 8px 32px var(--shadow-large);
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  overflow: auto;
  padding: 2em 1.5em 1.5em 1.5em;
  color: var(--text-primary);
  position: relative;
  animation: popin 0.2s;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-secondary);
}

@keyframes popin {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.news-dialog-title {
  font-size: 1.3em;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-dialog-close {
  font-size: 1.5em;
  cursor: pointer;
  color: var(--text-secondary);
  margin-left: 1em;
  transition: color 0.2s;
}

.news-dialog-close:hover {
  color: var(--text-accent);
}

.news-dialog-meta {
  display: flex;
  align-items: center;
  gap: 1em;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
}

.news-dialog-author {
  color: var(--text-accent);
  font-weight: bold;
  font-size: 1em;
}

.news-dialog-tags {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}

.news-tag {
  background: var(--accent-color);
  color: #fff;
  padding: 0.3em 0.8em;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
  transition: all 0.2s ease;
}

.news-tag:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.news-dialog-content {
  font-size: 1.08em;
  line-height: 1.7;
  color: var(--text-primary);
}

.meta-icon {
  display: flex;
  align-items: center;
  margin-right: 0.5em;
  font-size: 1.2em;
}

/* 响应式设计 */
@media (max-width: 1100px) {
  .wide-layout {
    flex-direction: column;
    gap: 24px;
    padding: 24px 8px; /* 侧边距减小 */
  }

  .content-container {
    flex-direction: column;
    gap: 24px;
  }

  .main-left,
  .main-right {
    width: 100%;
    /* max-width: 100%; */ /* 通常默认就是 */
    /* padding:100px; */ /* 修复：过大，导致内容区域过小 */
    padding: 20px; /* 修复：更合理的值，适用于移动端 */
    /* flex: unset; */ /* 修复：可能不合适，移除 flex 属性 */
    flex: 1 1 auto; /* 修复：保持 Flexbox 行为，允许放大和缩小 */
  }
}

/* 主题切换按钮样式 */
.theme-toggle {
  text-align: center;
  margin-bottom: 16px;
}

.theme-btn {
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.theme-btn:hover {
  background: #ffb74d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

/* 浮动圆形主题切换按钮 */
.floating-theme-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-accent);
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--shadow-color);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.floating-theme-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px var(--shadow-color);
  background: var(--text-accent);
  color: #fff;
  border-color: var(--text-accent);
}

/* 样式切换按钮 */
.floating-style-btn {
  position: fixed;
  bottom: 30px;
  right: 100px; /* 确保与主题按钮有一定距离 */
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-accent);
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--shadow-color);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.floating-style-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px var(--shadow-color);
  background: var(--text-accent);
  color: #fff;
  border-color: var(--text-accent);
}
</style>
