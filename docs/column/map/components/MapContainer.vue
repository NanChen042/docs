<template>
  <div class="map-wrapper">
    <!-- 腾讯地图组件 -->
    <tlbs-map
      ref="mapRef"
      :api-key="apiKey"
      :center="mapCenter"
      :zoom="mapZoom"
      :control="mapControl"
      @click="handleMapClick"
      @map_inited="handleMapInited"
      class="map-instance"
    >
      <!-- 多标记组件 -->
      <tlbs-multi-marker
        ref="markerRef"
        :geometries="geometries"
        :styles="markerStyles"
        :options="markerOptions"
        @click="handleMarkerClick"
        @marker_init="handleMarkerInit"
      />

      <!-- 圆形覆盖物 -->
      <tlbs-multi-polygon
        id="search_polygon"
        ref="polygonRef"
        :geometries="circleGeometries"
        :styles="circleStyles"
        @polygon_init="handlePolygonInit"
      />

      <!-- 信息窗口 -->
      <tlbs-info-window
        ref="infoWindowRef"
        :visible="infoWindowVisible"
        :position="infoWindowPosition"
        :content="infoWindowContent"
        :options="infoWindowOptions"
      />
    </tlbs-map>

    <!-- 地图控件 -->
    <MapControls
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @go-to-user-location="handleGoToUserLocation"
    />

    <!-- 信息卡片 -->
    <InfoCard
      v-if="selectedLocation"
      :location="selectedLocation"
      @close="handleCloseInfoCard"
      @save="handleSaveLocation"
      @copy="handleCopyCoordinates"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MapControls from './MapControls.vue'
import InfoCard from './InfoCard.vue'
import { useMapExplorer } from '../composables'
import type { MapLocation, MapClickEvent, MarkerClickEvent } from '../composables'

// Props
interface Props {
  apiKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  apiKey: 'XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS',
})

// Emits
interface Emits {
  (e: 'map-inited'): void
  (e: 'location-selected', location: MapLocation): void
  (e: 'marker-clicked', event: MarkerClickEvent): void
}

const emit = defineEmits<Emits>()

// 使用组合式函数
const {
  mapState,
  locationManager,
  poiSearch,
  mapInteraction,
  goToUserLocation,
} = useMapExplorer()

// 解构响应式状态
const {
  mapRef,
  mapCenter,
  mapZoom,
  mapControl,
  zoomIn,
  zoomOut,
  onMapInited,
} = mapState

const {
  geometries,
  markerStyles,
  markerRef,
} = locationManager

const {
  circleGeometries,
  circleStyles,
  polygonRef,
} = poiSearch

const {
  selectedLocation,
  infoWindowRef,
  infoWindowVisible,
  infoWindowPosition,
  infoWindowContent,
  infoWindowOptions,
  handleMapClick,
  handleMarkerClick,
  copyCoordinates,
} = mapInteraction

// 标记选项
const markerOptions = computed(() => ({
  joinStyle: true,
  enableDragging: false,
  clickable: true,
  cursor: 'pointer',
}))

// 事件处理方法
const handleMapInited = (mapInstance: any) => {
  onMapInited(mapInstance)
  emit('map-inited')
}

const handleMarkerInit = (marker: any) => {
  console.log('标记初始化:', marker)

  if (marker && marker.on) {
    try {
      marker.on('click', handleMarkerClick)
      console.log('已绑定标记点击事件')
    } catch (error) {
      console.error('绑定标记点击事件失败:', error)
    }
  }
}

const handlePolygonInit = (polygon: any) => {
  console.log('圆形覆盖物初始化:', polygon)

  if (polygon && polygon.updateGeometries && circleGeometries.value.length > 0) {
    setTimeout(() => {
      polygon.updateGeometries(circleGeometries.value)
    }, 200)
  }
}

const handleZoomIn = () => {
  zoomIn()
}

const handleZoomOut = () => {
  zoomOut()
}

const handleGoToUserLocation = async () => {
  try {
    await goToUserLocation()
  } catch (error) {
    console.error('获取用户位置失败:', error)
  }
}

const handleCloseInfoCard = () => {
  selectedLocation.value = null
}

const handleSaveLocation = () => {
  if (selectedLocation.value) {
    mapInteraction.openNewMarkerDialog(selectedLocation.value)
  }
}

const handleCopyCoordinates = async () => {
  if (selectedLocation.value) {
    await copyCoordinates(selectedLocation.value)
  }
}
</script>

<style scoped>
.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-tertiary);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
}

.map-instance {
  width: 100%;
  height: 100%;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}
</style>
