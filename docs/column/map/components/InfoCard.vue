<template>
  <transition name="fade">
    <el-card v-if="location" class="info-card">
      <template #header>
        <div class="card-header">
          <span>选中的位置</span>
          <el-button text @click="handleClose">
            <el-icon>
              <Close />
            </el-icon>
          </el-button>
        </div>
      </template>
      
      <div class="card-content">
        <!-- 位置名称 -->
        <div v-if="location.name && location.name !== '选中位置'" class="location-name">
          <strong>{{ location.name }}</strong>
        </div>
        
        <!-- 坐标信息 -->
        <div class="coordinates">
          <strong>坐标：</strong>
          <span>{{ formatCoordinates(location) }}</span>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions">
          <el-button type="primary" @click="handleSave">
            <el-icon>
              <Flag />
            </el-icon>
            保存位置
          </el-button>
          
          <el-button @click="handleCopy">
            <el-icon>
              <Document />
            </el-icon>
            复制坐标
          </el-button>
        </div>
      </div>
    </el-card>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close, Flag, Document } from '@element-plus/icons-vue'
import type { Location } from '../composables'

// Props
interface Props {
  location: Location | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'close'): void
  (e: 'save'): void
  (e: 'copy'): void
}

const emit = defineEmits<Emits>()

// 计算属性
const formatCoordinates = (location: Location): string => {
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

// 事件处理方法
const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  emit('save')
}

const handleCopy = () => {
  emit('copy')
}
</script>

<style scoped>
.info-card {
  position: absolute;
  right: var(--space-5);
  top: var(--space-20);
  width: 320px;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-xl) !important;
  border: none !important;
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
  background-color: var(--glass-bg) !important;
  transition: all var(--transition-normal);
  z-index: 1000 !important;
  pointer-events: auto !important;
  transform: translateZ(0);
}

.info-card * {
  pointer-events: auto !important;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-primary-200), transparent);
  border-radius: 0 0 0 100%;
  opacity: 0.5;
  z-index: 0;
}

.info-card :deep(.el-card__header) {
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-light);
  background: var(--gradient-primary);
  color: var(--text-inverse);
}

.info-card :deep(.el-card__body) {
  padding: 15px;
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  font-size: var(--text-lg);
  color: var(--text-inverse) !important;
}

.card-header .el-button {
  padding: 4px;
  border: none;
  background: transparent;
  opacity: 0.7;
  color: var(--text-inverse);
}

.card-header .el-button:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.location-name {
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.coordinates {
  background-color: var(--bg-tertiary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  border-left: 3px solid var(--color-primary);
  word-break: break-all;
  line-height: 1.5;
  position: relative;
  overflow: hidden;
}

.coordinates::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(115deg, transparent 0%, rgba(37, 99, 235, 0.1) 30%, transparent 60%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.card-actions {
  display: flex;
  gap: var(--space-3);
}

.card-actions .el-button {
  flex: 1;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  padding: var(--space-3) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.card-actions .el-button--primary {
  background: var(--gradient-primary) !important;
  border: none !important;
}

.card-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 渐变效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
