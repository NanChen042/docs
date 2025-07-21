<template>
  <div class="search-bar">
    <el-input 
      :model-value="modelValue"
      @update:model-value="handleInput"
      @keyup.enter="handleSearch"
      placeholder="搜索位置" 
      clearable 
      class="search-input"
    >
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
      <template #suffix>
        <el-button 
          text 
          @click="handleSearch"
          class="search-button"
          :disabled="!modelValue.trim()"
        >
          <el-icon>
            <Search />
          </el-icon>
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索位置',
  disabled: false,
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void
  (e: 'clear'): void
}

const emit = defineEmits<Emits>()

// 事件处理方法
const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

const handleSearch = () => {
  if (props.modelValue.trim()) {
    emit('search', props.modelValue.trim())
  }
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped>
.search-bar {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-primary);
}

.search-input {
  width: 100%;
}

.search-bar :deep(.el-input__wrapper) {
  border: none;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.search-bar :deep(.el-input__wrapper:hover) {
  box-shadow: var(--shadow-md);
  background: var(--bg-primary);
}

.search-bar :deep(.el-input__wrapper.is-focus) {
  box-shadow: var(--shadow-lg), 0 0 0 2px var(--color-primary-300);
}

.search-bar :deep(.el-input__inner) {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.95rem;
}

.search-bar :deep(.el-input__prefix-inner) {
  color: var(--text-tertiary);
}

.search-button {
  padding: 0;
  margin: 0;
  color: var(--text-tertiary);
  transition: color var(--transition-normal);
}

.search-button:hover {
  color: var(--color-primary);
}

.search-button:disabled {
  color: var(--text-disabled);
  cursor: not-allowed;
}
</style>
