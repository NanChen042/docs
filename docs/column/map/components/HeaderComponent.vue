<template>
  <div class="map-header">
    <div class="header-content">
      <div class="header-text">
        <h1>探索世界</h1>
        <p class="subtitle">发现身边的每一处精彩</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Search" round @click="onSearch">开始探索</el-button>
        <el-button plain :icon="Location" round @click="onLocate" :loading="isLocating">{{ isLocating ? '定位中...' : '附近地点' }}</el-button>
      </div>
    </div>
    <div class="header-backdrop"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Location } from '@element-plus/icons-vue'

// 定位状态
const isLocating = ref(false)

// 定义组件发出的事件
const emit = defineEmits(['search', 'locate'])

// 搜索按钮点击事件
const onSearch = () => {
  emit('search')
}

// 定位按钮点击事件
const onLocate = () => {
  isLocating.value = true
  emit('locate')

  // 模拟定位完成后重置状态
  setTimeout(() => {
    isLocating.value = false
  }, 2000)
}
</script>

<style scoped>
.map-header {
  position: relative;
  color: #fff;
  padding: 24px;
  overflow: hidden;
  z-index: 1;
  height: 140px;
}

.header-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-primary-light-3));
  opacity: 0.9;
  z-index: -1;
}

.header-content {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.header-text h1 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
}

.header-text .subtitle {
  font-size: 16px;
  opacity: 0.85;
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 更新头部定位按钮样式，添加加载状态 */
.header-actions .el-button.is-loading {
  background-color: var(--el-color-primary-light-5);
  border-color: var(--el-color-primary-light-5);
  color: white;
  pointer-events: none;
}
</style>
