<template>
  <div class="controls-section">
    <div class="section-header">
      <h3 class="section-title">标记管理</h3>
      <div class="section-actions">
        <el-tooltip content="清空所有标记" placement="top">
          <el-button class="button" text :icon="Delete" @click="clearAllMarkers"></el-button>
        </el-tooltip>
        <el-tooltip content="添加随机标记" placement="top">
          <el-button class="button" text :icon="Plus" @click="addRandomMarker"></el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="section-content">
      <div class="marker-filters">
        <div class="filters-header">
          <span>分类筛选</span>
          <span class="filter-badge">{{ selectedCategories.length }}/{{ markerCategories.length }}</span>
        </div>
        <div class="filter-tags">
          <el-tag
            v-for="category in markerCategories"
            :key="category"
            :type="selectedCategories.includes(category) ? getCategoryTagType(category) : 'info'"
            effect="light"
            class="filter-tag"
            :class="{ 'selected': selectedCategories.includes(category) }"
            @click="toggleCategory(category)"
          >
            {{ getCategoryLabel(category) }}
          </el-tag>
        </div>
      </div>
      <el-empty v-if="filteredMarkers.length === 0" description="暂无标记点" :image-size="60"></el-empty>
      <el-scrollbar v-else height="180px" class="markers-list">
        <div
          v-for="marker in filteredMarkers"
          :key="marker.id"
          class="marker-item"
        >
          <div class="marker-icon" :class="marker.properties.category">
            <el-icon><Location /></el-icon>
          </div>
          <div class="marker-info" @click="goToMarker(marker)">
            <div class="marker-title">{{ marker.properties.title }}</div>
            <div class="marker-meta">
              <el-tag size="small" :type="getCategoryTagType(marker.properties.category)" class="marker-tag">
                {{ getCategoryLabel(marker.properties.category) }}
              </el-tag>
              <span class="marker-coords">
                {{ marker.position.lat.toFixed(4) }}, {{ marker.position.lng.toFixed(4) }}
              </span>
            </div>
          </div>
          <div class="marker-actions">
            <el-tooltip content="查看详情" placement="top">
              <el-button :icon="View" circle text @click="viewMarkerDetail(marker)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除标记" placement="top">
              <el-button :icon="Delete" circle text @click="removeMarkerWithConfirm(marker.id)"></el-button>
            </el-tooltip>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Delete, Plus, Location, View } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 定义标记点接口
interface MarkerPosition {
  id: string
  styleId: string
  position: {
    lat: number
    lng: number
  }
  properties: {
    title: string
    address: string
    category: string
  }
}

// 定义组件属性
const props = defineProps({
  markers: {
    type: Array as () => MarkerPosition[],
    required: true
  }
})

// 定义组件事件
const emit = defineEmits([
  'goToMarker',
  'viewMarkerDetail',
  'removeMarker',
  'clearAllMarkers',
  'addRandomMarker'
])

// 标记点分类
const markerCategories = ref(['landmark', 'shopping', 'restaurant', 'hotel', 'other'])
const selectedCategories = ref(['landmark', 'shopping', 'restaurant', 'hotel', 'other'])

// 计算过滤后的标记点
const filteredMarkers = computed(() => {
  return props.markers.filter(marker =>
    selectedCategories.value.includes(marker.properties.category || 'other')
  )
})

// 切换分类筛选
const toggleCategory = (category: string) => {
  if (selectedCategories.value.includes(category)) {
    // 如果已选中，则移除
    selectedCategories.value = selectedCategories.value.filter(c => c !== category)
  } else {
    // 否则添加
    selectedCategories.value.push(category)
  }
}

// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  switch(category) {
    case 'landmark': return 'primary'
    case 'shopping': return 'success'
    case 'restaurant': return 'warning'
    case 'hotel': return 'info'
    default: return 'info'
  }
}

// 获取分类标签文本
const getCategoryLabel = (category: string) => {
  switch(category) {
    case 'landmark': return '地标'
    case 'shopping': return '购物'
    case 'restaurant': return '餐饮'
    case 'hotel': return '住宿'
    default: return '其他'
  }
}

// 前往标记点
const goToMarker = (marker: MarkerPosition) => {
  emit('goToMarker', marker)
}

// 查看标记点详情
const viewMarkerDetail = (marker: MarkerPosition) => {
  emit('viewMarkerDetail', marker)
}

// 确认删除标记点
const removeMarkerWithConfirm = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这个标记点吗？此操作不可撤销。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      emit('removeMarker', id)
      ElMessage({
        type: 'success',
        message: '标记点已删除',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 清空所有标记点
const clearAllMarkers = () => {
  if (props.markers.length === 0) {
    ElMessage({
      type: 'info',
      message: '当前没有标记点可清除',
    })
    return
  }

  ElMessageBox.confirm(
    '确定要清空所有标记点吗？此操作不可撤销。',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      emit('clearAllMarkers')
      ElMessage({
        type: 'success',
        message: '所有标记点已清除',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消清除',
      })
    })
}

// 添加随机标记
const addRandomMarker = () => {
  emit('addRandomMarker')
}

// 暴露方法
defineExpose({
  toggleCategory,
  clearAllMarkers
})
</script>

<style scoped>
.controls-section {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.section-actions {
  display: flex;
  gap: 4px;
}

.section-content {
  font-size: 14px;
}

.marker-filters {
  margin-bottom: 16px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.filter-badge {
  font-size: 12px;
  padding: 2px 6px;
  background-color: var(--el-color-info-light-9);
  border-radius: 10px;
  color: var(--el-color-info);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-tag {
  cursor: pointer;
}

.filter-tag.selected {
  font-weight: 500;
}

.markers-list {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.marker-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.marker-item:last-child {
  border-bottom: none;
}

.marker-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.marker-icon.landmark {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.marker-icon.shopping {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.marker-icon.restaurant {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.marker-icon.hotel {
  background-color: var(--el-color-info-light-8);
  color: var(--el-color-info);
}

.marker-info {
  flex: 1;
  overflow: hidden;
  cursor: pointer;
}

.marker-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.marker-coords {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-tag {
  flex-shrink: 0;
}

.marker-actions {
  display: flex;
  gap: 2px;
}
</style>
