<template>
  <div class="controls-section">
    <div class="section-header">
      <h3 class="section-title">收藏地点</h3>
      <el-tooltip content="添加收藏" placement="top">
        <el-button class="button" text :icon="Star"></el-button>
      </el-tooltip>
    </div>
    <div class="section-content">
      <el-empty v-if="favoriteLocations.length === 0" description="暂无收藏地点" :image-size="60"></el-empty>
      <el-scrollbar v-else height="150px" class="locations-list">
        <div v-for="(location, index) in favoriteLocations" :key="index" class="location-item">
          <div class="location-icon" @click="goToLocation(location)">
            <el-icon><Location /></el-icon>
          </div>
          <div class="location-info" @click="goToLocation(location)">
            <div class="location-title">{{ location.name }}</div>
            <div class="location-address">{{ location.address }}</div>
          </div>
          <div class="location-actions">
            <el-tooltip content="导航至此处" placement="top">
              <el-button :icon="Position" circle text @click="goToLocation(location)"></el-button>
            </el-tooltip>
            <el-tooltip content="取消收藏" placement="top">
              <el-button :icon="Delete" circle text @click="removeFavorite(index)"></el-button>
            </el-tooltip>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Star, Location, Position, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 定义位置接口
interface FavoriteLocation {
  name: string
  address: string
  lat: number
  lng: number
}

// 定义组件属性
const props = defineProps({
  initialFavorites: {
    type: Array as () => FavoriteLocation[],
    default: () => []
  }
})

// 定义组件事件
const emit = defineEmits(['goToLocation', 'removeFavorite', 'addFavorite'])

// 收藏地点数据
const favoriteLocations = ref<FavoriteLocation[]>(props.initialFavorites)

// 前往特定位置
const goToLocation = (location: FavoriteLocation) => {
  emit('goToLocation', location)
}

// 删除收藏
const removeFavorite = (index: number) => {
  ElMessageBox.confirm(
    '确定要删除这个收藏地点吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const location = favoriteLocations.value[index]
      emit('removeFavorite', location, index)
      ElMessage({
        type: 'success',
        message: '收藏地点已删除',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 暴露更新收藏列表的方法
const updateFavorites = (favorites: FavoriteLocation[]) => {
  favoriteLocations.value = favorites
}

// 添加收藏方法
const addFavorite = (location: FavoriteLocation) => {
  emit('addFavorite', location)
}

// 暴露方法供父组件调用
defineExpose({
  updateFavorites,
  addFavorite
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

.section-content {
  font-size: 14px;
}

.locations-list {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.location-item:last-child {
  border-bottom: none;
}

.location-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
  cursor: pointer;
}

.location-info {
  flex: 1;
  overflow: hidden;
  cursor: pointer;
}

.location-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-address {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-actions {
  display: flex;
  gap: 2px;
}
</style>
