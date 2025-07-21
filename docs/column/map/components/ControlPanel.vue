<template>
  <div class="control-panel">
    <!-- 控制头部 -->
    <div class="control-header">
      <h3>地图控制</h3>
    </div>

    <!-- 地图样式控制 -->
    <div class="control-section">
      <div class="section-title">地图样式</div>
      <el-radio-group 
        :model-value="mapStyle"
        @update:model-value="handleStyleChange"
        class="style-group"
      >
        <el-radio value="standard">标准</el-radio>
        <el-radio value="satellite">卫星</el-radio>
        <el-radio value="hybrid">混合</el-radio>
      </el-radio-group>
    </div>

    <!-- 缩放控制 -->
    <div class="control-section">
      <div class="section-title">缩放级别</div>
      <el-slider 
        :model-value="mapZoom"
        @update:model-value="handleZoomChange"
        :min="3"
        :max="20"
        :step="0.1"
        show-input
        class="zoom-slider"
      />
    </div>

    <!-- 快捷操作 -->
    <div class="control-section">
      <div class="section-title">快捷操作</div>
      <div class="quick-actions">
        <el-button @click="handleResetView" class="action-btn">
          <el-icon><Refresh /></el-icon>
          重置视图
        </el-button>
        
        <el-button @click="handleSaveView" class="action-btn">
          <el-icon><Star /></el-icon>
          保存视图
        </el-button>
        
        <el-button @click="handleFullscreen" class="action-btn">
          <el-icon><FullScreen /></el-icon>
          全屏
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, Star, FullScreen } from '@element-plus/icons-vue'

// Props
interface Props {
  mapStyle: string
  mapZoom: number
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'style-change', style: string): void
  (e: 'zoom-change', zoom: number): void
  (e: 'reset-view'): void
  (e: 'save-view'): void
  (e: 'fullscreen'): void
}

const emit = defineEmits<Emits>()

// 事件处理方法
const handleStyleChange = (style: string) => {
  emit('style-change', style)
}

const handleZoomChange = (zoom: number) => {
  emit('zoom-change', zoom)
}

const handleResetView = () => {
  emit('reset-view')
}

const handleSaveView = () => {
  emit('save-view')
}

const handleFullscreen = () => {
  emit('fullscreen')
}
</script>

<style scoped>
.control-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.control-header {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-primary);
}

.control-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.control-section {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.style-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.zoom-slider {
  margin-top: var(--space-2);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.action-btn {
  justify-content: flex-start;
  width: 100%;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
</style>
