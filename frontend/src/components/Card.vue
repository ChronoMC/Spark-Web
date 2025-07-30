<template>
  <div class="big-card" :class="cardClass">
    <div v-if="title" class="card-title">
      <slot name="title-icon"></slot>
      {{ title }}
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  type?: 'status' | 'metro' | 'news' | 'tools'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  type: undefined
})

const cardClass = computed(() => {
  if (props.type) {
    return `${props.type}-card`
  }
  return ''
})
</script>

<style scoped>
/* 新闻卡片的特殊标题样式 */
.news-card .card-title {
  display: flex;
  align-items: center;
  gap: 0.5em;
  border-bottom: 2px solid var(--border-color);
  padding: 2em 2em 2em 2em;
  margin-bottom: 0;
  font-size: 1.5em;
  background: var(--bg-card);
  z-index: 100;
  border-radius: 20px 20px 0 0;
  flex-shrink: 0;
}
.big-card {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}
</style> 