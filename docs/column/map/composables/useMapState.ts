/**
 * 地图状态管理 Composable
 * 负责管理地图的核心状态：中心点、缩放级别、样式等
 */
import { ref, computed, watch, nextTick } from 'vue'
import type { Ref } from 'vue'

// 地图状态接口定义
export interface MapCenter {
  lat: number
  lng: number
}

export interface MapControl {
  scale: boolean
  zoom: {
    position: string
    showZoom: boolean
  }
  rotation: boolean
}

export interface MapState {
  center: MapCenter
  zoom: number
  style: string
  control: MapControl
}

// 默认配置
const DEFAULT_CENTER: MapCenter = { lat: 39.909187, lng: 116.397451 }
const DEFAULT_ZOOM = 12
const DEFAULT_STYLE = 'standard'
const DEFAULT_CONTROL: MapControl = {
  scale: true,
  zoom: {
    position: 'bottomright',
    showZoom: true,
  },
  rotation: true,
}

export function useMapState() {
  // 响应式状态
  const mapRef = ref<any>(null)
  const mapCenter = ref<MapCenter>({ ...DEFAULT_CENTER })
  const mapZoom = ref<number>(DEFAULT_ZOOM)
  const mapStyle = ref<string>(DEFAULT_STYLE)
  const mapControl = ref<MapControl>({ ...DEFAULT_CONTROL })
  
  // 默认设置状态
  const defaultCenter = ref<MapCenter>({ lat: 39.98412, lng: 116.307484 })
  const defaultZoom = ref<number>(17.2)
  
  // 地图初始化状态
  const isMapInitialized = ref<boolean>(false)
  const isMapLoading = ref<boolean>(true)
  const mapError = ref<string | null>(null)

  // 计算属性
  const mapInstance = computed(() => mapRef.value?.map || null)
  
  const isValidCenter = computed(() => {
    const { lat, lng } = mapCenter.value
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  })

  const zoomLevel = computed({
    get: () => mapZoom.value,
    set: (value: number) => {
      const clampedZoom = Math.max(3, Math.min(20, value))
      mapZoom.value = clampedZoom
      updateMapZoom(clampedZoom)
    }
  })

  // 地图操作方法
  const setMapCenter = (center: MapCenter) => {
    if (!isValidCenter.value) {
      console.warn('Invalid map center coordinates:', center)
      return
    }
    
    mapCenter.value = { ...center }
    
    if (mapInstance.value) {
      mapInstance.value.setCenter(mapCenter.value)
    }
  }

  const updateMapZoom = (zoom: number) => {
    if (mapInstance.value) {
      mapInstance.value.setZoom(zoom)
    }
  }

  const updateMapStyle = (style: string) => {
    mapStyle.value = style
    // 这里可以添加实际的地图样式更新逻辑
    console.log('更改地图样式为:', style)
  }

  // 缩放控制
  const zoomIn = () => {
    zoomLevel.value += 1
  }

  const zoomOut = () => {
    zoomLevel.value -= 1
  }

  // 重置地图视图
  const resetMapView = () => {
    mapCenter.value = { ...defaultCenter.value }
    mapZoom.value = defaultZoom.value
    mapStyle.value = DEFAULT_STYLE
  }

  // 地图初始化处理
  const onMapInited = (mapInstance: any) => {
    mapRef.value = { map: mapInstance }
    isMapInitialized.value = true
    isMapLoading.value = false
    mapError.value = null
    
    console.log('地图初始化成功')
    loadSavedSettings()
  }

  // 地图错误处理
  const onMapError = (error: Error) => {
    isMapLoading.value = false
    mapError.value = error.message
    console.error('地图加载失败:', error)
  }

  // 保存和加载设置
  const saveSettings = () => {
    try {
      const settings = {
        center: mapCenter.value,
        zoom: mapZoom.value,
        style: mapStyle.value,
      }
      localStorage.setItem('mapSettings', JSON.stringify(settings))
      console.log('地图设置已保存')
    } catch (error) {
      console.error('保存地图设置失败:', error)
    }
  }

  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('mapSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        
        if (settings.center) {
          defaultCenter.value = settings.center
          mapCenter.value = { ...settings.center }
        }
        
        if (settings.zoom) {
          defaultZoom.value = settings.zoom
          mapZoom.value = settings.zoom
        }
        
        if (settings.style) {
          mapStyle.value = settings.style
          updateMapStyle(settings.style)
        }
      }
    } catch (error) {
      console.error('加载保存的设置失败:', error)
    }
  }

  // 监听地图状态变化
  watch(mapCenter, (newCenter) => {
    if (mapInstance.value && isMapInitialized.value) {
      nextTick(() => {
        mapInstance.value.setCenter(newCenter)
      })
    }
  }, { deep: true })

  watch(mapZoom, (newZoom) => {
    if (mapInstance.value && isMapInitialized.value) {
      nextTick(() => {
        mapInstance.value.setZoom(newZoom)
      })
    }
  })

  return {
    // 响应式状态
    mapRef,
    mapCenter,
    mapZoom,
    mapStyle,
    mapControl,
    defaultCenter,
    defaultZoom,
    isMapInitialized,
    isMapLoading,
    mapError,
    
    // 计算属性
    mapInstance,
    isValidCenter,
    zoomLevel,
    
    // 方法
    setMapCenter,
    updateMapZoom,
    updateMapStyle,
    zoomIn,
    zoomOut,
    resetMapView,
    onMapInited,
    onMapError,
    saveSettings,
    loadSavedSettings,
  }
}
