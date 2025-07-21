<template>
  <div class="locations-panel">
    <!-- 位置头部 -->
    <div class="locations-header">
      <h3>保存的位置</h3>
      <div class="locations-stats">
        共 {{ locations.length }} 个位置
      </div>
    </div>

    <!-- 位置筛选 -->
    <div class="filter-container">
      <el-input 
        :model-value="filter"
        @update:model-value="handleFilterChange"
        placeholder="搜索已保存位置..." 
        class="filter-input"
      >
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>

      <div class="tags-container">
        <div 
          v-for="tag in tags" 
          :key="tag.value" 
          :class="[
            'tag-chip',
            { active: activeTag === tag.value },
          ]" 
          @click="handleTagChange(tag.value)"
        >
          {{ tag.label }}
        </div>
      </div>
    </div>

    <!-- 位置列表 -->
    <div class="location-list" v-if="locations.length">
      <LocationItem
        v-for="(location, index) in locations" 
        :key="location.id || index"
        :location="location"
        :index="index"
        :is-active="isActiveLocation(location)"
        @click="handleLocationClick(location)"
        @edit="handleLocationEdit(index)"
        @delete="handleLocationDelete(index)"
        @goto="handleLocationGoto(location)"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="没有找到位置">
        <el-button type="primary" @click="handleAddLocation">添加位置</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import LocationItem from './LocationItem.vue'
import type { Location } from '../composables'

// Props
interface Props {
  locations: Location[]
  filter: string
  activeTag: string
  tags: Array<{ label: string; value: string }>
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'filter-change', value: string): void
  (e: 'tag-change', value: string): void
  (e: 'location-click', location: Location): void
  (e: 'location-edit', index: number): void
  (e: 'location-delete', index: number): void
  (e: 'add-location'): void
}

const emit = defineEmits<Emits>()

// 方法
const isActiveLocation = (location: Location): boolean => {
  // 这里可以根据实际需求判断是否为活跃位置
  return false
}

const handleFilterChange = (value: string) => {
  emit('filter-change', value)
}

const handleTagChange = (value: string) => {
  emit('tag-change', value)
}

const handleLocationClick = (location: Location) => {
  emit('location-click', location)
}

const handleLocationEdit = (index: number) => {
  emit('location-edit', index)
}

const handleLocationDelete = (index: number) => {
  emit('location-delete', index)
}

const handleLocationGoto = (location: Location) => {
  emit('location-click', location)
}

const handleAddLocation = () => {
  emit('add-location')
}
</script>

<style scoped>
.locations-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.locations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-primary);
}

.locations-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  position: relative;
}

.locations-header h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 2rem;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
}

.locations-stats {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 500;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.filter-container {
  padding: var(--space-5) var(--space-6);
  background: var(--bg-secondary);
  backdrop-filter: var(--glass-blur-light);
  border-bottom: 1px solid var(--border-light);
}

.filter-input {
  margin-bottom: var(--space-5);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  background: var(--bg-primary);
  color: var(--text-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  min-width: 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.tag-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.tag-chip:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: var(--bg-primary);
  color: var(--color-primary);
  border-color: var(--color-primary-300);
}

.tag-chip:hover::before {
  opacity: 1;
}

.tag-chip.active {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.location-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  background: var(--bg-secondary);
  backdrop-filter: var(--glass-blur-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  scrollbar-width: thin;
  scrollbar-color: var(--text-quaternary) transparent;
}

.location-list::-webkit-scrollbar {
  width: 4px;
}

.location-list::-webkit-scrollbar-thumb {
  background: var(--text-quaternary);
  border-radius: 2px;
}

.location-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

.empty-state {
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  margin: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.empty-state :deep(.el-empty) {
  padding: 40px 0;
}

.empty-state :deep(.el-button) {
  background: var(--gradient-primary);
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.empty-state :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
