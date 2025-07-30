<template>
  <div class="tool-bar">
    <ToolButton
      v-for="(btn, i) in buttons"
      :key="i"
      :img="btn.img"
      :icon="btn.icon"
      :text="btn.text"
      @click="btn.onClick"
    />
  </div>
</template>

<script setup lang="ts">
import ToolButton from './ToolButton.vue'
import { defineProps } from 'vue'

interface ToolBtn {
  img?: string
  icon?: string
  text: string
  onClick: () => void
}
defineProps<{ buttons: ToolBtn[] }>()
</script>

<style scoped>
.tool-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1em 0.2em;
  padding: 1em 0.4em 0.2em 1em;
}
</style> 