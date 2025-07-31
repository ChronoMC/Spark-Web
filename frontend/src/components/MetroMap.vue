<template>
  <div class="metro-map-container">
    <img
      src="https://api.cdpyx.top/api/metro-map/svg"
      alt="Metro Map"
      class="metro-map-img"
    />
  </div>
</template>

<script setup lang="ts">
// 组件不需要props，直接使用
</script>

<style scoped>
.metro-map-container {
  width: 100%;
  flex: 1;
  min-height: 500px;
  background: var(--bg-card); /* 继承父卡片背景色 */
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 4px 20px #0006;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  height: 100%;
}
.metro-map-img {
  width: 100%;
  height: 100%;
  max-height: 550px;
  object-fit: contain; /* 保证SVG完整显示且平铺 */
  background: var(--bg-card); /* 图片背景也使用卡片背景色 */
  display: block;
}


</style> 
