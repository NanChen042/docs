<template>
  <div class="map-controls">
    <!-- 缩放控件 -->
    <div class="zoom-controls">
      <el-button 
        circle 
        @click="handleZoomIn" 
        class="control-btn"
        :title="'放大'"
      >
        <el-icon>
          <ZoomIn />
        </el-icon>
      </el-button>
      
      <el-button 
        circle 
        @click="handleZoomOut" 
        class="control-btn"
        :title="'缩小'"
      >
        <el-icon>
          <ZoomOut />
        </el-icon>
      </el-button>
    </div>
    
    <!-- 定位按钮 -->
    <el-button 
      circle 
      @click="handleGoToUserLocation" 
      class="location-btn"
      :title="'定位到我的位置'"
      :loading="isLocating"
    >
      <el-icon>
        <Position />
      </el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ZoomIn, ZoomOut, Position } from '@element-plus/icons-vue'

// Emits
interface Emits {
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'go-to-user-location'): void
}

const emit = defineEmits<Emits>()

// 本地状态
const isLocating = ref<boolean>(false)

// 事件处理方法
const handleZoomIn = () => {
  emit('zoom-in')
}

const handleZoomOut = () => {
  emit('zoom-out')
}

const handleGoToUserLocation = async () => {
  isLocating.value = true
  try {
    emit('go-to-user-location')
  } finally {
    setTimeout(() => {
      isLocating.value = false
    }, 1000)
  }
}
</script>

<style scoped>
.map-controls {
  position: absolute;
  top: var(--space-5);
  right: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: 5;
}

.zoom-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  background-color: var(--glass-bg);
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
}

.control-btn {
  width: var(--space-10);
  height: var(--space-10);
  border: none !important;
  transition: all var(--transition-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-full);
}

.control-btn:hover {
  transform: scale(1.1);
  background-color: var(--bg-highlight);
  color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.location-btn {
  width: var(--space-12);
  height: var(--space-12);
  background: var(--gradient-primary);
  color: var(--text-inverse);
  border: none !important;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-xl);
}

.location-btn:active {
  transform: scale(0.95);
}

.location-btn.is-loading {
  pointer-events: none;
}
</style>
