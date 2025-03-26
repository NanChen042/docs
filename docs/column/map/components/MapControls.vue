<template>
  <div class="map-controls">
    <!-- 缩放控制 -->
    <div class="control-group">
      <el-button
        class="control-button"
        circle
        @click="handleZoomIn"
        :disabled="zoomLevel >= maxZoom"
      >
        <el-icon><ZoomIn /></el-icon>
      </el-button>
      <el-button
        class="control-button"
        circle
        @click="handleZoomOut"
        :disabled="zoomLevel <= minZoom"
      >
        <el-icon><ZoomOut /></el-icon>
      </el-button>
    </div>

    <!-- 定位和视图控制 -->
    <div class="control-group">
      <el-button
        class="control-button"
        circle
        @click="handleLocate"
        :loading="locating"
      >
        <el-icon><Aim /></el-icon>
      </el-button>
      <el-button
        class="control-button"
        circle
        @click="toggleMapType"
      >
        <el-icon><View /></el-icon>
      </el-button>
    </div>

    <!-- 辅助功能 -->
    <div class="control-group">
      <el-button
        class="control-button"
        circle
        @click="toggleFullscreen"
      >
        <el-icon><FullScreen v-if="!isFullscreen" /><Close v-else /></el-icon>
      </el-button>
      <el-button
        class="control-button"
        circle
        @click="handleReset"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ZoomIn,
  ZoomOut,
  Aim,
  View,
  FullScreen,
  Close,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  zoomLevel: {
    type: Number,
    default: 12
  },
  minZoom: {
    type: Number,
    default: 3
  },
  maxZoom: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits([
  'zoom-in',
  'zoom-out',
  'locate',
  'toggle-map-type',
  'reset-view',
  'fullscreen-change'
])

// 状态
const locating = ref(false)
const isFullscreen = ref(false)

// 缩放控制
const handleZoomIn = () => {
  emit('zoom-in')
}

const handleZoomOut = () => {
  emit('zoom-out')
}

// 定位
const handleLocate = () => {
  locating.value = true

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        emit('locate', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        locating.value = false
      },
      (error) => {
        console.error('获取位置失败', error)
        ElMessage.error('无法获取当前位置，请检查位置权限设置')
        locating.value = false
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  } else {
    ElMessage.error('您的浏览器不支持地理定位')
    locating.value = false
  }
}

// 切换地图类型
const toggleMapType = () => {
  emit('toggle-map-type')
}

// 重置视图
const handleReset = () => {
  emit('reset-view')
}

// 全屏控制
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
      emit('fullscreen-change', true)
    }).catch(err => {
      ElMessage.error(`无法进入全屏: ${err.message}`)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false
        emit('fullscreen-change', false)
      }).catch(err => {
        ElMessage.error(`无法退出全屏: ${err.message}`)
      })
    }
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  emit('fullscreen-change', isFullscreen.value)
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.map-controls {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 2;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.control-button {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-primary);
  box-shadow: none;
  transition: all 0.3s;
}

.control-button:hover {
  transform: scale(1.05);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

/* 媒体查询 - 移动设备适配 */
@media screen and (max-width: 768px) {
  .map-controls {
    bottom: 80px;
    right: 10px;
    top: auto;
    transform: none;
  }

  .control-group {
    padding: 6px;
  }

  .control-button {
    width: 32px;
    height: 32px;
  }
}
</style>
