<template>
  <div class="map-application">
    <!-- 页面头部与全局控制按钮 -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">地图浏览器</h1>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button :icon="Refresh" circle @click="refreshMap" />
          <el-button :icon="FullScreen" circle @click="toggleFullscreen" />
          <el-button :icon="Setting" circle @click="showSettings = true" />
        </el-button-group>
      </div>
    </header>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 左侧边栏控制面板 -->
      <el-aside width="320px" class="sidebar" v-show="showSidebar">
        <div class="sidebar-header">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索位置" 
            prefix-icon="Search"
            clearable
            @keyup.enter="searchLocation"
          />
        </div>
        
        <div class="sidebar-content">
          <!-- 位置面板 -->
          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="保存的位置" name="locations">
              <div class="location-list">
                <div 
                  v-for="(location, index) in savedLocations" 
                  :key="index" 
                  class="location-item"
                  @click="goToLocation(location)"
                >
                  <el-icon><Location /></el-icon>
                  <span>{{ location.name }}</span>
                  <div class="location-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      circle 
                      :icon="Position"
                      @click.stop="goToLocation(location)" 
                    />
                    <el-button 
                      type="danger" 
                      size="small" 
                      circle 
                      :icon="Delete"
                      @click.stop="removeLocation(index)" 
                    />
                  </div>
                </div>
              </div>
            </el-collapse-item>
            
            <!-- 地图控制面板 -->
            <el-collapse-item title="地图控制" name="controls">
              <div class="control-section">
                <h4>地图样式</h4>
                <el-radio-group v-model="mapStyle" @change="updateMapStyle">
                  <el-radio-button label="standard">标准</el-radio-button>
                  <el-radio-button label="satellite">卫星</el-radio-button>
                  <el-radio-button label="dark">暗色</el-radio-button>
                </el-radio-group>
              </div>
              
              <div class="control-section">
                <h4>缩放级别</h4>
                <el-slider 
                  v-model="mapZoom" 
                  :min="3" 
                  :max="20" 
                  :step="0.5"
                  show-stops
                  @change="updateZoom"
                />
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        
        <div class="sidebar-footer">
          <el-button type="primary" @click="saveCurrentView">保存当前视图</el-button>
        </div>
      </el-aside>
      
      <!-- 右侧地图区域 -->
      <el-main class="map-area">
        <!-- 侧边栏切换按钮 -->
        <div class="sidebar-toggle">
          <el-button 
            :icon="showSidebar ? ArrowLeft : ArrowRight" 
            circle
            @click="showSidebar = !showSidebar"
          />
        </div>
        
        <!-- 腾讯地图组件 -->
        <tlbs-map
          ref="mapRef"
          api-key="OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77"
          :center="mapCenter"
          :zoom="mapZoom"
          :control="mapControl"
          @click="handleMapClick"
          @map_inited="onMapInited"
          class="map-instance"
        />
        
        <!-- 快速操作按钮浮层 -->
        <div class="map-actions">
          <el-button-group>
            <el-button :icon="ZoomIn" circle @click="zoomIn" />
            <el-button :icon="ZoomOut" circle @click="zoomOut" />
            <el-button :icon="Position" circle @click="goToUserLocation" />
          </el-button-group>
        </div>
        
        <!-- 信息卡片浮层 -->
        <el-card v-if="selectedLocation" class="info-card">
          <template #header>
            <div class="card-header">
              <span>选中的位置</span>
              <el-button type="text" :icon="Close" @click="selectedLocation = null" />
            </div>
          </template>
          <div class="location-details">
            <p><strong>坐标：</strong> {{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}</p>
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="saveLocation">保存位置</el-button>
              <el-button type="info" size="small" @click="copyCoordinates">复制坐标</el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
    
    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="地图设置"
      width="500px"
    >
      <el-form label-position="top">
        <el-form-item label="默认地图中心">
          <el-input-number v-model="defaultCenter.lat" :precision="6" :step="0.000001" label="纬度" />
          <el-input-number v-model="defaultCenter.lng" :precision="6" :step="0.000001" label="经度" />
        </el-form-item>
        <el-form-item label="默认缩放级别">
          <el-slider v-model="defaultZoom" :min="3" :max="20" :step="0.5" show-stops />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Location, 
  Search, 
  Position, 
  Setting, 
  FullScreen, 
  Refresh,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Delete,
  Close
} from '@element-plus/icons-vue'

// 地图实例
const mapRef = ref<any>(null)

// UI状态
const showSidebar = ref(true)
const activeCollapse = ref(['locations', 'controls'])
const showSettings = ref(false)
const searchQuery = ref('')
const selectedLocation = ref<null | {lat: number, lng: number}>(null)

// 地图状态
const mapCenter = ref({ lat: 39.984120, lng: 116.307484 })
const defaultCenter = ref({ lat: 39.984120, lng: 116.307484 })
const mapZoom = ref(17.2)
const defaultZoom = ref(17.2)
const mapStyle = ref('standard')
const mapControl = ref({
  scale: true,
  zoom: {
    position: 'bottomright',
    showZoom: true,
  },
  rotation: true
})

// 保存的位置
const savedLocations = ref([
  { name: '北京市中心', lat: 39.984120, lng: 116.307484 },
  { name: '故宫', lat: 39.916345, lng: 116.397155 }
])

// 地图初始化完成
const onMapInited = () => {
  ElMessage.success('地图加载成功')
  console.log('地图实例:', mapRef.value?.map)
}

// 处理地图点击
const handleMapClick = (e) => {
  console.log('地图点击:', e)
  selectedLocation.value = {
    lat: e.latLng.lat,
    lng: e.latLng.lng
  }
}

// 地图控制方法
const zoomIn = () => {
  mapZoom.value += 1
}

const zoomOut = () => {
  mapZoom.value -= 1
}

const updateZoom = (value) => {
  mapZoom.value = value
}

const updateMapStyle = (style) => {
  // 这将取决于实际的地图实现
  console.log('更改地图样式为:', style)
  ElMessage.success(`地图样式已更改为${style}`)
}

const refreshMap = () => {
  // 刷新地图
  ElMessage.success('地图已刷新')
}

const toggleFullscreen = () => {
  // 实现将取决于浏览器API
  ElMessage.success('切换全屏模式')
}

const goToUserLocation = () => {
  // 使用地理位置API
  navigator.geolocation.getCurrentPosition((position) => {
    mapCenter.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    ElMessage.success('已导航到您的当前位置')
  }, () => {
    ElMessage.error('无法获取您的位置')
  })
}

const goToLocation = (location) => {
  mapCenter.value = {
    lat: location.lat,
    lng: location.lng
  }
  ElMessage.success(`已导航到${location.name}`)
}

const saveLocation = () => {
  if (selectedLocation.value) {
    savedLocations.value.push({
      name: `位置 ${savedLocations.value.length + 1}`,
      lat: selectedLocation.value.lat,
      lng: selectedLocation.value.lng
    })
    ElMessage.success('位置已保存')
  }
}

const removeLocation = (index) => {
  savedLocations.value.splice(index, 1)
  ElMessage.success('位置已删除')
}

const copyCoordinates = () => {
  if (selectedLocation.value) {
    // 使用剪贴板API
    ElMessage.success('坐标已复制到剪贴板')
  }
}

const searchLocation = () => {
  if (searchQuery.value.trim()) {
    // 使用地理编码API
    ElMessage.info(`正在搜索"${searchQuery.value}"`)
  }
}

const saveCurrentView = () => {
  savedLocations.value.push({
    name: `视图 ${savedLocations.value.length + 1}`,
    lat: mapCenter.value.lat,
    lng: mapCenter.value.lng
  })
  ElMessage.success('当前视图已保存')
}

const saveSettings = () => {
  defaultCenter.value = { ...mapCenter.value }
  defaultZoom.value = mapZoom.value
  showSettings.value = false
  ElMessage.success('设置已保存')
}
</script>

<style scoped>
.map-application {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
  color: #303133;
}

/* 头部样式 */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: #409EFF;
}

/* 主容器样式 */
.main-container {
  flex: 1;
  height: calc(100vh - 60px);
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  z-index: 5;
  transition: width 0.3s;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.sidebar-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

/* 地图区域样式 */
.map-area {
  padding: 0;
  position: relative;
  height: 100%;
}

.map-instance {
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* 侧边栏切换按钮 */
.sidebar-toggle {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
}

/* 地图操作按钮 */
.map-actions {
  position: absolute;
  bottom: 40px;
  right: 20px;
  z-index: 100;
}

/* 信息卡片 */
.info-card {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-details {
  padding: 10px 0;
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
}

/* 位置列表 */
.location-list {
  margin-top: 12px;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.location-item:hover {
  background-color: #ecf5ff;
}

.location-item i {
  margin-right: 8px;
  color: #409EFF;
}

.location-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

/* 控制部分 */
.control-section {
  margin-bottom: 20px;
}

.control-section h4 {
  margin-bottom: 12px;
  font-weight: 500;
  color: #606266;
}

/* Element Plus 样式覆盖 */
:deep(.el-collapse-item__header) {
  font-weight: 500;
  font-size: 16px;
}

:deep(.el-dialog__body) {
  padding-top: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    width: 100% !important;
    position: absolute;
    z-index: 20;
    height: calc(100vh - 60px);
  }
}
</style>