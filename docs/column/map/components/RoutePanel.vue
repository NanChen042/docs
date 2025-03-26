<template>
  <div class="route-planning-panel">
    <h3 class="panel-title">路线规划</h3>

    <!-- 交通方式选择 -->
    <div class="transit-modes">
      <el-button-group>
        <el-button
          :type="transitMode === 'driving' ? 'primary' : 'default'"
          size="small"
          @click="setTransitMode('driving')"
        >
          <el-icon><CarFilled /></el-icon>
          <span>驾车</span>
        </el-button>
        <el-button
          :type="transitMode === 'walking' ? 'primary' : 'default'"
          size="small"
          @click="setTransitMode('walking')"
        >
          <el-icon><User /></el-icon>
          <span>步行</span>
        </el-button>
        <el-button
          :type="transitMode === 'bicycling' ? 'primary' : 'default'"
          size="small"
          @click="setTransitMode('bicycling')"
        >
          <el-icon><Place /></el-icon>
          <span>骑行</span>
        </el-button>
        <el-button
          :type="transitMode === 'ebicycling' ? 'primary' : 'default'"
          size="small"
          @click="setTransitMode('ebicycling')"
        >
          <el-icon><Place /></el-icon>
          <span>电动车</span>
        </el-button>
        <el-button
          :type="transitMode === 'transit' ? 'primary' : 'default'"
          size="small"
          @click="setTransitMode('transit')"
        >
          <el-icon><Van /></el-icon>
          <span>公交</span>
        </el-button>
      </el-button-group>
    </div>

    <!-- 起点和终点输入 -->
    <div class="input-group">
      <div class="input-item">
        <el-icon class="input-icon start-icon"><LocationFilled /></el-icon>
        <el-input
          v-model="startPoint"
          placeholder="起点"
          size="default"
          class="route-input"
          @keyup.enter="searchLocation(startPoint, 'start')"
          clearable
        >
          <template #append>
            <el-button @click="useCurrentLocation('start')">
              <el-icon><Aim /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <div class="input-item">
        <el-icon class="input-icon end-icon"><LocationInformation /></el-icon>
        <el-input
          v-model="endPoint"
          placeholder="终点"
          size="default"
          class="route-input"
          @keyup.enter="searchLocation(endPoint, 'end')"
          clearable
        >
          <template #append>
            <el-button @click="useCurrentLocation('end')">
              <el-icon><Aim /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <div class="swap-button">
        <el-button @click="swapStartEnd" size="small">
          <el-icon><Sort /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 规划按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="planRoute">规划路线</el-button>
      <el-button @click="clearRoute">清除路线</el-button>
    </div>

    <!-- 路线信息 -->
    <div v-if="routeInfo" class="route-info">
      <div class="route-summary">
        <h4>路线概要</h4>
        <div class="summary-item">
          <el-icon><Timer /></el-icon>
          <span>用时: {{ routeInfo.duration }}</span>
        </div>
        <div class="summary-item">
          <el-icon><Van /></el-icon>
          <span>距离: {{ routeInfo.distance }}</span>
        </div>
      </div>

      <div class="route-steps">
        <h4>路线详情</h4>
        <el-scrollbar height="200px">
          <div v-for="(step, index) in routeInfo.steps" :key="index" class="route-step">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content" v-html="step.instruction"></div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <h4>搜索结果</h4>
      <el-scrollbar height="200px">
        <div
          v-for="(item, index) in searchResults"
          :key="index"
          class="search-result-item"
          @click="selectSearchResult(item)"
        >
          <div class="result-title">{{ item.title }}</div>
          <div class="result-address">{{ item.address }}</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
// 添加类型声明
declare global {
  interface Window {
    TMap: any;
  }
}

import { ref, computed, watch, defineEmits, defineComponent } from 'vue'
import { ElMessage } from 'element-plus'

// 定义响应类型接口
interface GeocoderResponse {
  result: {
    address?: string;
    location?: any;
    title?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface RouteResponse {
  result: {
    routes: Array<{
      distance: number;
      duration: number;
      polyline: any[];
      steps: Array<{
        instruction: string;
        distance: number;
        duration: number;
        polyline: any[];
        [key: string]: any;
      }>;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

// 定义组件需要的事件
const emit = defineEmits([
  'update-route',
  'clear-route',
  'set-start',
  'set-end'
])

// 状态变量
const transitMode = ref('driving') // 默认驾车方式
const startPoint = ref('')
const endPoint = ref('')
const startCoord = ref<{lat: number, lng: number} | null>(null)
const endCoord = ref<{lat: number, lng: number} | null>(null)
const routeInfo = ref<any>(null)
const searchResults = ref<any[]>([])
const searchTarget = ref('') // 'start' 或 'end'

// 设置交通方式
const setTransitMode = (mode) => {
  transitMode.value = mode
  // 如果已经有起点和终点，可以自动重新规划路线
  if (startCoord.value && endCoord.value) {
    planRoute()
  }
}

// 交换起点和终点
const swapStartEnd = () => {
  // 交换输入框的值
  const tempStart = startPoint.value
  startPoint.value = endPoint.value
  endPoint.value = tempStart

  // 交换坐标
  const tempStartCoord = startCoord.value
  startCoord.value = endCoord.value
  endCoord.value = tempStartCoord

  // 重新规划路线
  if (startCoord.value && endCoord.value) {
    planRoute()
  }
}

// 使用当前位置
const useCurrentLocation = (type) => {
  if (navigator.geolocation) {
    ElMessage.info('正在获取当前位置...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // 反向地理编码获取地址
        reverseGeocode(lat, lng, type)
      },
      (error) => {
        console.error('获取地理位置失败:', error)
        ElMessage.error('获取地理位置失败，请检查浏览器权限设置')
      }
    )
  } else {
    ElMessage.error('您的浏览器不支持地理定位功能')
  }
}

// 反向地理编码
const reverseGeocode = async (lat: number, lng: number, type: string) => {
  try {
    // 确保地图API已加载
    if (!window.TMap) {
      throw new Error('地图API未加载')
    }

    // 创建地理编码服务
    const geocoder = new window.TMap.service.Geocoder()

    // 执行反向地理编码
    const response = await new Promise<GeocoderResponse>((resolve, reject) => {
      geocoder.getAddress({ location: new window.TMap.LatLng(lat, lng) }, (status: number, result: any) => {
        if (status === 0) {
          resolve(result as GeocoderResponse)
        } else {
          reject(new Error(String(result)))
        }
      })
    })

    // 处理结果
    if (response && response.result && response.result.address) {
      const address = response.result.address

      if (type === 'start') {
        startPoint.value = address
        startCoord.value = { lat, lng }
        emit('set-start', { lat, lng, address })
      } else {
        endPoint.value = address
        endCoord.value = { lat, lng }
        emit('set-end', { lat, lng, address })
      }

      ElMessage.success('已设置位置')
    } else {
      throw new Error('无法获取地址信息')
    }
  } catch (error: any) {
    console.error('反向地理编码失败:', error)
    ElMessage.error('获取地址失败：' + error.message)
  }
}

// 搜索位置
const searchLocation = async (keyword: string, type: string) => {
  if (!keyword.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    // 确保地图API已加载
    if (!window.TMap) {
      throw new Error('地图API未加载')
    }

    // 创建地理编码服务
    const geocoder = new window.TMap.service.Geocoder()

    // 执行地理编码搜索
    const response = await new Promise<GeocoderResponse>((resolve, reject) => {
      geocoder.getLocation({ address: keyword }, (status: number, result: any) => {
        if (status === 0) {
          resolve(result as GeocoderResponse)
        } else {
          reject(new Error(String(result)))
        }
      })
    })

    // 处理结果
    if (response && response.result && response.result.location) {
      // 对于单个结果，直接使用
      if (!Array.isArray(response.result.location)) {
        const location = response.result.location
        const address = response.result.address || keyword

        if (type === 'start') {
          startCoord.value = { lat: location.lat, lng: location.lng }
          emit('set-start', { lat: location.lat, lng: location.lng, address })
        } else {
          endCoord.value = { lat: location.lat, lng: location.lng }
          emit('set-end', { lat: location.lat, lng: location.lng, address })
        }

        searchResults.value = []
        ElMessage.success('已设置位置')
      } else {
        // 对于多个结果，显示选择列表
        searchTarget.value = type
        searchResults.value = response.result.map((item: any) => ({
          title: item.title || '未命名位置',
          address: item.address,
          location: item.location
        }))
      }
    } else {
      throw new Error('未找到匹配的位置')
    }
  } catch (error: any) {
    console.error('搜索位置失败:', error)
    ElMessage.error('搜索位置失败：' + error.message)
  }
}

// 选择搜索结果
const selectSearchResult = (item) => {
  const location = item.location

  if (searchTarget.value === 'start') {
    startPoint.value = item.title
    startCoord.value = { lat: location.lat, lng: location.lng }
    emit('set-start', { lat: location.lat, lng: location.lng, address: item.address, title: item.title })
  } else {
    endPoint.value = item.title
    endCoord.value = { lat: location.lat, lng: location.lng }
    emit('set-end', { lat: location.lat, lng: location.lng, address: item.address, title: item.title })
  }

  searchResults.value = []
  ElMessage.success('已设置位置')
}

// 规划路线
const planRoute = async () => {
  if (!startCoord.value || !endCoord.value) {
    ElMessage.warning('请先设置起点和终点')
    return
  }

  try {
    // 确保地图API已加载
    if (!window.TMap) {
      throw new Error('地图API未加载')
    }

    // 创建路线规划服务实例
    let routeService: any

    // 根据不同交通方式选择不同的服务
    switch (transitMode.value) {
      case 'driving':
        routeService = new window.TMap.service.Driving()
        break
      case 'walking':
        routeService = new window.TMap.service.Walking()
        break
      case 'bicycling':
        routeService = new window.TMap.service.Bicycling()
        break
      case 'ebicycling':
        // 电动车可能需要使用骑行服务，参数有所不同
        routeService = new window.TMap.service.Bicycling({ ebike: true })
        break
      case 'transit':
        routeService = new window.TMap.service.Transit()
        break
      default:
        routeService = new window.TMap.service.Driving()
    }

    ElMessage.info('正在规划路线...')

    // 设置请求参数
    const from = new window.TMap.LatLng(startCoord.value.lat, startCoord.value.lng)
    const to = new window.TMap.LatLng(endCoord.value.lat, endCoord.value.lng)

    // 执行路线规划
    const response = await new Promise<RouteResponse>((resolve, reject) => {
      routeService.search({ from, to }, (status: number, result: any) => {
        if (status === 0) {
          resolve(result as RouteResponse)
        } else {
          reject(new Error('路线规划失败，状态码: ' + status))
        }
      })
    })

    // 处理结果
    if (response && response.result && response.result.routes && response.result.routes.length > 0) {
      const route = response.result.routes[0]

      // 格式化路线信息
      routeInfo.value = {
        distance: formatDistance(route.distance),
        duration: formatDuration(route.duration),
        steps: route.steps.map(step => ({
          instruction: step.instruction,
          distance: formatDistance(step.distance),
          duration: formatDuration(step.duration),
          polyline: step.polyline
        }))
      }

      // 发送路线信息到父组件
      emit('update-route', {
        points: route.polyline,
        start: { ...startCoord.value, title: startPoint.value },
        end: { ...endCoord.value, title: endPoint.value },
        mode: transitMode.value
      })

      ElMessage.success('路线规划成功')
    } else {
      throw new Error('未找到可行路线')
    }
  } catch (error: any) {
    console.error('路线规划失败:', error)
    ElMessage.error('路线规划失败：' + error.message)
  }
}

// 清除路线
const clearRoute = () => {
  routeInfo.value = null
  emit('clear-route')
  ElMessage.info('已清除路线')
}

// 格式化距离
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}米`
  } else {
    return `${(meters / 1000).toFixed(1)}公里`
  }
}

// 格式化时间
const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}


</script>

<style scoped>
.route-planning-panel {
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.transit-modes {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.input-group {
  position: relative;
  margin-bottom: 16px;
}

.input-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.input-icon {
  font-size: 20px;
  margin-right: 8px;
}

.start-icon {
  color: #67c23a;
}

.end-icon {
  color: #f56c6c;
}

.route-input {
  flex: 1;
}

.swap-button {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.route-info {
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 16px;
}

.route-summary {
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.summary-item .el-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.route-step {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.step-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.search-results {
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 16px;
}

.search-result-item {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
}

.search-result-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.result-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.result-address {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:root.dark .route-planning-panel {
  background-color: var(--el-bg-color-overlay);
}
</style>
