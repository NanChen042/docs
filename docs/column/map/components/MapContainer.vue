<template>
  <div class="map-view" :class="{'map-fullwidth': isMobile && !showControls}">
    <!-- 加载状态 -->
    <div v-if="mapLoading" class="map-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ loadingTip }}</span>
      <div class="loading-progress">
        <div class="loading-progress-bar"></div>
      </div>
    </div>

    <!-- 地图工具栏 -->
    <div class="map-toolbar">
      <el-button-group>
        <el-tooltip content="放大" placement="left">
          <el-button :icon="Plus" circle @click="zoomIn"></el-button>
        </el-tooltip>
        <el-tooltip content="缩小" placement="left">
          <el-button :icon="Minus" circle @click="zoomOut"></el-button>
        </el-tooltip>
      </el-button-group>

      <el-button-group>
        <el-tooltip content="定位到当前位置" placement="left">
          <el-button :icon="Location" circle :loading="isLocating" @click="centerMap"></el-button>
        </el-tooltip>
        <el-tooltip content="卫星图" placement="left">
          <el-button :icon="PictureFilled" circle :type="isSatellite ? 'primary' : ''" @click="toggleSatellite"></el-button>
        </el-tooltip>
        <el-tooltip content="标记工具" placement="left">
          <el-button :icon="Position" circle :type="isMarkingMode ? 'success' : ''" @click="toggleMarkingMode"></el-button>
        </el-tooltip>
      </el-button-group>
    </div>

    <!-- 标记提示文字 -->
    <div class="marking-tooltip" v-if="isMarkingMode">
      <el-alert
        title="点击地图添加新标记"
        type="success"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 腾讯地图组件 -->
    <div class="tencent-map">
      <!-- 直接使用腾讯地图API -->
      <div ref="mapElement" class="tmap-container"></div>

      <!-- 加载状态 -->
      <div v-if="mapLoading" class="map-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ loadingTip }}</span>
        <div class="loading-progress">
          <div class="loading-progress-bar"></div>
        </div>
      </div>
    </div>

    <!-- 地图控制组件 -->
    <div class="map-controls-panel" v-if="!mapLoading">
      <el-alert
        type="success"
        show-icon
        :closable="false"
      >
        <template #title>
          腾讯地图已加载成功
        </template>
        <template #default>
          <div class="map-controls-actions">
            <el-button size="small" type="primary" @click="handleReloadMap">刷新地图</el-button>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 地图加载错误时的提示 -->
    <div class="map-controls-panel" v-else-if="loadRetryCount > maxRetryCount">
      <el-alert
        type="error"
        show-icon
        :closable="false"
      >
        <template #title>
          地图加载遇到问题
        </template>
        <template #default>
          <div class="map-controls-actions">
            <el-button size="small" type="primary" @click="handleReloadMap">手动重新加载</el-button>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 信息卡片组件 -->
    <slot name="infoCard"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, defineExpose, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading, Plus, Minus, Location, PictureFilled, Position
} from '@element-plus/icons-vue'
import { useData } from 'vitepress'

// 添加类型声明
declare global {
  interface Window {
    TMap: any;
  }
}

// 定义组件属性
const props = defineProps({
  mapCenter: {
    type: Object,
    default: () => ({ lat: 31.230416, lng: 121.473701 }) // 上海市中心
  },
  mapZoom: {
    type: Number,
    default: 12
  },
  isSatellite: {
    type: Boolean,
    default: false
  },
  isMarkingMode: {
    type: Boolean,
    default: false
  },
  mapLayers: {
    type: Object,
    default: () => ({
      traffic: false,
      poi: true,
      transit: false
    })
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  showControls: {
    type: Boolean,
    default: true
  }
})

// 定义组件事件
const emit = defineEmits([
  'mapReady',
  'mapClick',
  'markerClick',
  'zoomChange',
  'centerChange',
  'mapLoaded',
  'mapError',
  'toggleMarkingMode',
  'centerMap',
  'toggleSatellite',
  'zoomIn',
  'zoomOut'
])

// 获取主题状态
const { isDark } = useData()

// 地图相关引用
const mapElement = ref<HTMLDivElement | null>(null)
let mapInstance: any = null // 腾讯地图实例
let markerLayer: any = null // 标记图层
let rectangleLayer: any = null // 矩形图层
let infoWindow: any = null // 信息窗口
const routeLayer = shallowRef<any>(null) // 路线图层

// 定位相关状态
const isLocating = ref(false)

// 加载状态
const mapLoading = ref(true)
const loadingTip = ref('正在加载地图资源...')
const loadRetryCount = ref(0)
const maxRetryCount = 3

// 标记加载状态
let mapApiLoaded = false
let mapInitialized = false

// 加载腾讯地图API
const loadMapScript = () => {
  return new Promise<void>((resolve, reject) => {
    // 如果已经加载过，直接返回
    if (window.TMap || mapApiLoaded) {
      console.log('腾讯地图API已加载，跳过重复加载')
      resolve()
      return
    }

    console.log('开始加载腾讯地图API...')
    loadingTip.value = '正在加载地图资源...'
    mapApiLoaded = true // 标记正在加载

    const script = document.createElement('script')
    script.src = 'https://map.qq.com/api/gljs?v=1.exp&key=ZXSBZ-S2GWT-UQJXD-V75OA-7DYIH-NJBYH'
    script.async = true

    // 添加加载超时处理
    const timeoutId = setTimeout(() => {
      if (!window.TMap) {
        console.error('腾讯地图API加载超时')
        mapApiLoaded = false // 重置加载标志，允许重试
        reject(new Error('加载超时'))
      }
    }, 10000) // 10秒超时

    script.onload = () => {
      console.log('腾讯地图API加载完成')
      clearTimeout(timeoutId)
      resolve()
    }

    script.onerror = (error) => {
      console.error('腾讯地图API加载失败', error)
      clearTimeout(timeoutId)
      mapApiLoaded = false // 重置加载标志，允许重试
      reject(new Error('加载失败'))
    }

    document.head.appendChild(script)
  })
}

// 初始化地图
const initMap = async () => {
  // 如果已经初始化，避免重复初始化
  if (mapInitialized && mapInstance) {
    console.log('地图已初始化，跳过重复初始化')
    return
  }

  console.log('准备初始化腾讯地图...')
  mapLoading.value = true

  try {
    // 加载地图API
    await loadMapScript()
    loadingTip.value = '正在初始化地图...'

    // 确保DOM元素存在
    if (!mapElement.value) {
      console.error('地图容器元素不存在')
      throw new Error('地图容器不存在')
    }

    // 创建腾讯地图实例
    mapInstance = new window.TMap.Map(mapElement.value, {
      center: new window.TMap.LatLng(props.mapCenter.lat, props.mapCenter.lng),
      zoom: props.mapZoom,
      pitch: 0,
      rotation: 0,
      viewMode: '2D'
    })

    // 监听地图加载完成事件
    mapInstance.on('tilesloaded', () => {
      console.log('地图瓦片加载完成')
      mapLoading.value = false
      loadRetryCount.value = 0 // 重置重试计数

      // 只在第一次完成加载时显示成功消息
      if (!mapInitialized) {
        ElMessage.success('地图加载成功')
        mapInitialized = true
        emit('mapLoaded', mapInstance)
      }
    })

    // 添加控件
    new window.TMap.ScaleControl({
      position: window.TMap.constants.CONTROL_POSITION.BOTTOM_LEFT,
      map: mapInstance
    })

    new window.TMap.ZoomControl({
      position: window.TMap.constants.CONTROL_POSITION.RIGHT_BOTTOM,
      map: mapInstance
    })

    // 初始化图层
    initMapLayers()

    // 添加点击事件
    mapInstance.on('click', onMapClick)

    // 监听地图中心点变化
    mapInstance.on('center_changed', () => {
      const center = mapInstance.getCenter()
      emit('centerChange', { lat: center.lat, lng: center.lng })
    })

    // 监听地图缩放级别变化
    mapInstance.on('zoom_changed', () => {
      emit('zoomChange', mapInstance.getZoom())
    })

    // 设置图层状态
    updateMapLayers()

    // 如果是暗色模式，设置地图样式
    if (isDark.value) {
      setDarkMode(true)
    }

    // 如果是卫星图，设置地图类型
    if (props.isSatellite) {
      mapInstance.setMapType('satellite')
    }

    // 通知父组件地图已就绪
    emit('mapReady', mapInstance)

    console.log('地图初始化完成')
    mapInitialized = true
  } catch (error) {
    console.error('初始化地图失败', error)
    loadRetryCount.value++

    if (loadRetryCount.value <= maxRetryCount) {
      // 自动重试
      loadingTip.value = `地图加载中，正在重试 (${loadRetryCount.value}/${maxRetryCount})...`
      console.log(`自动重试加载地图 (${loadRetryCount.value}/${maxRetryCount})...`)

      // 重置标记，允许重试
      mapApiLoaded = false

      // 延迟重试
      setTimeout(() => {
        initMap()
      }, 2000)
    } else {
      mapLoading.value = true // 保持加载状态
      loadingTip.value = '地图加载遇到问题，请刷新页面重试'
      console.error('多次重试后地图仍加载失败')
      emit('mapError', error)
    }
  }
}

// 初始化地图图层
const initMapLayers = () => {
  if (!mapInstance || !window.TMap) return

  try {
    // 创建标记点图层
    markerLayer = new window.TMap.MultiMarker({
      map: mapInstance,
      styles: {
        'default': new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker.png'
        }),
        'landmark': new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker_red.png'
        }),
        'shopping': new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker_blue.png'
        }),
        'restaurant': new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker_yellow.png'
        }),
        'hotel': new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker_green.png'
        }),
        'start': new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png'
        }),
        'end': new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/end.png'
        })
      },
      geometries: []
    })

    // 创建信息窗口
    infoWindow = new window.TMap.InfoWindow({
      map: mapInstance,
      position: new window.TMap.LatLng(props.mapCenter.lat, props.mapCenter.lng),
      offset: { x: 0, y: -32 },
      content: '',
      visible: false
    })

    // 创建矩形图层
    rectangleLayer = new window.TMap.MultiPolygon({
      map: mapInstance,
      styles: {
        'default': new window.TMap.PolygonStyle({
          color: 'rgba(0, 135, 255, 0.2)',
          showBorder: true,
          borderColor: 'rgba(0, 135, 255, 0.5)',
          borderWidth: 2
        })
      },
      geometries: []
    })

    // 创建路线图层
    routeLayer.value = new window.TMap.MultiPolyline({
      map: mapInstance,
      styles: {
        'default': new window.TMap.PolylineStyle({
          color: '#3777FF',
          width: 8,
          borderWidth: 2,
          borderColor: '#FFF',
          lineCap: 'round'
        }),
        'walking': new window.TMap.PolylineStyle({
          color: '#3CB371', // 步行路线颜色
          width: 8,
          borderWidth: 2,
          borderColor: '#FFF',
          lineCap: 'round'
        }),
        'bicycling': new window.TMap.PolylineStyle({
          color: '#FF7F00', // 骑行路线颜色
          width: 8,
          borderWidth: 2,
          borderColor: '#FFF',
          lineCap: 'round'
        }),
        'transit': new window.TMap.PolylineStyle({
          color: '#8A2BE2', // 公交路线颜色
          width: 8,
          borderWidth: 2,
          borderColor: '#FFF',
          lineCap: 'round'
        })
      },
      geometries: []
    })

    // 添加标记点点击事件
    markerLayer.on('click', onMarkerClick)

    console.log('地图图层初始化完成')
  } catch (error) {
    console.error('初始化地图图层失败', error)
  }
}

// 更新地图图层
const updateMapLayers = () => {
  if (!mapInstance || !window.TMap) return

  try {
    // 交通图层
    const trafficLayers = mapInstance.getLayers().filter((layer: any) =>
      layer instanceof window.TMap.TrafficLayer
    )

    if (props.mapLayers.traffic && trafficLayers.length === 0) {
      mapInstance.addLayer(new window.TMap.TrafficLayer())
    } else if (!props.mapLayers.traffic && trafficLayers.length > 0) {
      trafficLayers.forEach((layer: any) => mapInstance.removeLayer(layer))
    }

    // 设置POI图层显示
    if (mapInstance.setFeatures) {
      const features: string[] = []
      if (props.mapLayers.poi) features.push('point')
      if (props.mapLayers.transit) features.push('road')
      mapInstance.setFeatures(features)
    }

    console.log('已更新地图图层')
  } catch (error) {
    console.error('更新地图图层失败', error)
  }
}

// 设置地图暗黑模式
const setDarkMode = (isDark: boolean) => {
  if (!mapInstance || !window.TMap) return

  try {
    if (mapInstance.setMapStyleId) {
      const styleId = isDark ? 'style2' : 'style1'
      mapInstance.setMapStyleId(styleId)
      console.log(`设置地图样式: ${isDark ? '暗色' : '亮色'}`)
    }
  } catch (error) {
    console.error('设置地图主题失败', error)
  }
}

// 地图点击事件处理
const onMapClick = (e: any) => {
  if (!e || !e.latLng) return

  // 关闭信息窗口
  if (infoWindow) {
    infoWindow.setVisible(false)
  }

  // 发送点击事件到父组件
  emit('mapClick', {
    lat: e.latLng.lat,
    lng: e.latLng.lng,
    isMarkingMode: props.isMarkingMode
  })
}

// 标记点点击事件处理
const onMarkerClick = (evt: any) => {
  if (!evt || !evt.geometry) return

  try {
    const marker = evt.geometry
    const properties = marker.properties

    // 打开信息窗口
    if (infoWindow) {
      // 构建信息窗口内容
      const content = `
        <div style="padding: 8px 10px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px;">${properties.title}</div>
          <div style="font-size: 12px; color: #666;">${properties.address}</div>
        </div>
      `
      infoWindow.setContent(content)
      infoWindow.setPosition(marker.position)
      infoWindow.setVisible(true)
    }

    // 发送标记点点击事件
    emit('markerClick', {
      id: marker.id,
      position: { lat: marker.position.lat, lng: marker.position.lng },
      properties: marker.properties
    })

    console.log('标记点点击:', properties.title)
  } catch (error) {
    console.error('处理标记点点击事件失败', error)
  }
}

// 添加标记点
const addMarkers = (markers: any[]) => {
  if (!markerLayer || !window.TMap) return

  try {
    const geometries = markers.map(marker => {
      return {
        id: marker.id,
        styleId: marker.properties.category || 'default',
        position: new window.TMap.LatLng(marker.position.lat, marker.position.lng),
        properties: {
          ...marker.properties
        }
      }
    })

    markerLayer.setGeometries(geometries)
    console.log('已更新标记点，数量:', geometries.length)
  } catch (error) {
    console.error('更新标记点失败', error)
  }
}

// 清空标记点
const clearMarkers = () => {
  if (!markerLayer) return
  markerLayer.setGeometries([])
}

// 重新加载地图
const handleReloadMap = () => {
  // 重置状态
  mapLoading.value = true
  loadingTip.value = '正在重新加载地图...'
  loadRetryCount.value = 0
  mapApiLoaded = false
  mapInitialized = false

  // 清理现有实例
  cleanupResources()

  // 重新初始化
  nextTick(() => {
    initMap()
  })
}

// 缩放功能
const zoomIn = () => {
  emit('zoomIn')
  if (!mapInstance) return
  const newZoom = Math.min((mapInstance.getZoom() || 12) + 1, 19)
  mapInstance.setZoom(newZoom)
}

const zoomOut = () => {
  emit('zoomOut')
  if (!mapInstance) return
  const newZoom = Math.max((mapInstance.getZoom() || 12) - 1, 3)
  mapInstance.setZoom(newZoom)
}

// 定位到当前位置
const centerMap = () => {
  emit('centerMap')
  isLocating.value = true

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        if (mapInstance) {
          mapInstance.setCenter(new window.TMap.LatLng(currentPosition.lat, currentPosition.lng))
          mapInstance.setZoom(16)

          // 添加定位标记
          addUserLocationMarker(currentPosition.lat, currentPosition.lng)
        }

        isLocating.value = false
      },
      (error) => {
        console.error('获取位置失败:', error)
        ElMessage.error('获取位置失败，请检查定位权限')
        isLocating.value = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  } else {
    ElMessage.error('您的浏览器不支持地理定位')
    isLocating.value = false
  }
}

// 添加用户位置标记
const addUserLocationMarker = (lat: number, lng: number) => {
  if (!mapInstance || !window.TMap) return

  try {
    // 添加或更新用户位置标记
    const userMarker = {
      id: 'user-location',
      styleId: 'default',
      position: new window.TMap.LatLng(lat, lng),
      properties: {
        title: '当前位置',
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        category: 'default'
      }
    }

    // 获取现有标记，过滤掉用户位置标记
    const markers = markerLayer.getGeometries().filter((m: any) => m.id !== 'user-location')
    markerLayer.setGeometries([...markers, userMarker])
  } catch (error) {
    console.error('添加用户位置标记失败:', error)
  }
}

// 切换卫星图
const toggleSatellite = () => {
  emit('toggleSatellite')
  if (mapInstance && mapInstance.setMapType) {
    const mapType = !props.isSatellite ? 'satellite' : 'roadmap'
    mapInstance.setMapType(mapType)
  }
}

// 切换标记工具模式
const toggleMarkingMode = () => {
  emit('toggleMarkingMode')
}

// 设置地图中心点和缩放级别
const setMapView = (center: { lat: number, lng: number }, zoom: number) => {
  if (!mapInstance || !window.TMap) return
  mapInstance.setCenter(new window.TMap.LatLng(center.lat, center.lng))
  mapInstance.setZoom(zoom)
}

// 绘制路线
const drawRoute = (route: any) => {
  if (!routeLayer.value || !mapInstance || !window.TMap) return

  try {
    // 将路线坐标转换为TMap坐标数组
    const path = route.points.map((point: any) => {
      return new window.TMap.LatLng(point.lat, point.lng)
    })

    // 清除之前的路线
    routeLayer.value.setGeometries([])

    // 添加新路线
    routeLayer.value.add({
      id: 'route',
      styleId: route.mode || 'default',
      paths: [path]
    })

    // 设置起点和终点标记
    const startMarker = {
      id: 'route-start',
      styleId: 'start',
      position: new window.TMap.LatLng(route.start.lat, route.start.lng),
      properties: {
        title: route.start.title || '起点',
        address: '起点'
      }
    }

    const endMarker = {
      id: 'route-end',
      styleId: 'end',
      position: new window.TMap.LatLng(route.end.lat, route.end.lng),
      properties: {
        title: route.end.title || '终点',
        address: '终点'
      }
    }

    // 更新标记
    if (markerLayer) {
      // 移除之前的路线起点和终点标记
      const markers = markerLayer.getGeometries()
      const filteredMarkers = markers.filter((marker: any) =>
        marker.id !== 'route-start' && marker.id !== 'route-end'
      )

      // 添加新的起点和终点标记
      markerLayer.setGeometries([...filteredMarkers, startMarker, endMarker])
    }

    // 调整地图视野以包含整个路线
    const bounds = new window.TMap.LatLngBounds()
    path.forEach((point: any) => bounds.extend(point))
    mapInstance.fitBounds(bounds, {
      padding: 100
    })

    console.log('路线绘制完成')
  } catch (error) {
    console.error('绘制路线失败:', error)
  }
}

// 清除路线
const clearRoute = () => {
  if (!routeLayer.value) return

  try {
    routeLayer.value.setGeometries([])

    // 移除起点和终点标记
    if (markerLayer) {
      const markers = markerLayer.getGeometries()
      const filteredMarkers = markers.filter((marker: any) =>
        marker.id !== 'route-start' && marker.id !== 'route-end'
      )
      markerLayer.setGeometries(filteredMarkers)
    }
  } catch (error) {
    console.error('清除路线失败:', error)
  }
}

// 清理资源
const cleanupResources = () => {
  if (mapInstance) {
    try {
      // 移除事件监听器
      mapInstance.off('tilesloaded')
      mapInstance.off('click')
      mapInstance.off('center_changed')
      mapInstance.off('zoom_changed')

      // 清理图层
      if (markerLayer) {
        markerLayer.off('click')
        markerLayer = null
      }

      rectangleLayer = null
      infoWindow = null
      routeLayer.value = null

      // 销毁地图实例
      mapInstance.destroy()
      mapInstance = null
    } catch (e) {
      console.error('清理地图资源时出错', e)
    }
  }
}

// 监听主题变化
watch(isDark, (newIsDark) => {
  setDarkMode(newIsDark)
})

// 监听属性变化
watch(() => props.mapLayers, () => {
  updateMapLayers()
}, { deep: true })

watch(() => props.isSatellite, (newValue) => {
  if (mapInstance && mapInstance.setMapType) {
    const mapType = newValue ? 'satellite' : 'roadmap'
    mapInstance.setMapType(mapType)
  }
})

watch(() => props.mapCenter, (newCenter) => {
  if (mapInstance && newCenter) {
    mapInstance.setCenter(new window.TMap.LatLng(newCenter.lat, newCenter.lng))
  }
}, { deep: true })

watch(() => props.mapZoom, (newZoom) => {
  if (mapInstance && newZoom) {
    mapInstance.setZoom(newZoom)
  }
})

// 组件挂载时初始化地图
onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

// 组件卸载时清理资源
onUnmounted(() => {
  cleanupResources()
})

// 暴露方法供父组件调用
defineExpose({
  addMarkers,
  clearMarkers,
  setMapView,
  centerMap,
  drawRoute,
  clearRoute,
  zoomIn,
  zoomOut,
  toggleSatellite,
  handleReloadMap
})
</script>

<style scoped>
.map-view {
  flex: 1;
  position: relative;
  transition: all 0.3s ease;
}

.map-fullwidth {
  width: 100%;
}

.map-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 20;
}

.marking-tooltip {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 20;
  max-width: 240px;
}

.tencent-map {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  background-color: #f0f0f0;
  overflow: hidden;
  z-index: 1;
}

.tmap-container {
  width: 100%;
  height: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(245, 245, 245, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.map-loading .el-icon {
  font-size: 36px;
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.map-loading span {
  font-size: 16px;
  color: var(--el-text-color-primary);
  margin-bottom: 20px;
}

/* 加载进度条 */
.loading-progress {
  width: 60%;
  max-width: 300px;
  height: 6px;
  background-color: var(--el-color-info-light-8);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.loading-progress-bar {
  position: absolute;
  height: 100%;
  width: 30%;
  background-color: var(--el-color-primary);
  border-radius: 3px;
  animation: progress-animation 1.5s infinite ease-in-out;
}

@keyframes progress-animation {
  0% {
    left: -30%;
  }
  100% {
    left: 100%;
  }
}

:root.dark .map-loading {
  background-color: rgba(30, 30, 30, 0.8);
}

.map-controls-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 240px;
  z-index: 20;
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.map-controls-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 定位点脉动动画 */
.location-pulse {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: scale(0.8);
    opacity: 1;
  }
}
</style>
