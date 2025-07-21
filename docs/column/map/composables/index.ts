/**
 * Composables 统一导出文件
 * 提供地图相关的所有 Composable 函数
 */

// 导入所有 Composables
import { useMapState } from './useMapState'
import { useLocationManager, type Location } from './useLocationManager'
import { usePoiSearch } from './usePoiSearch'
import { useMapInteraction } from './useMapInteraction'

// 导出所有 Composables
export { useMapState } from './useMapState'
export { useLocationManager } from './useLocationManager'
export { usePoiSearch } from './usePoiSearch'
export { useMapInteraction } from './useMapInteraction'

// 导出类型定义（重命名以避免与浏览器 Location 冲突）
export type { MapCenter, MapControl, MapState } from './useMapState'
export type {
  Location as MapLocation,
  MarkerGeometry,
  MarkerStyles,
  MarkerStyle
} from './useLocationManager'
export type { PoiItem, PoiSearchOptions, CircleGeometry } from './usePoiSearch'
export type { MapClickEvent, MarkerClickEvent, InfoWindowOptions } from './useMapInteraction'

/**
 * 主要的地图 Composable 组合函数
 * 整合所有地图相关的状态和方法
 */
export function useMapExplorer() {
  // 导入所有子 Composables
  const mapState = useMapState()
  const locationManager = useLocationManager()
  const poiSearch = usePoiSearch()
  const mapInteraction = useMapInteraction()

  // 初始化所有模块
  const initialize = () => {
    locationManager.initializeLocationManager()
    mapInteraction.initializeInteraction()
  }

  // 清理所有资源
  const cleanup = () => {
    poiSearch.cleanup()
    mapInteraction.cleanup()
  }

  // 统一的地图中心设置方法
  const setMapCenter = (center: { lat: number; lng: number }) => {
    mapState.setMapCenter(center)
  }

  // 统一的位置导航方法
  const goToLocation = (location: Location) => {
    setMapCenter({ lat: location.lat, lng: location.lng })

    // 显示位置信息
    mapInteraction.showMarkerInfoWindow(location)
  }

  // 统一的POI搜索方法
  const searchPoi = async (keyword: string) => {
    const center = mapState.isUsingUserLocation.value && locationManager.userCurrentLocation.value
      ? locationManager.userCurrentLocation.value
      : mapState.mapCenter.value

    await poiSearch.searchNearbyPoi(keyword, center)
  }

  // 统一的用户定位方法
  const goToUserLocation = async () => {
    try {
      const userLocation = await locationManager.getCurrentUserLocation()
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng })
      mapState.zoomLevel.value = 16

      mapInteraction.showInfoWindow(
        { lat: userLocation.lat, lng: userLocation.lng },
        `<div class="info-window-content">
          <h3>您的当前位置</h3>
          <p class="info-coordinates">${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}</p>
          <div class="info-window-actions">
            <button class="info-action-save" onclick="window.dispatchEvent(new CustomEvent('marker-save', {detail: {lat: ${userLocation.lat}, lng: ${userLocation.lng}}}))">
              <span class="info-action-icon">💾</span> 保存位置
            </button>
          </div>
        </div>`
      )
    } catch (error) {
      console.error('获取用户位置失败:', error)
    }
  }

  return {
    // 子模块
    mapState,
    locationManager,
    poiSearch,
    mapInteraction,

    // 统一方法
    initialize,
    cleanup,
    setMapCenter,
    goToLocation,
    searchPoi,
    goToUserLocation,
  }
}
