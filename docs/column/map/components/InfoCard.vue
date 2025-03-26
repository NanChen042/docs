<template>
  <div class="map-info-card" v-if="visible">
    <div class="info-card-header">
      <div class="info-title">
        <el-tag size="small" :type="getCategoryTagType(cardInfo.category)">
          {{ getCategoryLabel(cardInfo.category) }}
        </el-tag>
        <h3>{{ cardInfo.title }}</h3>
      </div>
      <el-button circle text :icon="Close" @click="closeCard"></el-button>
    </div>

    <div class="info-card-body">
      <div class="info-item">
        <el-icon><Location /></el-icon>
        <span>{{ cardInfo.address }}</span>
      </div>
      <div class="info-item">
        <el-icon><Position /></el-icon>
        <span>{{ cardInfo.lat.toFixed(6) }}, {{ cardInfo.lng.toFixed(6) }}</span>
      </div>
    </div>

    <div class="info-card-footer">
      <el-button-group class="info-actions">
        <el-button :icon="Share" round @click="shareLocation">分享位置</el-button>
        <el-button type="primary" :icon="Guide" round @click="startNavigation">开始导航</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Close, Location, Position, Share, Guide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 定义信息卡片接口
interface InfoCardData {
  title: string
  address: string
  category: string
  lat: number
  lng: number
}

// 定义组件属性
const props = defineProps({
  cardInfo: {
    type: Object as () => InfoCardData,
    default: () => ({
      title: '',
      address: '',
      category: 'other',
      lat: 0,
      lng: 0
    })
  },
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
const emit = defineEmits(['close', 'navigate', 'share'])

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

// 关闭信息卡片
const closeCard = () => {
  emit('close')
}

// 分享位置
const shareLocation = () => {
  const { title, lat, lng } = props.cardInfo
  emit('share', {
    title,
    location: { lat, lng }
  })

  ElMessage.success('位置分享链接已复制到剪贴板')
}

// 开始导航
const startNavigation = () => {
  const { title, lat, lng } = props.cardInfo
  emit('navigate', {
    title,
    location: { lat, lng }
  })

  ElMessage.success(`开始导航至: ${title}`)
}
</script>

<style scoped>
.map-info-card {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 300px;
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 20;
}

.info-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-title {
  flex: 1;
}

.info-title h3 {
  margin: 6px 0 0 0;
  font-size: 16px;
}

.info-card-body {
  padding: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.info-card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: center;
}

.info-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}
</style>
