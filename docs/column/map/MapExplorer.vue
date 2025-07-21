<template>
  <div class="map-explorer">
    <!-- 左侧侧边栏 -->
    <MapSidebar
      :show-sidebar="showSidebar"
      @refresh="handleRefresh"
      @settings="handleSettings"
      @search="handleSearch"
      @location-navigate="handleLocationNavigate"
      @poi-navigate="handlePoiNavigate"
    />

    <!-- 侧边栏切换按钮 -->
    <button class="toggle-btn" @click="showSidebar = !showSidebar">
      <el-icon v-if="showSidebar">
        <ArrowLeft />
      </el-icon>
      <el-icon v-else>
        <ArrowRight />
      </el-icon>
    </button>

    <!-- 右侧地图容器 -->
    <MapContainer
      :api-key="props.apiKey"
      @map-inited="handleMapInited"
      @location-selected="handleLocationSelected"
      @marker-clicked="handleMarkerClicked"
    />

    <!-- 对话框集合 -->
    <MapDialogs
      :show-settings="showSettings"
      :show-new-marker="showNewMarkerDialog"
      :show-edit="showEditDialog"
      :marker-name="markerName"
      :selected-location="selectedLocation"
      :editing-marker="editingMarker"
      :default-center="defaultCenter"
      :default-zoom="defaultZoom"
      @settings-close="handleSettingsClose"
      @settings-save="handleSettingsSave"
      @marker-save="handleMarkerSave"
      @marker-edit-save="handleMarkerEditSave"
      @dialog-close="handleDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MapSidebar from './components/MapSidebar.vue'
import MapContainer from './components/MapContainer.vue'
import { useMapExplorer } from './composables'
import type { MapLocation, PoiItem, MarkerClickEvent } from './composables'

// Props
interface Props {
  apiKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  apiKey: 'XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS',
})

// 使用组合式函数
const {
  mapState,
  locationManager,
  poiSearch,
  mapInteraction,
  initialize,
  cleanup,
  goToLocation,
  searchPoi,
  goToUserLocation,
} = useMapExplorer()

// 解构响应式状态
const {
  mapCenter,
  mapZoom,
  defaultCenter,
  defaultZoom,
  saveSettings,
} = mapState

const {
  selectedLocation,
  showNewMarkerDialog,
  showEditDialog,
  markerName,
  editingMarker,
} = mapInteraction

// 本地状态
const showSidebar = ref<boolean>(true)
const showSettings = ref<boolean>(false)

// 生命周期
onMounted(() => {
  try {
    initialize()
  } catch (error) {
    console.error('地图初始化失败:', error)
    ElMessage.error('地图初始化失败')
  }
})

onUnmounted(() => {
  try {
    cleanup()
  } catch (error) {
    console.error('清理资源时出错:', error)
  }
})

// 事件处理方法
const handleRefresh = () => {
  // 刷新地图
  if (mapState.mapRef.value && mapState.mapRef.value.map) {
    // 刷新地图标记
    if (locationManager.markerRef.value && locationManager.markerRef.value.refresh) {
      locationManager.markerRef.value.refresh()
    }

    // 清除搜索圆圈
    poiSearch.circleGeometries.value = []

    // 重置POI搜索结果
    poiSearch.clearSearchResults()

    // 重置地图视图到默认值
    mapState.mapCenter.value = { ...defaultCenter.value }
    mapState.mapZoom.value = defaultZoom.value

    // 刷新地图瓦片
    setTimeout(() => {
      mapState.mapRef.value.map.setCenter(mapState.mapCenter.value)
      mapState.mapRef.value.map.setZoom(mapState.mapZoom.value)
    }, 100)

    ElMessage.success('地图已刷新')
  } else {
    ElMessage.warning('地图实例未初始化，无法刷新')
  }
}

const handleSettings = () => {
  showSettings.value = true
}

const handleSearch = async (query: string) => {
  try {
    await searchPoi(query)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  }
}

const handleLocationNavigate = (location: MapLocation) => {
  goToLocation(location)
}

const handlePoiNavigate = (poi: PoiItem) => {
  mapState.setMapCenter({ lat: poi.location.lat, lng: poi.location.lng })
  mapState.zoomLevel.value = 16
}

const handleMapInited = () => {
  ElMessage.success('地图加载成功')
}

const handleLocationSelected = (location: MapLocation) => {
  // 处理位置选择
  console.log('位置已选择:', location)
}

const handleMarkerClicked = (event: MarkerClickEvent) => {
  // 处理标记点击
  console.log('标记被点击:', event)
}

const handleSettingsClose = () => {
  showSettings.value = false
}

const handleSettingsSave = (settings: any) => {
  // 更新设置
  if (settings.center) {
    defaultCenter.value = settings.center
    mapState.mapCenter.value = { ...settings.center }
  }

  if (settings.zoom) {
    defaultZoom.value = settings.zoom
    mapState.mapZoom.value = settings.zoom
  }

  if (settings.style) {
    mapState.updateMapStyle(settings.style)
  }

  // 保存设置
  saveSettings()
  showSettings.value = false
  ElMessage.success('设置已保存')
}

const handleMarkerSave = (markerData: { name: string; location: Location }) => {
  // 保存新标记
  const newLocation = {
    name: markerData.name,
    lat: markerData.location.lat,
    lng: markerData.location.lng,
  }

  locationManager.addLocation(newLocation)
  mapInteraction.closeNewMarkerDialog()
}

const handleMarkerEditSave = (markerData: { name: string; index: number }) => {
  // 保存编辑的标记
  locationManager.updateLocation(markerData.index, { name: markerData.name })
  mapInteraction.closeEditDialog()
}

const handleDialogClose = () => {
  mapInteraction.closeNewMarkerDialog()
  mapInteraction.closeEditDialog()
}
</script>

<style scoped>
/* 主容器样式 */
.map-explorer {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  font-family: var(--font-sans);

  /* 添加微妙的网格背景 */
  background-image:
    linear-gradient(var(--bg-tertiary) 1px, transparent 1px),
    linear-gradient(90deg, var(--bg-tertiary) 1px, transparent 1px);
  background-size: 50px 50px;
  background-position: -1px -1px;
}

/* 侧边栏切换按钮 */
.toggle-btn {
  position: absolute;
  top: var(--space-6);
  left: 380px;
  transform: translateX(-50%);
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.toggle-btn::before {
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

.toggle-btn:hover {
  transform: translateX(-50%) scale(1.1);
  box-shadow: var(--shadow-xl);
  background: var(--gradient-primary);
  color: var(--text-inverse);
  border-color: transparent;
}

.toggle-btn:hover::before {
  opacity: 1;
}

/* 当侧边栏收起时调整按钮位置 */
.map-explorer:has(.sidebar.collapsed) .toggle-btn {
  left: var(--space-6);
  transform: translateX(0);
}

.map-explorer:has(.sidebar.collapsed) .toggle-btn:hover {
  transform: translateX(0) scale(1.1);
}
</style>
