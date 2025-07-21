/**
 * 位置管理 Composable
 * 负责管理保存的位置、标记点、用户位置等
 */
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'

// 位置数据接口
export interface Location {
  name: string
  lat: number
  lng: number
  id?: string | number
  timestamp?: number
  category?: string
}

export interface MarkerGeometry {
  styleId: string
  position: { lat: number; lng: number }
  properties: {
    title: string
    id: string | number
    poiId?: string
    isPoi?: boolean
  }
}

export interface MarkerStyles {
  default: MarkerStyle
  active: MarkerStyle
  poi: MarkerStyle
}

export interface MarkerStyle {
  width: number
  height: number
  anchor: { x: number; y: number }
  src: string
}

// 默认标记样式
const DEFAULT_MARKER_STYLES: MarkerStyles = {
  default: {
    width: 32,
    height: 32,
    anchor: { x: 16, y: 32 },
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjQwNDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluIj48cGF0aCBkPSJNMjAgMTBjMCA2LTggMTItOCAxMnMtOC02LTgtMTJhOCA4IDAgMCAxIDE2IDBaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==",
  },
  active: {
    width: 40,
    height: 40,
    anchor: { x: 20, y: 40 },
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA4MGZmIiBzdHJva2U9IiMwMDgwZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluIj48cGF0aCBkPSJNMjAgMTBjMCA2LTggMTItOCAxMnMtOC02LTgtMTJhOCA4IDAgMCAxIDE2IDBaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0id2hpdGUiIHN0cm9rZT0id2hpdGUiLz48L3N2Zz4=",
  },
  poi: {
    width: 32,
    height: 32,
    anchor: { x: 16, y: 32 },
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjdjMjNhIiBzdHJva2U9IiM2N2MyM2EiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluIj48cGF0aCBkPSJNMjAgMTBjMCA2LTggMTItOCAxMnMtOC02LTgtMTJhOCA4IDAgMCAxIDE2IDBaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0id2hpdGUiIHN0cm9rZT0id2hpdGUiLz48L3N2Zz4=",
  },
}

// 默认位置数据
const DEFAULT_LOCATIONS: Location[] = [
  { name: "北京市中心", lat: 39.98412, lng: 116.307484, id: 1 },
  { name: "故宫", lat: 39.916345, lng: 116.397155, id: 2 },
]

export function useLocationManager() {
  // 响应式状态
  const savedLocations = ref<Location[]>([...DEFAULT_LOCATIONS])
  const geometries = ref<MarkerGeometry[]>([])
  const markerStyles = ref<MarkerStyles>({ ...DEFAULT_MARKER_STYLES })
  const selectedLocation = ref<Location | null>(null)
  const userCurrentLocation = ref<Location | null>(null)
  
  // 筛选状态
  const locationFilter = ref<string>('')
  const activeLocationTag = ref<string>('all')
  
  // 标记管理状态
  const markerRef = ref<any>(null)
  const activeMarkerId = ref<string | number | null>(null)

  // 位置标签选项
  const locationTags = ref([
    { label: '全部', value: 'all' },
    { label: '最近添加', value: 'recent' },
    { label: '常用', value: 'frequent' },
  ])

  // 计算属性
  const filteredLocations = computed(() => {
    let result = [...savedLocations.value]

    // 根据标签筛选
    if (activeLocationTag.value === 'recent') {
      result = result.slice(-5)
    } else if (activeLocationTag.value === 'frequent') {
      result = result.sort((a, b) => a.name.localeCompare(b.name))
    }

    // 根据搜索文本筛选
    if (locationFilter.value) {
      const searchText = locationFilter.value.toLowerCase()
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchText) ||
          formatCoordinates(loc).includes(searchText)
      )
    }

    return result
  })

  const totalLocationsCount = computed(() => savedLocations.value.length)

  // 工具方法
  const formatCoordinates = (location: Location): string => {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
  }

  const generateLocationId = (): string => {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 位置管理方法
  const addLocation = (location: Omit<Location, 'id' | 'timestamp'>): Location => {
    const newLocation: Location = {
      ...location,
      id: generateLocationId(),
      timestamp: Date.now(),
    }

    savedLocations.value.push(newLocation)
    addMarkerForLocation(newLocation)
    saveLocationsToStorage()
    
    ElMessage.success(`位置 "${location.name}" 已保存`)
    return newLocation
  }

  const removeLocation = (index: number): boolean => {
    if (index >= 0 && index < savedLocations.value.length) {
      const location = savedLocations.value[index]
      
      // 从列表中移除
      savedLocations.value.splice(index, 1)
      
      // 移除对应的标记
      removeMarkerForLocation(location)
      
      // 保存到本地存储
      saveLocationsToStorage()
      
      ElMessage.success(`位置 "${location.name}" 已删除`)
      return true
    }
    return false
  }

  const updateLocation = (index: number, updates: Partial<Location>): boolean => {
    if (index >= 0 && index < savedLocations.value.length) {
      const location = savedLocations.value[index]
      Object.assign(location, updates)
      
      // 更新对应的标记
      updateMarkerForLocation(location)
      
      // 保存到本地存储
      saveLocationsToStorage()
      
      ElMessage.success(`位置 "${location.name}" 已更新`)
      return true
    }
    return false
  }

  const findLocationByCoordinates = (lat: number, lng: number): Location | null => {
    return savedLocations.value.find(
      (loc) => Math.abs(loc.lat - lat) < 0.0001 && Math.abs(loc.lng - lng) < 0.0001
    ) || null
  }

  const isActiveLocation = (location: Location): boolean => {
    return activeMarkerId.value === location.id
  }

  // 标记管理方法
  const addMarkerForLocation = (location: Location) => {
    const newMarker: MarkerGeometry = {
      styleId: 'default',
      position: { lat: location.lat, lng: location.lng },
      properties: {
        title: location.name,
        id: location.id || generateLocationId(),
      },
    }

    geometries.value.push(newMarker)
    refreshMarkers()
  }

  const removeMarkerForLocation = (location: Location) => {
    const markerIndex = geometries.value.findIndex(
      (marker) =>
        marker.position.lat === location.lat &&
        marker.position.lng === location.lng
    )

    if (markerIndex >= 0) {
      geometries.value.splice(markerIndex, 1)
      refreshMarkers()
    }
  }

  const updateMarkerForLocation = (location: Location) => {
    const markerIndex = geometries.value.findIndex(
      (marker) => marker.properties.id === location.id
    )

    if (markerIndex >= 0) {
      geometries.value[markerIndex].properties.title = location.name
      refreshMarkers()
    }
  }

  const clearPoiMarkers = () => {
    geometries.value = geometries.value.filter((geo) => !geo.properties.isPoi)
    refreshMarkers()
  }

  const refreshMarkers = () => {
    setTimeout(() => {
      if (markerRef.value && markerRef.value.refresh) {
        markerRef.value.refresh()
      }
    }, 100)
  }

  // 用户位置管理
  const getCurrentUserLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置服务'))
        return
      }

      ElMessage.info('正在获取您的位置...')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: Location = {
            name: '我的位置',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            id: 'user_location',
            timestamp: Date.now(),
            category: 'user',
          }
          
          userCurrentLocation.value = userLocation
          ElMessage.success('已获取到您的位置')
          resolve(userLocation)
        },
        (error) => {
          const errorMessage = `无法获取您的位置: ${error.message}`
          ElMessage.error(errorMessage)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  // 筛选方法
  const toggleLocationTag = (tag: string) => {
    activeLocationTag.value = tag
  }

  const clearLocationFilter = () => {
    locationFilter.value = ''
    activeLocationTag.value = 'all'
  }

  // 本地存储方法
  const saveLocationsToStorage = () => {
    try {
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value))
    } catch (error) {
      console.error('保存位置到本地存储失败:', error)
    }
  }

  const loadLocationsFromStorage = () => {
    try {
      const savedLocationData = localStorage.getItem('savedLocations')
      if (savedLocationData) {
        const locations = JSON.parse(savedLocationData)
        if (Array.isArray(locations) && locations.length > 0) {
          savedLocations.value = locations
          rebuildMarkersFromLocations()
        }
      }
    } catch (error) {
      console.error('从本地存储加载位置失败:', error)
    }
  }

  const rebuildMarkersFromLocations = () => {
    // 清除现有标记（保留默认标记）
    const defaultMarkers = geometries.value.filter(
      (m) => m.properties.id === 1 || m.properties.id === 2
    )
    
    const newGeometries = [...defaultMarkers]

    // 重新添加保存的位置标记
    savedLocations.value.forEach((location) => {
      const isDuplicate = defaultMarkers.some(
        (m) => m.position.lat === location.lat && m.position.lng === location.lng
      )

      if (!isDuplicate) {
        newGeometries.push({
          styleId: 'default',
          position: { lat: location.lat, lng: location.lng },
          properties: {
            title: location.name,
            id: location.id || generateLocationId(),
          },
        })
      }
    })

    geometries.value = newGeometries
    refreshMarkers()
  }

  // 初始化
  const initializeLocationManager = () => {
    loadLocationsFromStorage()
  }

  return {
    // 响应式状态
    savedLocations,
    geometries,
    markerStyles,
    selectedLocation,
    userCurrentLocation,
    locationFilter,
    activeLocationTag,
    markerRef,
    activeMarkerId,
    locationTags,
    
    // 计算属性
    filteredLocations,
    totalLocationsCount,
    
    // 工具方法
    formatCoordinates,
    generateLocationId,
    
    // 位置管理方法
    addLocation,
    removeLocation,
    updateLocation,
    findLocationByCoordinates,
    isActiveLocation,
    
    // 标记管理方法
    addMarkerForLocation,
    removeMarkerForLocation,
    updateMarkerForLocation,
    clearPoiMarkers,
    refreshMarkers,
    
    // 用户位置方法
    getCurrentUserLocation,
    
    // 筛选方法
    toggleLocationTag,
    clearLocationFilter,
    
    // 存储方法
    saveLocationsToStorage,
    loadLocationsFromStorage,
    rebuildMarkersFromLocations,
    initializeLocationManager,
  }
}
