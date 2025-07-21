<template>
  <div class="search-panel">
    <!-- 搜索头部 -->
    <div class="search-header">
      <h3>POI搜索</h3>
    </div>

    <!-- 搜索配置 -->
    <div class="search-config">
      <el-form label-width="80px" size="small">
        <el-form-item label="关键词">
          <el-input 
            :model-value="keyword"
            @update:model-value="handleKeywordChange"
            placeholder="输入搜索关键词"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="搜索半径">
          <el-select 
            :model-value="radius"
            @update:model-value="handleRadiusChange"
            placeholder="选择搜索半径"
          >
            <el-option label="500米" :value="500" />
            <el-option label="1公里" :value="1000" />
            <el-option label="2公里" :value="2000" />
            <el-option label="5公里" :value="5000" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select 
            :model-value="category"
            @update:model-value="handleCategoryChange"
            placeholder="选择POI分类"
            clearable
          >
            <el-option 
              v-for="cat in categories"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <div class="search-actions">
        <el-button 
          type="primary" 
          @click="handleSearch"
          :loading="isSearching"
          :disabled="!keyword.trim()"
        >
          搜索
        </el-button>
        
        <el-button 
          @click="handleClearResults"
          :disabled="!showResults"
        >
          清除结果
        </el-button>
      </div>
    </div>

    <!-- 快速搜索标签 -->
    <div class="quick-search" v-if="quickTags.length">
      <div class="quick-search-title">快速搜索</div>
      <div class="quick-tags">
        <el-tag 
          v-for="tag in quickTags"
          :key="tag"
          @click="handleQuickSearch(tag)"
          class="quick-tag"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="showResults">
      <div class="results-header">
        <span>搜索结果 ({{ totalCount }})</span>
      </div>
      
      <div class="results-list" v-if="searchResults.length">
        <div 
          v-for="poi in searchResults"
          :key="poi.id"
          class="result-item"
          @click="handlePoiSelect(poi)"
        >
          <div class="poi-info">
            <div class="poi-title">{{ poi.title }}</div>
            <div class="poi-address">{{ poi.address }}</div>
            <div class="poi-distance">{{ poi._distance }}米</div>
          </div>
          
          <div class="poi-actions">
            <el-button size="small" @click.stop="handlePoiGoto(poi)">定位</el-button>
            <el-button size="small" type="primary" @click.stop="handlePoiSave(poi)">保存</el-button>
          </div>
        </div>
      </div>
      
      <div v-else class="no-results">
        <el-empty description="没有找到相关POI" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PoiItem } from '../composables'

// Props
interface Props {
  keyword: string
  radius: number
  category: string
  autoExtend: boolean
  isUsingUserLocation: boolean
  categories: Array<{ label: string; value: string }>
  quickTags: string[]
  searchResults: PoiItem[]
  isSearching: boolean
  totalCount: number
  currentPage: number
  showResults: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'keyword-change', value: string): void
  (e: 'radius-change', value: number): void
  (e: 'category-change', value: string): void
  (e: 'auto-extend-change', value: boolean): void
  (e: 'location-mode-toggle'): void
  (e: 'search'): void
  (e: 'clear-results'): void
  (e: 'quick-search', keyword: string): void
  (e: 'poi-select', poi: PoiItem): void
  (e: 'poi-goto', poi: PoiItem): void
  (e: 'poi-save', poi: PoiItem): void
  (e: 'page-change', page: number): void
}

const emit = defineEmits<Emits>()

// 事件处理方法
const handleKeywordChange = (value: string) => {
  emit('keyword-change', value)
}

const handleRadiusChange = (value: number) => {
  emit('radius-change', value)
}

const handleCategoryChange = (value: string) => {
  emit('category-change', value)
}

const handleSearch = () => {
  emit('search')
}

const handleClearResults = () => {
  emit('clear-results')
}

const handleQuickSearch = (keyword: string) => {
  emit('quick-search', keyword)
}

const handlePoiSelect = (poi: PoiItem) => {
  emit('poi-select', poi)
}

const handlePoiGoto = (poi: PoiItem) => {
  emit('poi-goto', poi)
}

const handlePoiSave = (poi: PoiItem) => {
  emit('poi-save', poi)
}
</script>

<style scoped>
.search-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-primary);
}

.search-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.search-config {
  padding: var(--space-5) var(--space-6);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.search-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.quick-search {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
}

.quick-search-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.quick-tag {
  cursor: pointer;
  transition: all var(--transition-normal);
}

.quick-tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.results-header {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  font-weight: 600;
  color: var(--text-primary);
}

.results-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-300);
}

.poi-info {
  flex: 1;
  min-width: 0;
}

.poi-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poi-address {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poi-distance {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.poi-actions {
  display: flex;
  gap: var(--space-2);
  margin-left: var(--space-4);
}

.no-results {
  padding: var(--space-8);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
