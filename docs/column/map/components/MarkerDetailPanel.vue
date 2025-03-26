<template>
  <el-drawer
    v-model="visible"
    title="标记点详情"
    size="30%"
    :with-header="true"
    direction="rtl"
    :before-close="handleClose"
  >
    <div v-if="markerInfo" class="marker-detail-panel">
      <div class="marker-detail-header">
        <el-tag size="large" :type="getCategoryTagType(markerInfo.properties.category)" class="detail-category">
          {{ getCategoryLabel(markerInfo.properties.category) }}
        </el-tag>
        <h2 class="detail-title">{{ markerInfo.properties.title }}</h2>
        <p class="detail-address">{{ markerInfo.properties.address }}</p>
      </div>

      <div class="marker-detail-coordinates">
        <div class="coordinate-item">
          <span class="coordinate-label">纬度</span>
          <span class="coordinate-value">{{ markerInfo.position.lat.toFixed(6) }}</span>
        </div>
        <div class="coordinate-item">
          <span class="coordinate-label">经度</span>
          <span class="coordinate-value">{{ markerInfo.position.lng.toFixed(6) }}</span>
        </div>
      </div>

      <div class="marker-detail-actions">
        <el-button type="primary" @click="goToMarker">前往此处</el-button>
        <el-button type="danger" @click="removeMarker">删除标记</el-button>
      </div>

      <div class="marker-detail-section">
        <h3>周边信息</h3>
        <div class="marker-surroundings">
          <el-skeleton :rows="3" animated :loading="surroundingsLoading" />
          <div v-if="!surroundingsLoading && surroundingPlaces.length > 0" class="surrounding-places">
            <div v-for="(place, index) in surroundingPlaces" :key="index" class="surrounding-place">
              <el-icon><Location /></el-icon>
              <div class="place-info">
                <div class="place-name">{{ place.name }}</div>
                <div class="place-distance">{{ place.distance }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else-if="!surroundingsLoading && surroundingPlaces.length === 0" description="暂无周边信息" :image-size="60"></el-empty>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Location } from '@element-plus/icons-vue'

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
  marker: {
    type: Object as () => MarkerPosition | null,
    default: null
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
const emit = defineEmits(['update:modelValue', 'goToMarker', 'removeMarker'])

// 内部状态
const visible = ref(props.modelValue)
const markerInfo = ref(props.marker)
const surroundingsLoading = ref(true)
const surroundingPlaces = ref<any[]>([])

// 监听visible变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听props.modelValue变化，同步到内部状态
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal

  // 当面板打开时，加载周边信息
  if (newVal && props.marker) {
    loadSurroundingPlaces()
  }
})

// 监听props.marker变化，同步到内部状态
watch(() => props.marker, (newVal) => {
  markerInfo.value = newVal

  // 当标记点更新且面板打开时，重新加载周边信息
  if (newVal && visible.value) {
    loadSurroundingPlaces()
  }
})

// 加载周边信息
const loadSurroundingPlaces = () => {
  if (!markerInfo.value) return

  surroundingsLoading.value = true

  // 模拟加载周边信息
  setTimeout(() => {
    // 模拟数据
    surroundingPlaces.value = [
      { name: '星巴克咖啡', distance: '120米' },
      { name: '全家便利店', distance: '230米' },
      { name: '地铁站', distance: '450米' }
    ]
    surroundingsLoading.value = false
  }, 1000)
}

// 关闭面板
const handleClose = () => {
  visible.value = false
}

// 前往标记点
const goToMarker = () => {
  if (!markerInfo.value) return
  emit('goToMarker', markerInfo.value)
  visible.value = false
}

// 删除标记点
const removeMarker = () => {
  if (!markerInfo.value) return

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
      emit('removeMarker', markerInfo.value?.id)
      visible.value = false
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
</script>

<style scoped>
.marker-detail-panel {
  padding: 16px;
}

.marker-detail-header {
  margin-bottom: 20px;
}

.detail-category {
  margin-bottom: 10px;
}

.detail-title {
  margin: 10px 0;
  font-size: 20px;
}

.detail-address {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.marker-detail-coordinates {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  background-color: var(--el-fill-color-lighter);
  padding: 12px;
  border-radius: 6px;
}

.coordinate-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coordinate-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.coordinate-value {
  font-weight: 500;
}

.marker-detail-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.marker-detail-section {
  margin-top: 24px;
}

.marker-detail-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
}

.surrounding-places {
  margin-top: 12px;
}

.surrounding-place {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.surrounding-place:last-child {
  border-bottom: none;
}

.place-info {
  flex: 1;
}

.place-name {
  font-weight: 500;
}

.place-distance {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 深色模式适配 */
:root.dark .marker-detail-coordinates {
  background-color: var(--el-fill-color-dark);
}
</style>
