<template>
  <div class="tabs-header">
    <el-radio-group 
      :model-value="modelValue"
      @update:model-value="handleTabChange"
      size="large"
    >
      <el-radio-button 
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
      >
        {{ tab.label }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 标签页配置
interface TabItem {
  label: string
  value: string
  icon?: string
}

// Props
interface Props {
  modelValue: string
  tabs?: TabItem[]
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [
    { label: '位置', value: 'locations' },
    { label: '搜索', value: 'search' },
    { label: '地图控制', value: 'controls' },
  ],
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'tab-change', value: string): void
}

const emit = defineEmits<Emits>()

// 计算属性
const tabs = computed(() => props.tabs)

// 事件处理方法
const handleTabChange = (value: string) => {
  emit('update:modelValue', value)
  emit('tab-change', value)
}
</script>

<style scoped>
.tabs-header {
  display: flex;
  justify-content: center;
  padding: var(--space-4) var(--space-6);
  background: var(--bg-secondary);
  position: relative;
}

.tabs-header::after {
  content: '';
  position: absolute;
  left: var(--space-6);
  right: var(--space-6);
  bottom: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-light), transparent);
}

.tabs-header :deep(.el-radio-group) {
  width: 100%;
  display: flex;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.tabs-header :deep(.el-radio-button__inner) {
  border: none;
  height: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tabs-header :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.tabs-header :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.tabs-header :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
}

.tabs-header :deep(.el-radio-button__inner:hover) {
  background: var(--bg-highlight);
  color: var(--color-primary);
}

.tabs-header :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover) {
  background: var(--gradient-primary);
  color: var(--text-inverse);
}
</style>
