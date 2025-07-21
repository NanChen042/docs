<template>
  <div 
    :class="[
      'location-item',
      { active: isActive },
    ]" 
    @click="handleClick"
  >
    <!-- 位置图标 -->
    <div class="location-icon">
      <el-icon>
        <Flag />
      </el-icon>
    </div>
    
    <!-- 位置信息 -->
    <div class="location-info">
      <div class="location-name">{{ location.name }}</div>
      <div class="location-coordinates">
        {{ formatCoordinates(location) }}
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="location-actions">
      <el-button 
        circle 
        size="small" 
        type="primary" 
        @click.stop="handleGoto"
        :title="'定位到此位置'"
      >
        <el-icon>
          <Position />
        </el-icon>
      </el-button>
      
      <el-button 
        circle 
        size="small" 
        type="warning" 
        @click.stop="handleEdit"
        :title="'编辑位置'"
      >
        <el-icon>
          <Edit />
        </el-icon>
      </el-button>
      
      <el-button 
        circle 
        size="small" 
        type="danger" 
        @click.stop="handleDelete"
        :title="'删除位置'"
      >
        <el-icon>
          <Delete />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flag, Position, Edit, Delete } from '@element-plus/icons-vue'
import type { Location } from '../composables'

// Props
interface Props {
  location: Location
  index: number
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

// Emits
interface Emits {
  (e: 'click', location: Location): void
  (e: 'goto', location: Location): void
  (e: 'edit', index: number): void
  (e: 'delete', index: number): void
}

const emit = defineEmits<Emits>()

// 方法
const formatCoordinates = (location: Location): string => {
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
}

const handleClick = () => {
  emit('click', props.location)
}

const handleGoto = () => {
  emit('goto', props.location)
}

const handleEdit = () => {
  emit('edit', props.index)
}

const handleDelete = () => {
  emit('delete', props.index)
}
</script>

<style scoped>
.location-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "icon info actions";
  gap: var(--space-4);
  padding: var(--space-4);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.location-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 3px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity var(--transition-normal);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

.location-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: var(--bg-primary);
  border-color: var(--border-medium);
}

.location-item:hover::after {
  opacity: 0.5;
}

.location-item.active {
  background: var(--bg-highlight);
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.location-item.active::after {
  opacity: 1;
}

.location-icon {
  grid-area: icon;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-10);
  height: var(--space-10);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  background: var(--gradient-primary);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.location-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
}

.location-item:hover .location-icon {
  transform: scale(1.05);
}

.location-info {
  grid-area: info;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.location-name {
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-normal);
}

.location-item:hover .location-name {
  color: var(--color-primary);
}

.location-coordinates {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-mono);
  padding: var(--space-1) var(--space-2);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  display: inline-block;
  max-width: 100%;
  transition: background var(--transition-normal);
}

.location-item:hover .location-coordinates {
  background: var(--bg-highlight);
}

.location-actions {
  grid-area: actions;
  display: flex;
  gap: var(--space-2);
  opacity: 0;
  transform: translateX(10px);
  transition: all var(--transition-normal);
  align-self: center;
}

.location-item:hover .location-actions {
  opacity: 1;
  transform: translateX(0);
}

.location-actions :deep(.el-button) {
  box-shadow: var(--shadow-sm);
  border: none !important;
  transition: all var(--transition-normal) !important;
}

.location-actions :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
