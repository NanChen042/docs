/**
 * 地图交互管理 Composable
 * 负责处理地图点击、标记点击、信息窗口等交互逻辑
 */
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Ref } from 'vue'
import type { Location } from './useLocationManager'

// 交互事件接口
export interface MapClickEvent {
  latLng: { lat: number; lng: number }
  pixel: { x: number; y: number }
}

export interface MarkerClickEvent {
  geometry: {
    position: { lat: number; lng: number }
    properties: {
      title: string
      id: string | number
      poiId?: string
      isPoi?: boolean
    }
  }
  latLng: { lat: number; lng: number }
}

export interface InfoWindowOptions {
  offset: { x: number; y: number }
  closeButton: boolean
  enableAnimation: boolean
  borderRadius: string
  boxShadow: string
}

// 默认信息窗口配置
const DEFAULT_INFO_WINDOW_OPTIONS: InfoWindowOptions = {
  offset: { x: 0, y: -32 },
  closeButton: true,
  enableAnimation: true,
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
}

export function useMapInteraction() {
  // 交互状态
  const selectedLocation = ref<Location | null>(null)
  const isMarkerClick = ref<boolean>(false)
  const lastMarkerClickTime = ref<number>(0)
  
  // 信息窗口状态
  const infoWindowRef = ref<any>(null)
  const infoWindowVisible = ref<boolean>(false)
  const infoWindowPosition = ref<{ lat: number; lng: number }>({ lat: 0, lng: 0 })
  const infoWindowContent = ref<string>('')
  const infoWindowOptions = ref<InfoWindowOptions>({ ...DEFAULT_INFO_WINDOW_OPTIONS })
  
  // 对话框状态
  const showNewMarkerDialog = ref<boolean>(false)
  const showEditDialog = ref<boolean>(false)
  const showSettings = ref<boolean>(false)
  const markerName = ref<string>('')
  const editingMarker = ref<{ index: number; data: any } | null>(null)

  // 事件处理器映射
  const eventHandlers = new Map<string, EventListener>()

  // 工具方法
  const isClickOnInfoCard = (event: MapClickEvent): boolean => {
    const infoCard = document.querySelector('.info-card')
    if (!infoCard) return false

    const rect = infoCard.getBoundingClientRect()
    const { x, y } = event.pixel

    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  const preventMarkerClickConflict = (): boolean => {
    return isMarkerClick.value && Date.now() - lastMarkerClickTime.value < 300
  }

  // 地图点击处理
  const handleMapClick = (event: MapClickEvent): void => {
    // 检查是否在短时间内已经处理了标记点击
    if (preventMarkerClickConflict()) {
      isMarkerClick.value = false
      return
    }

    // 延迟检查，确保DOM已更新
    setTimeout(() => {
      // 检查点击是否在info-card上
      if (isClickOnInfoCard(event)) {
        return
      }

      // 隐藏信息窗口
      hideInfoWindow()

      // 设置选中位置
      selectedLocation.value = {
        name: '选中位置',
        lat: event.latLng.lat,
        lng: event.latLng.lng,
        id: `temp_${Date.now()}`,
      }

      // 如果新增标记对话框已打开，更新坐标
      if (showNewMarkerDialog.value) {
        // 对话框打开状态，更新选中的位置坐标
      }
    }, 10)
  }

  // 标记点击处理
  const handleMarkerClick = (event: MarkerClickEvent): void => {
    // 设置标记点击标志和时间戳
    isMarkerClick.value = true
    lastMarkerClickTime.value = Date.now()

    if (event.geometry && event.geometry.properties) {
      const { title, id, isPoi } = event.geometry.properties
      const markerPosition = event.latLng || event.geometry.position

      // 清除选中位置，避免同时显示两个信息框
      selectedLocation.value = null

      const markerInfo: Location = {
        name: title || `标记 #${id || '未知'}`,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        id: id,
      }

      // 显示信息窗口
      if (isPoi) {
        showPoiInfoWindow(markerInfo)
      } else {
        showMarkerInfoWindow(markerInfo)
      }
    }
  }

  // 信息窗口管理
  const showInfoWindow = (position: { lat: number; lng: number }, content: string): void => {
    infoWindowPosition.value = position
    infoWindowContent.value = content
    infoWindowVisible.value = true
  }

  const hideInfoWindow = (): void => {
    infoWindowVisible.value = false
  }

  const showMarkerInfoWindow = (markerInfo: Location): void => {
    const content = `
      <div class="info-window-content">
        <h3>${markerInfo.name}</h3>
        <p class="info-coordinates">${markerInfo.lat.toFixed(6)}, ${markerInfo.lng.toFixed(6)}</p>
        <div class="info-window-actions">
          <button class="info-action-edit" onclick="window.dispatchEvent(new CustomEvent('marker-edit', {detail: {id: '${markerInfo.id}'}}))">
            <span class="info-action-icon">✏️</span> 编辑
          </button>
          <button class="info-action-center" onclick="window.dispatchEvent(new CustomEvent('marker-center', {detail: {lat: ${markerInfo.lat}, lng: ${markerInfo.lng}}}))">
            <span class="info-action-icon">🎯</span> 定位
          </button>
          <button class="info-action-delete" onclick="window.dispatchEvent(new CustomEvent('marker-delete', {detail: {id: '${markerInfo.id}'}}))">
            <span class="info-action-icon">🗑️</span> 删除
          </button>
        </div>
      </div>
    `
    showInfoWindow({ lat: markerInfo.lat, lng: markerInfo.lng }, content)
  }

  const showPoiInfoWindow = (poiInfo: Location): void => {
    const content = `
      <div class="info-window-content">
        <h3>${poiInfo.name}</h3>
        <p class="info-coordinates">${poiInfo.lat.toFixed(6)}, ${poiInfo.lng.toFixed(6)}</p>
        <div class="info-window-actions">
          <button class="info-action-center" onclick="window.dispatchEvent(new CustomEvent('marker-center', {detail: {lat: ${poiInfo.lat}, lng: ${poiInfo.lng}}}))">
            <span class="info-action-icon">🎯</span> 定位
          </button>
          <button class="info-action-save" onclick="window.dispatchEvent(new CustomEvent('poi-save', {detail: {poi: '${encodeURIComponent(JSON.stringify(poiInfo))}'}}))">
            <span class="info-action-icon">💾</span> 保存
          </button>
        </div>
      </div>
    `
    showInfoWindow({ lat: poiInfo.lat, lng: poiInfo.lng }, content)
  }

  // 对话框管理
  const openNewMarkerDialog = (location?: Location): void => {
    if (location) {
      selectedLocation.value = location
    }
    markerName.value = ''
    showNewMarkerDialog.value = true
  }

  const closeNewMarkerDialog = (): void => {
    showNewMarkerDialog.value = false
    markerName.value = ''
  }

  const openEditDialog = (marker: { index: number; data: any }): void => {
    editingMarker.value = marker
    markerName.value = marker.data.name || ''
    showEditDialog.value = true
  }

  const closeEditDialog = (): void => {
    showEditDialog.value = false
    editingMarker.value = null
    markerName.value = ''
  }

  const openSettingsDialog = (): void => {
    showSettings.value = true
  }

  const closeSettingsDialog = (): void => {
    showSettings.value = false
  }

  // 确认对话框
  const confirmDeleteLocation = (locationName: string): Promise<boolean> => {
    return ElMessageBox.confirm(
      `确定要删除位置 "${locationName}" 吗？此操作不可恢复。`,
      '删除位置',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => true).catch(() => false)
  }

  // 坐标复制功能
  const copyCoordinates = async (location: Location): Promise<void> => {
    try {
      const coordText = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(coordText)
        ElMessage.success('坐标已复制到剪贴板')
      } else {
        // 备用方法
        const textArea = document.createElement('textarea')
        textArea.value = coordText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        ElMessage.success('坐标已复制到剪贴板')
      }
    } catch (error) {
      console.error('复制坐标失败:', error)
      ElMessage.error('复制坐标失败')
    }
  }

  // 全局事件处理
  const registerGlobalEventHandler = (eventName: string, handler: EventListener): void => {
    if (eventHandlers.has(eventName)) {
      window.removeEventListener(eventName, eventHandlers.get(eventName)!)
    }
    
    eventHandlers.set(eventName, handler)
    window.addEventListener(eventName, handler)
  }

  const unregisterGlobalEventHandler = (eventName: string): void => {
    const handler = eventHandlers.get(eventName)
    if (handler) {
      window.removeEventListener(eventName, handler)
      eventHandlers.delete(eventName)
    }
  }

  const unregisterAllGlobalEventHandlers = (): void => {
    eventHandlers.forEach((handler, eventName) => {
      window.removeEventListener(eventName, handler)
    })
    eventHandlers.clear()
  }

  // 初始化全局事件监听
  const initializeGlobalEvents = (): void => {
    // 标记编辑事件
    registerGlobalEventHandler('marker-edit', ((e: CustomEvent) => {
      const { id, index } = e.detail
      if (typeof index === 'number') {
        // 通过索引编辑
        openEditDialog({ index, data: { id } })
      } else {
        // 通过ID查找并编辑
        console.log('编辑标记:', id)
      }
    }) as EventListener)

    // 标记居中事件
    registerGlobalEventHandler('marker-center', ((e: CustomEvent) => {
      const { lat, lng } = e.detail
      // 这里需要与地图状态管理器通信
      console.log('居中到位置:', lat, lng)
    }) as EventListener)

    // 标记删除事件
    registerGlobalEventHandler('marker-delete', ((e: CustomEvent) => {
      const { id, index } = e.detail
      console.log('删除标记:', id, index)
    }) as EventListener)

    // 标记保存事件
    registerGlobalEventHandler('marker-save', ((e: CustomEvent) => {
      const { lat, lng } = e.detail
      openNewMarkerDialog({ 
        name: '新位置', 
        lat, 
        lng, 
        id: `temp_${Date.now()}` 
      })
    }) as EventListener)

    // POI保存事件
    registerGlobalEventHandler('poi-save', ((e: CustomEvent) => {
      try {
        const poiData = JSON.parse(decodeURIComponent(e.detail.poi))
        openNewMarkerDialog({
          name: poiData.name || poiData.title,
          lat: poiData.lat,
          lng: poiData.lng,
          id: `poi_${Date.now()}`,
        })
      } catch (error) {
        console.error('解析POI数据失败:', error)
      }
    }) as EventListener)
  }

  // 清理资源
  const cleanup = (): void => {
    unregisterAllGlobalEventHandlers()
    hideInfoWindow()
    selectedLocation.value = null
  }

  // 初始化
  const initializeInteraction = (): void => {
    initializeGlobalEvents()
  }

  return {
    // 交互状态
    selectedLocation,
    isMarkerClick,
    lastMarkerClickTime,
    
    // 信息窗口状态
    infoWindowRef,
    infoWindowVisible,
    infoWindowPosition,
    infoWindowContent,
    infoWindowOptions,
    
    // 对话框状态
    showNewMarkerDialog,
    showEditDialog,
    showSettings,
    markerName,
    editingMarker,
    
    // 事件处理方法
    handleMapClick,
    handleMarkerClick,
    
    // 信息窗口方法
    showInfoWindow,
    hideInfoWindow,
    showMarkerInfoWindow,
    showPoiInfoWindow,
    
    // 对话框方法
    openNewMarkerDialog,
    closeNewMarkerDialog,
    openEditDialog,
    closeEditDialog,
    openSettingsDialog,
    closeSettingsDialog,
    
    // 工具方法
    confirmDeleteLocation,
    copyCoordinates,
    
    // 事件管理方法
    registerGlobalEventHandler,
    unregisterGlobalEventHandler,
    unregisterAllGlobalEventHandlers,
    
    // 初始化和清理
    initializeInteraction,
    cleanup,
  }
}
