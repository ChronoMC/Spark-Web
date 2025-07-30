<template>
  <button class="tool-btn" @click="$emit('click')">
    <div class="tool-btn-img">
      <img v-if="img" :src="img" alt="icon" />
      <span v-else-if="icon" class="tool-btn-emoji">{{ icon }}</span>
    </div>
    <div class="tool-btn-text">{{ text }}</div>
  </button>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'
const props = withDefaults(defineProps<{
  img?: any
  icon?: string
  text: string
}>(), {
  img: '',
  icon: ''
})
</script>

<style scoped>
.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-card);
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 8px var(--shadow-color);
  padding: 0.5em 0em 0.5em 0em;
  margin: auto;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  width: 85px;
  height: 85px;
}
.tool-btn:hover {
  box-shadow: 0 6px 18px var(--shadow-color);
  transform: translateY(-2px) scale(1.04);
}
.tool-btn-img {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5em;
}
.tool-btn-img img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
}
.tool-btn-emoji {
  font-size: 2em;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tool-btn-text {
  font-size: 11px;
  color: var(--text-primary);
  margin-top: 0.4em;
  margin-bottom: 5px;
  text-align: center;
  word-break: break-all;
}
</style> 