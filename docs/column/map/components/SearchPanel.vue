<template>
  <div class="controls-section">
    <div class="section-header">
      <h3 class="section-title">地点搜索</h3>
      <el-tooltip content="切换搜索模式" placement="top">
        <el-dropdown trigger="click" @command="changeSearchMode">
          <el-button class="button" text :icon="Setting"></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="keyword">关键词搜索</el-dropdown-item>
              <el-dropdown-item command="nearby">周边搜索</el-dropdown-item>
              <el-dropdown-item command="region">城市/区域搜索</el-dropdown-item>
              <el-dropdown-item command="rectangle">矩形范围搜索</el-dropdown-item>
              <el-dropdown-item command="recommend">周边推荐</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>
    <div class="section-content">
      <!-- 标准关键词搜索 -->
      <div v-if="searchMode === 'keyword'" class="search-panel">
        <div class="search-input-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索地点、景点、建筑等"
            size="large"
            @keyup.enter="keywordSearch"
            @input="handleSearchInput"
            clearable
          >
            <template #append>
              <el-button :icon="Search" @click="keywordSearch" :loading="isLoadingSuggestions"></el-button>
            </template>
          </el-input>

          <!-- 搜索提示下拉列表 -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-container">
            <ul class="suggestions-list">
              <li v-for="(item, index) in suggestions"
                  :key="index"
                  class="suggestion-item"
                  @click="selectSuggestion(item)">
                <div class="suggestion-icon">
                  <el-icon v-if="item.type === 0"><Location /></el-icon>
                  <el-icon v-else-if="item.type === 1"><Van /></el-icon>
                  <el-icon v-else-if="item.type === 2"><Guide /></el-icon>
                  <el-icon v-else-if="item.type === 3"><Connection /></el-icon>
                  <el-icon v-else><Place /></el-icon>
                </div>
                <div class="suggestion-content">
                  <div class="suggestion-title">{{ item.title }}</div>
                  <div v-if="item.address" class="suggestion-address">{{ item.address }}</div>
                  <div v-if="item._distance" class="suggestion-distance">
                    {{ formatDistance(item._distance) }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="search-button">
          <el-button type="primary" @click="keywordSearch" :loading="searchInProgress">搜索</el-button>
        </div>
      </div>

      <!-- 周边搜索 -->
      <div v-else-if="searchMode === 'nearby'" class="search-panel">
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索关键词..."
            class="search-input"
            :prefix-icon="Search"
            clearable
          >
            <template #append>
              <el-button :icon="Search" @click="onSearchNearby"></el-button>
            </template>
          </el-input>
        </div>
        <div class="radius-slider">
          <span>搜索半径: {{ searchRadius }}米</span>
          <el-slider
            v-model="searchRadius"
            :min="100"
            :max="5000"
            :step="100"
            show-stops
          ></el-slider>
        </div>
        <div class="search-options">
          <el-checkbox v-model="autoExtend">无结果时自动扩大范围</el-checkbox>
        </div>
        <el-button type="primary" block @click="onSearchNearby">搜索周边</el-button>
      </div>

      <!-- 城市/区域搜索 -->
      <div v-else-if="searchMode === 'region'" class="search-panel">
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索关键词..."
            class="search-input"
            :prefix-icon="Search"
            clearable
          ></el-input>
        </div>
        <div class="city-selector">
          <el-input v-model="searchCity" placeholder="输入城市名称或区域代码">
            <template #prepend>城市</template>
          </el-input>
        </div>
        <div class="search-options">
          <el-checkbox v-model="autoExtend">无结果时自动扩大范围</el-checkbox>
        </div>
        <el-button type="primary" block @click="onSearchByRegion">区域搜索</el-button>
      </div>

      <!-- 矩形范围搜索 -->
      <div v-else-if="searchMode === 'rectangle'" class="search-panel">
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索关键词..."
            class="search-input"
            :prefix-icon="Search"
            clearable
          ></el-input>
        </div>
        <div class="rectangle-selector">
          <div class="coordinate-inputs">
            <div class="coordinate-group">
              <div class="coordinate-label">左下角坐标</div>
              <el-input-number v-model="rectangleSW.lat" :precision="6" :step="0.000001" placeholder="纬度"></el-input-number>
              <el-input-number v-model="rectangleSW.lng" :precision="6" :step="0.000001" placeholder="经度"></el-input-number>
            </div>
            <div class="coordinate-group">
              <div class="coordinate-label">右上角坐标</div>
              <el-input-number v-model="rectangleNE.lat" :precision="6" :step="0.000001" placeholder="纬度"></el-input-number>
              <el-input-number v-model="rectangleNE.lng" :precision="6" :step="0.000001" placeholder="经度"></el-input-number>
            </div>
          </div>
          <el-button size="small" @click="setRectangleFromCurrentView">使用当前视图</el-button>
        </div>
        <el-button type="primary" block @click="onSearchByRectangle">矩形搜索</el-button>
      </div>

      <!-- 周边推荐 -->
      <div v-else-if="searchMode === 'recommend'" class="search-panel">
        <div class="radius-slider">
          <span>推荐范围: {{ searchRadius }}米</span>
          <el-slider
            v-model="searchRadius"
            :min="200"
            :max="1000"
            :step="100"
            show-stops
          ></el-slider>
        </div>
        <div class="policy-selector">
          <span class="policy-label">推荐策略:</span>
          <el-radio-group v-model="recommendPolicy">
            <el-radio :label="1">地点签到</el-radio>
            <el-radio :label="2">位置共享</el-radio>
          </el-radio-group>
        </div>
        <div class="search-options">
          <el-checkbox v-model="autoExtend">无结果时自动扩大范围</el-checkbox>
        </div>
        <el-button type="primary" block @click="onRecommend">获取周边推荐</el-button>
      </div>

      <div class="quick-actions">
        <el-button-group class="action-group">
          <el-button type="primary" :icon="Location" @click="centerMap">定位当前</el-button>
          <el-tooltip content="卫星/标准视图切换" placement="top">
            <el-button
              :type="isSatellite ? 'primary' : 'default'"
              :icon="isSatellite ? PictureFilled : PictureFilled"
              @click="toggleSatellite"
            >{{ isSatellite ? '标准视图' : '卫星视图' }}</el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <!-- 搜索结果展示 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div class="results-header">
          <div class="results-title">搜索结果 ({{ searchResults.length }})</div>
          <el-button text size="small" @click="clearSearchResults">清除</el-button>
        </div>
        <el-scrollbar height="250px">
          <div v-for="(item, index) in searchResults" :key="index" class="result-item" @click="goToSearchResult(item)">
            <div class="result-icon">
              <el-icon><Location /></el-icon>
            </div>
            <div class="result-info">
              <div class="result-title">{{ item.title }}</div>
              <div class="result-address">{{ item.address }}</div>
              <div class="result-category" v-if="item.category">{{ item.category }}</div>
              <div class="result-distance" v-if="item._distance">
                <el-tag size="small" type="info">{{ formatDistance(item._distance) }}</el-tag>
              </div>
            </div>
            <div class="result-actions">
              <el-button circle text :icon="Position" @click.stop="goToSearchResult(item)"></el-button>
              <el-button circle text :icon="Plus" @click.stop="addSearchResultAsMarker(item)"></el-button>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Setting, Location, Van, Guide, Connection,
  Place, Position, Plus, PictureFilled
} from '@element-plus/icons-vue'

// 定义接口
interface SearchResult {
  id: string
  title: string
  address: string
  tel?: string
  category?: string
  location: {
    lat: number
    lng: number
  }
  _distance?: number
  ad_info?: {
    adcode: number
    province: string
    city: string
    district: string
  }
}

// 定义组件属性
const props = defineProps({
  mapCenter: {
    type: Object,
    required: true
  },
  isSatellite: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
const emit = defineEmits([
  'search',
  'searchNearby',
  'searchByRegion',
  'searchByRectangle',
  'recommend',
  'centerMap',
  'toggleSatellite',
  'goToSearchResult',
  'addSearchResultAsMarker',
  'setRectangleFromCurrentView'
])

// 搜索模式和相关配置
const searchMode = ref('keyword')
const searchQuery = ref('')
const searchNearby = ref(true)
const searchRadius = ref(1000)
const searchCity = ref('上海')
const autoExtend = ref(true)
const recommendPolicy = ref(1)
const searchResults = ref<SearchResult[]>([])
const searchInProgress = ref(false)

// 搜索建议相关
const suggestions = ref<any[]>([])
const showSuggestions = ref(false)
const isLoadingSuggestions = ref(false)
const suggestDebounceTimer = ref<any>(null)

// 矩形区域搜索坐标
const rectangleSW = ref({ lat: 31.21, lng: 121.46 }) // 左下角
const rectangleNE = ref({ lat: 31.24, lng: 121.52 }) // 右上角

// 改变搜索模式
const changeSearchMode = (mode: string): void => {
  searchMode.value = mode
  // 重置搜索结果
  searchResults.value = []
}

// 关键词搜索
const keywordSearch = async () => {
  if (searchInProgress.value) {
    console.log('搜索正在进行中，跳过重复请求')
    return
  }

  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    searchInProgress.value = true
    console.log(`开始搜索关键词: "${searchQuery.value}"`)
    ElMessage.info(`正在搜索: ${searchQuery.value}`)

    // 发出搜索事件
    emit('search', {
      keyword: searchQuery.value,
      mode: searchMode.value
    })
  } catch (error: any) {
    console.error('搜索错误:', error)
    ElMessage.error('搜索失败: ' + (error.message || '请稍后重试'))
  } finally {
    searchInProgress.value = false
  }
}

// 周边搜索
const onSearchNearby = () => {
  if (!searchQuery.value) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  emit('searchNearby', {
    keyword: searchQuery.value,
    radius: searchRadius.value,
    autoExtend: autoExtend.value
  })
}

// 城市/区域搜索
const onSearchByRegion = () => {
  if (!searchQuery.value || !searchCity.value) {
    ElMessage.warning('请输入搜索关键词和城市')
    return
  }

  emit('searchByRegion', {
    keyword: searchQuery.value,
    city: searchCity.value,
    autoExtend: autoExtend.value
  })
}

// 矩形范围搜索
const onSearchByRectangle = () => {
  if (!searchQuery.value) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  emit('searchByRectangle', {
    keyword: searchQuery.value,
    rectangleSW: rectangleSW.value,
    rectangleNE: rectangleNE.value
  })
}

// 周边推荐
const onRecommend = () => {
  emit('recommend', {
    radius: searchRadius.value,
    policy: recommendPolicy.value,
    autoExtend: autoExtend.value
  })
}

// 使用当前视图设置矩形范围
const setRectangleFromCurrentView = () => {
  emit('setRectangleFromCurrentView')
}

// 定位当前位置
const centerMap = () => {
  emit('centerMap')
}

// 切换卫星图
const toggleSatellite = () => {
  emit('toggleSatellite')
}

// 清除搜索结果
const clearSearchResults = () => {
  searchResults.value = []
}

// 前往搜索结果位置
const goToSearchResult = (item: SearchResult) => {
  emit('goToSearchResult', item)
}

// 将搜索结果添加为标记点
const addSearchResultAsMarker = (item: SearchResult) => {
  emit('addSearchResultAsMarker', item)
}

// 搜索框输入时触发搜索建议
const handleSearchInput = (value: string) => {
  // 清除上一个定时器
  if (suggestDebounceTimer.value) {
    clearTimeout(suggestDebounceTimer.value)
  }

  // 设置新的定时器，300ms后执行搜索
  suggestDebounceTimer.value = setTimeout(() => {
    // 这里可以添加实际的获取建议逻辑
    if (value.length >= 2) {
      isLoadingSuggestions.value = true
      // 模拟获取建议数据
      setTimeout(() => {
        suggestions.value = [
          {
            title: '上海中心',
            address: '上海市浦东新区陆家嘴世纪大道100号',
            type: 0,
            _distance: 1200
          },
          {
            title: '上海迪士尼',
            address: '上海市浦东新区川沙新镇黄赵路310号',
            type: 2,
            _distance: 15600
          }
        ]
        showSuggestions.value = true
        isLoadingSuggestions.value = false
      }, 300)
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  }, 300)
}

// 选择搜索建议项
const selectSuggestion = (item: any) => {
  // 设置搜索关键词
  searchQuery.value = item.title

  // 隐藏建议列表
  showSuggestions.value = false

  // 执行搜索
  keywordSearch()
}

// 格式化距离
const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${distance.toFixed(0)}米`
  } else {
    return `${(distance / 1000).toFixed(1)}公里`
  }
}

// 更新搜索结果
const updateSearchResults = (results: SearchResult[]) => {
  searchResults.value = results
}

// 为父组件暴露方法
defineExpose({
  updateSearchResults,
  clearSearchResults
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

.search-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input-container {
  position: relative;
  flex: 1;
}

.suggestions-container {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 350px;
  overflow-y: auto;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 999;
  margin-top: 5px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.suggestion-icon {
  margin-right: 10px;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.suggestion-content {
  flex: 1;
  overflow: hidden;
}

.suggestion-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-address {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-distance {
  font-size: 12px;
  color: var(--el-color-success);
  margin-top: 2px;
}

.radius-slider {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-options {
  margin: 8px 0;
}

.city-selector {
  margin-top: 8px;
}

.rectangle-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  padding: 10px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.coordinate-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coordinate-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coordinate-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.policy-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0;
}

.policy-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.quick-actions {
  margin: 16px 0;
}

.action-group {
  width: 100%;
  display: flex;
}

.action-group .el-button {
  flex: 1;
}

/* 搜索结果样式 */
.search-results {
  margin-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.results-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: var(--el-fill-color-lighter);
  transition: all 0.2s;
  cursor: pointer;
}

.result-item:hover {
  background-color: var(--el-fill-color-light);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  overflow: hidden;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-address {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-category {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.result-distance {
  margin-top: 4px;
}

.result-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

/* 深色模式适配 */
:root.dark .result-item {
  background-color: var(--el-fill-color-dark);
}

:root.dark .result-item:hover {
  background-color: var(--el-fill-color-darker);
}

:root.dark .rectangle-selector {
  background-color: var(--el-fill-color-dark);
}

:root.dark .suggestions-container {
  background-color: var(--el-bg-color-overlay);
}

:root.dark .suggestion-item:hover {
  background-color: var(--el-color-primary-light-8);
}
</style>
