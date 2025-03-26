<template>
  <div class="map-container">
    <!-- 顶部横幅区域使用渐变效果 -->
    <div class="map-header">
      <div class="header-content">
        <div class="header-text">
          <h1>探索世界</h1>
          <p class="subtitle">发现身边的每一处精彩</p>
          </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Search" round @click="onSearch">开始探索</el-button>
          <el-button plain :icon="Location" round @click="centerMap">附近地点</el-button>
        </div>
      </div>
      <div class="header-backdrop"></div>
    </div>

    <!-- 主要内容区带有标签页和卡片布局 -->
    <div class="content-wrapper">
      <el-tabs class="custom-tabs" tab-position="top">
        <el-tab-pane label="地图浏览">
          <div class="map-view-container">
            <!-- 添加控制面板展开/折叠按钮 -->
            <div class="controls-toggle" @click="toggleControls">
              <el-icon v-if="!isMobile || showControls"><ArrowLeft /></el-icon>
              <el-icon v-else><ArrowRight /></el-icon>
          </div>

            <!-- 左侧控制面板，添加动态类控制显示/隐藏 -->
            <div class="map-controls" :class="{'controls-expanded': !isMobile || showControls, 'controls-collapsed': isMobile && !showControls}">
              <!-- 搜索框和位置工具 -->
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
                    <div class="search-container">
                      <el-input
                        v-model="searchQuery"
                        placeholder="搜索位置..."
                        class="search-input"
                        :prefix-icon="Search"
                        clearable
                        @keyup.enter="onSearch"
                      >
                        <template #append>
                          <el-button :icon="Search" @click="onSearch"></el-button>
                        </template>
                      </el-input>
          </div>
                    <div class="search-options">
                      <el-checkbox v-model="searchNearby">优先搜索附近</el-checkbox>
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

              <!-- 图层与设置 -->
              <div class="controls-section">
                <div class="section-header">
                  <h3 class="section-title">图层与视图</h3>
                  <el-tooltip content="图层设置" placement="top">
                    <el-button class="button" text :icon="Setting"></el-button>
                  </el-tooltip>
              </div>
                <div class="section-content">
                  <div class="layer-toggles">
                    <div class="layer-toggle-item" @click="toggleLayer('traffic')">
                      <div class="layer-toggle-icon" :class="{ 'active': mapLayers.traffic }">
                        <el-icon><Connection /></el-icon>
                  </div>
                      <div class="layer-toggle-info">
                        <div class="layer-toggle-name">实时交通</div>
                        <div class="layer-toggle-status">{{ mapLayers.traffic ? '已启用' : '已关闭' }}</div>
                    </div>
                      <el-switch v-model="mapLayers.traffic" />
                  </div>

                    <div class="layer-toggle-item" @click="toggleLayer('poi')">
                      <div class="layer-toggle-icon" :class="{ 'active': mapLayers.poi }">
                        <el-icon><Place /></el-icon>
                      </div>
                      <div class="layer-toggle-info">
                        <div class="layer-toggle-name">兴趣点</div>
                        <div class="layer-toggle-status">{{ mapLayers.poi ? '已启用' : '已关闭' }}</div>
                      </div>
                      <el-switch v-model="mapLayers.poi" />
                </div>

                    <div class="layer-toggle-item" @click="toggleLayer('transit')">
                      <div class="layer-toggle-icon" :class="{ 'active': mapLayers.transit }">
                        <el-icon><Guide /></el-icon>
                  </div>
                      <div class="layer-toggle-info">
                        <div class="layer-toggle-name">公共交通</div>
                        <div class="layer-toggle-status">{{ mapLayers.transit ? '已启用' : '已关闭' }}</div>
                      </div>
                      <el-switch v-model="mapLayers.transit" />
                    </div>
                    </div>
                  </div>
                </div>

              <!-- 收藏地点 -->
              <div class="controls-section">
                <div class="section-header">
                  <h3 class="section-title">收藏地点</h3>
                  <el-tooltip content="添加收藏" placement="top">
                    <el-button class="button" text :icon="Star"></el-button>
                  </el-tooltip>
                  </div>
                <div class="section-content">
                  <el-empty v-if="favoriteLocations.length === 0" description="暂无收藏地点" :image-size="60"></el-empty>
                  <el-scrollbar v-else height="150px" class="locations-list">
                    <div v-for="(location, index) in favoriteLocations" :key="index" class="location-item">
                      <div class="location-icon" @click="goToLocation(location)">
                        <el-icon><Location /></el-icon>
                    </div>
                      <div class="location-info" @click="goToLocation(location)">
                        <div class="location-title">{{ location.name }}</div>
                        <div class="location-address">{{ location.address }}</div>
                  </div>
                      <div class="location-actions">
                        <el-tooltip content="导航至此处" placement="top">
                          <el-button :icon="Position" circle text @click="goToLocation(location)"></el-button>
                        </el-tooltip>
                        <el-tooltip content="取消收藏" placement="top">
                          <el-button :icon="Delete" circle text></el-button>
                        </el-tooltip>
                </div>
              </div>
                  </el-scrollbar>
            </div>
              </div>

              <!-- 标记管理 -->
              <div class="controls-section">
                <div class="section-header">
                  <h3 class="section-title">标记管理</h3>
                  <div class="section-actions">
                    <el-tooltip content="清空所有标记" placement="top">
                      <el-button class="button" text :icon="Delete" @click="clearAllMarkers"></el-button>
                    </el-tooltip>
                    <el-tooltip content="添加随机标记" placement="top">
                      <el-button class="button" text :icon="Plus" @click="onAddRandomMarker"></el-button>
                    </el-tooltip>
              </div>
                    </div>
                <div class="section-content">
                  <div class="marker-filters">
                    <div class="filters-header">
                      <span>分类筛选</span>
                      <span class="filter-badge">{{ selectedCategories.length }}/{{ markerCategories.length }}</span>
                    </div>
                    <div class="filter-tags">
                      <el-tag
                        v-for="category in markerCategories"
                        :key="category"
                        :type="selectedCategories.includes(category) ? getCategoryTagType(category) : 'info'"
                        effect="light"
                        class="filter-tag"
                        :class="{ 'selected': selectedCategories.includes(category) }"
                        @click="toggleCategory(category)"
                      >
                        {{ getCategoryLabel(category) }}
                      </el-tag>
                  </div>
                </div>
                  <el-empty v-if="markerPositions.length === 0" description="暂无标记点" :image-size="60"></el-empty>
                  <el-scrollbar v-else height="180px" class="markers-list">
                    <div
                      v-for="marker in markerPositions.filter(marker => selectedCategories.includes(marker.properties.category || 'other'))"
                      :key="marker.id"
                      class="marker-item"
                    >
                      <div class="marker-icon" :class="marker.properties.category">
                        <el-icon><Location /></el-icon>
                      </div>
                      <div class="marker-info" @click="goToMarker(marker)">
                        <div class="marker-title">{{ marker.properties.title }}</div>
                        <div class="marker-meta">
                          <el-tag size="small" :type="getCategoryTagType(marker.properties.category)" class="marker-tag">
                            {{ getCategoryLabel(marker.properties.category) }}
                          </el-tag>
                          <span class="marker-coords">
                            {{ marker.position.lat.toFixed(4) }}, {{ marker.position.lng.toFixed(4) }}
                          </span>
                        </div>
                      </div>
                      <div class="marker-actions">
                        <el-tooltip content="查看详情" placement="top">
                          <el-button :icon="View" circle text @click="viewMarkerDetail(marker)"></el-button>
                        </el-tooltip>
                        <el-tooltip content="删除标记" placement="top">
                          <el-button :icon="Delete" circle text @click="removeMarkerWithConfirm(marker.id)"></el-button>
                        </el-tooltip>
                      </div>
                    </div>
                  </el-scrollbar>
                </div>
              </div>
            </div>

            <!-- 主地图区域 -->
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
              <div ref="mapRef" class="tencent-map">
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
              <div class="map-info-card" v-if="activeInfoCard">
                <div class="info-card-header">
                  <div class="info-title">
                    <el-tag size="small" :type="getCategoryTagType(activeInfoCard.category)">
                      {{ getCategoryLabel(activeInfoCard.category) }}
                    </el-tag>
                    <h3>{{ activeInfoCard.title }}</h3>
                </div>
                  <el-button circle text :icon="Close" @click="closeInfoCard"></el-button>
                </div>

                <div class="info-card-body">
                  <div class="info-item">
                    <el-icon><Location /></el-icon>
                    <span>{{ activeInfoCard.address }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Position /></el-icon>
                    <span>{{ activeInfoCard.lat.toFixed(6) }}, {{ activeInfoCard.lng.toFixed(6) }}</span>
                  </div>
                </div>

                <div class="info-card-footer">
                  <el-button-group class="info-actions">
                    <el-button :icon="Share" round>分享位置</el-button>
                    <el-button type="primary" :icon="Guide" round>开始导航</el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="路线规划">
          <div class="route-container">
            <!-- 路线规划组件 -->
            <RoutePanel
              @update-route="handleRouteUpdate"
              @clear-route="handleClearRoute"
              @set-start="handleSetStart"
              @set-end="handleSetEnd"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="功能介绍">
          <div class="features-container">
            <div class="features-grid">
              <el-card v-for="(feature, index) in features" :key="index" class="feature-card" :body-style="{padding: '20px'}">
                <div class="feature-icon">
                  <el-icon :size="36">
                    <component :is="feature.icon" />
                  </el-icon>
                </div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-desc">{{ feature.description }}</p>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="使用指南">
          <div class="guide-container">
            <el-collapse accordion>
              <el-collapse-item v-for="(guide, index) in guides" :key="index" :title="guide.title" :name="index">
                <div class="guide-content">
                  <p>{{ guide.content }}</p>
                  <div v-if="guide.tips" class="guide-tips">
                    <el-alert
                      :title="guide.tips"
                      type="info"
                      :closable="false"
                      show-icon
                    />
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 标记点详情侧面板 -->
    <el-drawer
      v-model="showDetailPanel"
      title="标记点详情"
      size="30%"
      :with-header="true"
      direction="rtl"
      :before-close="closeDetailPanel"
    >
      <div v-if="currentMarker" class="marker-detail-panel">
        <div class="marker-detail-header">
          <el-tag size="large" :type="getCategoryTagType(currentMarker.properties.category)" class="detail-category">
            {{ getCategoryLabel(currentMarker.properties.category) }}
          </el-tag>
          <h2 class="detail-title">{{ currentMarker.properties.title }}</h2>
          <p class="detail-address">{{ currentMarker.properties.address }}</p>
        </div>

        <div class="marker-detail-coordinates">
          <div class="coordinate-item">
            <span class="coordinate-label">纬度</span>
            <span class="coordinate-value">{{ currentMarker.position.lat.toFixed(6) }}</span>
          </div>
          <div class="coordinate-item">
            <span class="coordinate-label">经度</span>
            <span class="coordinate-value">{{ currentMarker.position.lng.toFixed(6) }}</span>
          </div>
        </div>

        <div class="marker-detail-actions">
          <el-button type="primary" @click="goToMarker(currentMarker)">前往此处</el-button>
          <el-button type="danger" @click="removeMarkerWithConfirm(currentMarker.id)">删除标记</el-button>
        </div>

        <div class="marker-detail-section">
          <h3>周边信息</h3>
          <div class="marker-surroundings">
            <el-skeleton :rows="3" animated :loading="true" />
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
// 添加类型声明，确保放在script标签顶部
declare global {
  interface Window {
    TMap: any;
  }
}

import { onMounted, ref, shallowRef, watch, computed, onUnmounted, nextTick } from 'vue'
import { useData } from 'vitepress'
import {
  ElButton,
  ElCard,
  ElTabs,
  ElTabPane,
  ElInput,
  ElIcon,
  ElEmpty,
  ElScrollbar,
  ElAlert,
  ElCheckboxGroup,
  ElCheckbox,
  ElButtonGroup,
  ElTooltip,
  ElCollapse,
  ElCollapseItem,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import 'element-plus/dist/index.css'
import {
  Location,
  Search,
  Refresh,
  Setting,
  Star,
  View,
  Delete,
  Plus,
  Minus,
  Compass,
  FullScreen,
  Loading,
  Place,
  Guide,
  Position,
  Connection,
  Share,
  Download,
  Edit,
  PictureFilled,
  Close,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
// 导入腾讯地图组件
// 注意：如果tlbs-map-vue组件无法正确加载，您可以尝试以下替代方案：
// 1. 确保在.vitepress/theme/index.ts中正确导入和注册组件
// 2. 使用第三方地图组件如高德地图、Leaflet或MapBox
// 3. 使用iframe嵌入普通腾讯地图网页
// 由于组件库兼容性问题，我们直接使用原生腾讯地图API

// 添加tlbsMapRef引用
const mapElement = ref<HTMLDivElement | null>(null);
let mapInstance: any = null; // 腾讯地图实例

// Interface for search results type
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

// 声明一个变量，确保在setup中引用生命周期钩子
const isSetup = true

// 获取当前主题状态 - 确保这是同步调用
const { isDark } = useData()

// 腾讯地图相关状态
const mapRef = ref() as any
const markerRef = ref() as any
const mapLoading = ref(true)
const searchQuery = ref('')
const mapLayers = ref({
  traffic: false,
  poi: true,
  transit: false
})
const isSatellite = ref(false)

// 地图中心点和缩放级别
const mapCenter = ref({ lat: 31.230416, lng: 121.473701 }) // 上海市中心
const mapZoom = ref(12)

// 地图配置选项
const mapControl = {
  scale: {
    position: 'bottomLeft',
  },
  zoom: {
    position: 'bottomRight',
  },
}

// 收藏地点数据
const favoriteLocations = ref([
  { name: '上海中心', address: '上海市浦东新区陆家嘴世纪大道100号', lat: 31.233649, lng: 121.505635 },
  { name: '外滩', address: '上海市黄浦区中山东一路', lat: 31.233649, lng: 121.490318 },
  { name: '田子坊', address: '上海市黄浦区泰康路210弄', lat: 31.219853, lng: 121.475573 }
])

// 标记点数据
const markerPositions = ref([
  {
    id: 'marker-1',
    styleId: 'myStyle',
    position: { lat: 31.233649, lng: 121.505635 },
    properties: {
      title: '上海中心',
      address: '上海市浦东新区陆家嘴世纪大道100号',
      category: 'landmark'
    }
  },
  {
    id: 'marker-2',
    styleId: 'myStyle',
    position: { lat: 31.233649, lng: 121.490318 },
    properties: {
      title: '外滩',
      address: '上海市黄浦区中山东一路',
      category: 'landmark'
    }
  },
  {
    id: 'marker-3',
    styleId: 'myStyle',
    position: { lat: 31.219853, lng: 121.475573 },
    properties: {
      title: '田子坊',
      address: '上海市黄浦区泰康路210弄',
      category: 'shopping'
    }
  }
])

// 标记点样式
const markerStyles = {
  myStyle: {
    width: 30,
    height: 40,
    anchor: { x: 15, y: 40 }
  }
}

// 功能介绍数据
const features = [
  {
    icon: 'Position',
    title: '精准定位',
    description: '基于GPS和网络定位，提供米级定位精度，快速找到您的当前位置和周边信息。'
  },
  {
    icon: 'Guide',
    title: '智能导航',
    description: '支持多种出行方式规划，实时路况分析，智能推荐最优路线，躲避拥堵。'
  },
  {
    icon: 'Connection',
    title: '全景街景',
    description: '沉浸式360°全景街景体验，提前了解目的地环境，减少出行不确定性。'
  },
  {
    icon: 'Share',
    title: '位置共享',
    description: '一键分享位置给好友，支持实时位置追踪，方便聚会、旅行等场景使用。'
  },
  {
    icon: 'Download',
    title: '离线地图',
    description: '支持城市和区域地图离线下载，无网络环境下也能正常导航和查询。'
  },
  {
    icon: 'Place',
    title: '商户信息',
    description: '覆盖全国超过5000万商户信息，包含评分、营业时间、联系方式等详情。'
  }
]

// 使用指南数据
const guides = [
  {
    title: '如何使用地图搜索？',
    content: '在顶部搜索框中输入关键词如地址、地标、商户名称等，点击搜索按钮或按回车键即可发起搜索，结果将在地图上标注并列表展示。',
    tips: '提示：您可以尝试模糊搜索或使用拼音首字母来快速定位目标。'
  },
  {
    title: '如何规划路线？',
    content: '点击地图上的起点标记，然后点击"路线规划"按钮，再选择或搜索终点位置，系统会自动为您规划最优路线。您可以切换驾车、公交、步行、骑行等不同出行方式。',
    tips: '提示：峰值时段会自动考虑实时路况，避开拥堵路段。'
  },
  {
    title: '如何下载离线地图？',
    content: '点击左下角菜单按钮，选择"离线地图"功能，在城市列表中选择需要下载的城市或区域，点击下载按钮即可。下载完成后，即使在无网络环境下也能使用基础地图功能。',
    tips: '提示：建议使用WiFi环境下载离线地图，以节省流量。'
  },
  {
    title: '如何使用全景街景？',
    content: '在地图上长按任意位置，或者搜索特定地点后，点击出现的信息窗口中的"街景"按钮，即可进入360°全景视图模式。在街景模式中，您可以通过拖拽、缩放来查看周围环境。',
    tips: '提示：并非所有地区都有街景覆盖，主要覆盖城市道路和热门景点。'
  }
]

// 添加分类筛选状态
const markerCategories = ref(['landmark', 'shopping', 'restaurant', 'hotel', 'other'])
const selectedCategories = ref(['landmark', 'shopping', 'restaurant', 'hotel', 'other'])

// 添加标记工具模式
const isMarkingMode = ref(false)

// 计算属性：过滤后的标记点
const filteredMarkers = computed(() => {
  return markerPositions.value.filter(marker =>
    selectedCategories.value.includes(marker.properties.category || 'other')
  )
})

// 添加标记点详情面板相关状态
const showDetailPanel = ref(false)
const currentMarker = ref<any>(null)

// 查看标记点详情
const viewMarkerDetail = (marker: any) => {
  currentMarker.value = marker
  showDetailPanel.value = true
}

// 关闭详情面板
const closeDetailPanel = () => {
  showDetailPanel.value = false
}

// 切换标记工具模式
const toggleMarkingMode = () => {
  isMarkingMode.value = !isMarkingMode.value

  if (isMarkingMode.value) {
    ElMessage({
      message: '已开启标记工具，点击地图添加新标记',
      type: 'success',
      duration: 2000
    })
  } else {
    ElMessage({
      message: '已关闭标记工具',
      type: 'info',
      duration: 2000
    })
  }
}

// 缩放功能
const zoomIn = () => {
  if (!mapRef.value?.map) return
  mapZoom.value = Math.min(mapZoom.value + 1, 19)
  mapRef.value.map.setZoom(mapZoom.value)
}

const zoomOut = () => {
  if (!mapRef.value?.map) return
  mapZoom.value = Math.max(mapZoom.value - 1, 3)
  mapRef.value.map.setZoom(mapZoom.value)
}

// 加载状态相关变量
const loadingTip = ref('正在加载地图资源...')
const loadRetryCount = ref(0)
const maxRetryCount = 3

// 加载腾讯地图API并确保只加载一次
let mapApiLoaded = false;
const loadMapScript = () => {
  return new Promise<void>((resolve, reject) => {
    // 如果已经加载过，直接返回
    if (window.TMap || mapApiLoaded) {
      console.log('腾讯地图API已加载，跳过重复加载');
      resolve();
      return;
    }

    console.log('开始加载腾讯地图API...');
    loadingTip.value = '正在加载地图资源...';
    mapApiLoaded = true; // 标记正在加载

    const script = document.createElement('script');
    script.src = 'https://map.qq.com/api/gljs?v=1.exp&key=ZXSBZ-S2GWT-UQJXD-V75OA-7DYIH-NJBYH';
    script.async = true;

    // 添加加载超时处理
    const timeoutId = setTimeout(() => {
      if (!window.TMap) {
        console.error('腾讯地图API加载超时');
        mapApiLoaded = false; // 重置加载标志，允许重试
        reject(new Error('加载超时'));
      }
    }, 10000); // 10秒超时

    script.onload = () => {
      console.log('腾讯地图API加载完成');
      clearTimeout(timeoutId);
      resolve();
    };

    script.onerror = (error) => {
      console.error('腾讯地图API加载失败', error);
      clearTimeout(timeoutId);
      mapApiLoaded = false; // 重置加载标志，允许重试
      reject(new Error('加载失败'));
    };

    document.head.appendChild(script);
  });
};

// 初始化地图 - 确保只初始化一次
let mapInitialized = false;
const initMap = async () => {
  // 如果已经初始化，避免重复初始化
  if (mapInitialized && mapInstance) {
    console.log('地图已初始化，跳过重复初始化');
    return;
  }

  console.log('准备初始化腾讯地图...');
  mapLoading.value = true;

  try {
    // 加载地图API
    await loadMapScript();
    loadingTip.value = '正在初始化地图...';

    // 确保DOM元素存在
    if (!mapElement.value) {
      console.error('地图容器元素不存在');
      throw new Error('地图容器不存在');
    }

    // 创建腾讯地图实例
    mapInstance = new window.TMap.Map(mapElement.value, {
      center: new window.TMap.LatLng(mapCenter.value.lat, mapCenter.value.lng),
      zoom: mapZoom.value,
      pitch: 0,
      rotation: 0,
      viewMode: '2D'
    });

    // 监听地图加载完成事件 - 只绑定一次
    mapInstance.on('tilesloaded', () => {
      console.log('地图瓦片加载完成');
      mapLoading.value = false;
      loadRetryCount.value = 0; // 重置重试计数

      // 只在第一次完成加载时显示成功消息
      if (!mapInitialized) {
        ElMessage.success('地图加载成功');
        mapInitialized = true;
      }
    });

    // 添加控件
    if (mapControl.scale) {
      new window.TMap.ScaleControl({
        position: mapControl.scale.position || window.TMap.constants.CONTROL_POSITION.BOTTOM_LEFT,
        map: mapInstance
      });
    }

    if (mapControl.zoom) {
      new window.TMap.ZoomControl({
        position: mapControl.zoom.position || window.TMap.constants.CONTROL_POSITION.RIGHT_BOTTOM,
        map: mapInstance
      });
    }

    // 初始化标记点图层
    initMapLayers();

    // 添加点击事件 - 确保只绑定一次
    mapInstance.on('click', onMapClick);

    // 添加现有标记点
    updateMarkers();

    // 设置图层状态
    updateMapLayers();

    // 如果是暗色模式，设置地图样式
    if (isDark.value) {
      setDarkMode(true);
    }

    console.log('地图初始化完成');
    mapInitialized = true;
  } catch (error) {
    console.error('初始化地图失败', error);
    loadRetryCount.value++;

    if (loadRetryCount.value <= maxRetryCount) {
      // 自动重试，而不是显示错误
      loadingTip.value = `地图加载中，正在重试 (${loadRetryCount.value}/${maxRetryCount})...`;
      console.log(`自动重试加载地图 (${loadRetryCount.value}/${maxRetryCount})...`);

      // 重置标记，允许重试
      mapApiLoaded = false;

      // 延迟重试
      setTimeout(() => {
        initMap();
      }, 2000);
    } else {
      mapLoading.value = true; // 保持加载状态
      loadingTip.value = '地图加载遇到问题，请刷新页面重试';
      console.error('多次重试后地图仍加载失败');
    }
  }
};

// 添加重载地图按钮点击事件
const handleReloadMap = () => {
  // 重置状态
  mapLoading.value = true;
  loadingTip.value = '正在重新加载地图...';
  loadRetryCount.value = 0;
  mapApiLoaded = false;
  mapInitialized = false;

  // 如果存在实例，清理它
  if (mapInstance) {
    try {
      mapInstance.destroy();
    } catch (e) {
      console.error('销毁地图实例时出错', e);
    }
    mapInstance = null;
  }

  // 重新初始化
  setTimeout(() => {
    initMap();
  }, 500);
};

// 初始化地图图层
const initMapLayers = () => {
  if (!mapInstance) return;

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
    });

    // 创建信息窗口
    infoWindow = new window.TMap.InfoWindow({
      map: mapInstance,
      position: new window.TMap.LatLng(mapCenter.value.lat, mapCenter.value.lng),
      offset: { x: 0, y: -32 },
      content: '',
      visible: false
    });

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
    });

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
    });

    console.log('地图图层初始化完成');
  } catch (error) {
    console.error('初始化地图图层失败', error);
  }
};

// 更新标记点到地图
const updateMarkers = () => {
  if (!markerLayer) return;

  try {
    const geometries = markerPositions.value.map(marker => {
      return {
        id: marker.id,
        styleId: marker.properties.category || 'default',
        position: new window.TMap.LatLng(marker.position.lat, marker.position.lng),
        properties: {
          ...marker.properties
        }
      };
    });

    markerLayer.setGeometries(geometries);

    // 添加标记点点击事件
    markerLayer.on('click', onMarkerClick);

    console.log('已更新标记点，数量:', geometries.length);
  } catch (error) {
    console.error('更新标记点失败', error);
  }
};

// 更新地图图层
const updateMapLayers = () => {
  if (!mapInstance) return;

  try {
    // 交通图层
    if (mapLayers.value.traffic) {
      mapInstance.addLayer(new window.TMap.TrafficLayer());
    } else {
      const trafficLayers = mapInstance.getLayers().filter((layer: any) =>
        layer instanceof window.TMap.TrafficLayer
      );
      trafficLayers.forEach((layer: any) => mapInstance.removeLayer(layer));
    }

    // 设置POI图层显示
    if (mapInstance.setFeatures) {
      const features: string[] = [];
      if (mapLayers.value.poi) features.push('point');
      if (mapLayers.value.transit) features.push('road');

      mapInstance.setFeatures(features);
    }

    console.log('已更新地图图层');
  } catch (error) {
    console.error('更新地图图层失败', error);
  }
};

// 设置地图暗黑模式
const setDarkMode = (isDark: boolean) => {
  if (!mapInstance) return;

  try {
    if (isDark && mapInstance.setMapStyleId) {
      // 设置暗色主题ID (腾讯地图暗黑模式样式ID)
      mapInstance.setMapStyleId('style2');
    } else if (mapInstance.setMapStyleId) {
      // 恢复默认样式
      mapInstance.setMapStyleId('style1');
    }
  } catch (error) {
    console.error('设置地图主题失败', error);
  }
};

// 标记点点击事件处理
const onMarkerClick = (evt: any) => {
  if (!evt || !evt.geometry) return;

  try {
    const marker = evt.geometry;
    const properties = marker.properties;

    // 打开信息窗口
    if (infoWindow) {
      // 构建信息窗口内容
      const content = `
        <div style="padding: 8px 10px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px;">${properties.title}</div>
          <div style="font-size: 12px; color: #666;">${properties.address}</div>
        </div>
      `;

      infoWindow.setContent(content);
      infoWindow.setPosition(marker.position);
      infoWindow.setVisible(true);
    }

    // 设置信息卡片
    activeInfoCard.value = {
      title: properties.title,
      address: properties.address,
      category: properties.category || 'other',
      lat: marker.position.lat,
      lng: marker.position.lng
    };

    console.log('标记点点击:', properties.title);
  } catch (error) {
    console.error('处理标记点点击事件失败', error);
  }
};

// 添加标记点方法
const addMarker = (position: any, title: string, address: string, category: string = 'other') => {
  const markerId = `marker-${Date.now()}`;

  markerPositions.value.push({
    id: markerId,
    styleId: category,
    position,
    properties: {
      title,
      address,
      category
    }
  });

  // 更新地图标记
  updateMarkers();
};

// 删除标记点
const removeMarker = (id: string) => {
  markerPositions.value = markerPositions.value.filter(marker => marker.id !== id);

  // 更新地图标记
  updateMarkers();
};

// 清空所有标记点
const clearAllMarkers = () => {
  markerPositions.value = [];

  // 更新地图标记
  updateMarkers();
};

// 监听主题变化
watch(isDark, (newIsDark) => {
  console.log('主题已切换为:', newIsDark ? '暗黑模式' : '亮色模式');
  setDarkMode(newIsDark);
});

// 监听图层变化
watch(() => mapLayers.value, (newLayers) => {
  console.log('图层变化', newLayers);
  updateMapLayers();
}, { deep: true });

// 监听标记点变化
watch(() => markerPositions.value, () => {
  updateMarkers();
}, { deep: true });

// 重新加载地图
const reloadMap = () => {
  // 使用新的handleReloadMap实现
  handleReloadMap();
};

// 切换卫星图
const toggleSatellite = () => {
  isSatellite.value = !isSatellite.value

  if (mapInstance && mapInstance.setMapType) {
    // 腾讯地图设置卫星图
    const mapType = isSatellite.value ? 'satellite' : 'roadmap';
    console.log(`切换到${isSatellite.value ? '卫星图' : '标准图'}: ${mapType}`);
    mapInstance.setMapType(mapType);
  }
};

// ... existing code ...

// 添加类型声明，确保放在script标签顶部
declare global {
  interface Window {
    TMap: any;
  }
}

// ... existing code ...

// 恢复标记点功能
let markerLayer: any = null;
let rectangleLayer: any = null;
let infoWindow: any = null;

// ... existing code ...

// 处理搜索
const onSearch = () => {
  if (!searchQuery.value) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  // 如果选择了附近搜索且有中心点
  if (searchNearby.value && mapCenter.value) {
    onSearchNearby()
  } else {
    // 否则默认使用城市搜索
    onSearchByRegion()
  }
}

// 前往特定位置
const goToLocation = (location: any) => {
  if (!mapInstance) return;

  const position = { lat: location.lat, lng: location.lng };
  mapCenter.value = position;
  mapZoom.value = 15;

  mapInstance.setCenter(new window.TMap.LatLng(position.lat, position.lng));
  mapInstance.setZoom(15);

  // 检查是否已存在此位置的标记
  const existingMarker = markerPositions.value.find(marker =>
    marker.position.lat === location.lat && marker.position.lng === location.lng
  );

  if (!existingMarker) {
    // 如果没有对应标记，添加一个新标记
    addMarker(position, location.name, location.address, 'landmark');
  }

  ElMessage.success(`已定位到: ${location.name}`);
};

// 前往标记点位置
const goToMarker = (marker: any) => {
  if (!mapInstance || !marker) return;

  const position = marker.position;
  mapCenter.value = position;
  mapZoom.value = 15;

  mapInstance.setCenter(new window.TMap.LatLng(position.lat, position.lng));
  mapInstance.setZoom(15);

  ElMessage.success(`已定位到: ${marker.properties.title}`);
};

// 随机添加一个标记点(测试用)
const onAddRandomMarker = () => {
  // 生成当前位置附近的随机坐标
  const randomLat = mapCenter.value.lat + (Math.random() - 0.5) * 0.02
  const randomLng = mapCenter.value.lng + (Math.random() - 0.5) * 0.02

  const position = { lat: randomLat, lng: randomLng }
  const title = `随机标记 ${markerPositions.value.length + 1}`
  const address = `位置: ${randomLat.toFixed(6)}, ${randomLng.toFixed(6)}`

  // 随机选择一个分类
  const categories = ['landmark', 'shopping', 'restaurant', 'hotel', 'other']
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]

  addMarker(position, title, address, randomCategory)
  ElMessage.success('已添加随机标记')
}

// 监听主题变化
watch(isDark, (newIsDark) => {
  console.log('主题已切换为:', newIsDark ? '暗黑模式' : '亮色模式')

  // 根据主题切换地图样式
  if (mapRef.value?.map) {
    // 腾讯地图的主题设置
    console.log('设置地图主题:', newIsDark ? '暗色' : '亮色')
    // 腾讯地图可能有自己的主题设置方法
  }
})

// 监听图层变化
watch(() => mapLayers.value, (newLayers) => {
  console.log('图层变化', newLayers)

  if (!mapRef.value?.map) return

  // 根据腾讯地图API实现图层控制
}, { deep: true })

// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  switch(category) {
    case 'landmark': return 'primary'
    case 'shopping': return 'success'
    case 'restaurant': return 'warning'
    case 'hotel': return 'info'
    default: return 'info'
  }
}

// 获取分类标签文本
const getCategoryLabel = (category: string) => {
  switch(category) {
    case 'landmark': return '地标'
    case 'shopping': return '购物'
    case 'restaurant': return '餐饮'
    case 'hotel': return '住宿'
    default: return '其他'
  }
}

// 确认删除标记点
const removeMarkerWithConfirm = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这个标记点吗？此操作不可撤销。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      removeMarker(id)
      if (showDetailPanel.value && currentMarker.value && currentMarker.value.id === id) {
        showDetailPanel.value = false
      }
      ElMessage({
        type: 'success',
        message: '标记点已删除',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 信息卡片
const activeInfoCard = ref<any>(null)

// 关闭信息卡片
const closeInfoCard = () => {
  activeInfoCard.value = null
}

// 添加层控制方法
// 图层切换方法
const toggleLayer = (layer: string) => {
  mapLayers.value[layer] = !mapLayers.value[layer]
}

// 分类筛选方法
const toggleCategory = (category: string) => {
  if (selectedCategories.value.includes(category)) {
    // 如果已选中，则移除
    selectedCategories.value = selectedCategories.value.filter(c => c !== category)
  } else {
    // 否则添加
    selectedCategories.value.push(category)
  }
}

// 控制面板状态
const showControls = ref(true)
const isMobile = ref(false)

// 切换控制面板显示/隐藏
const toggleControls = () => {
  showControls.value = !showControls.value
}

// 检测设备类型
const checkDeviceType = () => {
  isMobile.value = window.innerWidth <= 768

  // 在移动端默认隐藏控制面板
  if (isMobile.value) {
    showControls.value = false
  } else {
    showControls.value = true
  }
}

// 监听窗口大小变化
onMounted(() => {
  checkDeviceType()
  window.addEventListener('resize', checkDeviceType)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDeviceType)
})

// 添加搜索配置变量和方法
// 搜索模式和相关配置
const searchMode = ref('keyword')
const searchNearby = ref(true)
const searchRadius = ref(1000)
const searchCity = ref('上海')
const autoExtend = ref(true)
const recommendPolicy = ref(1)
const searchResults = ref<SearchResult[]>([])

// 矩形区域搜索坐标
const rectangleSW = ref({ lat: 31.21, lng: 121.46 }) // 左下角
const rectangleNE = ref({ lat: 31.24, lng: 121.52 }) // 右上角

// 改变搜索模式
const changeSearchMode = (mode: string): void => {
  searchMode.value = mode
  // 重置搜索结果
  searchResults.value = []
}

// 根据当前地图视图设置矩形区域
const setRectangleFromCurrentView = () => {
  if (!mapRef.value?.map) return

  // 获取当前地图视图范围
  try {
    const bounds = mapRef.value.map.getBounds()
    // 腾讯地图API通常返回西南和东北角坐标
    if (bounds && bounds.getSouthWest && bounds.getNorthEast) {
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      rectangleSW.value = { lat: sw.lat, lng: sw.lng }
      rectangleNE.value = { lat: ne.lat, lng: ne.lng }

      ElMessage.success('已设置为当前视图范围')
    } else {
      ElMessage.warning('无法获取当前视图范围')
    }
  } catch (error) {
    console.error('获取地图视图范围失败', error)
    ElMessage.error('获取地图视图范围失败')
  }
}

// 计算两点之间的距离（单位：米）
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  // 地球半径（米）
  const R = 6371000

  // 转换为弧度
  const rad1 = (lat1 * Math.PI) / 180
  const rad2 = (lat2 * Math.PI) / 180
  const a = Math.sin((rad2 - rad1) / 2) * Math.sin((rad2 - rad1) / 2) +
    Math.cos(rad1) * Math.cos(rad2) *
    Math.sin(((lng2 - lng1) * Math.PI / 180) / 2) * Math.sin(((lng2 - lng1) * Math.PI / 180) / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c

  return Math.round(d)
}

// 格式化距离
const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${distance.toFixed(0)}米`
  } else {
    return `${(distance / 1000).toFixed(1)}公里`
  }
}

// 周边搜索
const onSearchNearby = async () => {
  if (!searchQuery.value) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    ElMessage.info(`正在搜索: ${searchQuery.value}`)
    mapLoading.value = true

    // 构建周边搜索参数
    const params = {
      key: 'ZXSBZ-S2GWT-UQJXD-V75OA-7DYIH-NJBYH', // 腾讯地图密钥
      keyword: searchQuery.value,
      boundary: `nearby(${mapCenter.value.lat},${mapCenter.value.lng},${searchRadius.value},${autoExtend.value ? 1 : 0})`,
      page_size: 20,
      page_index: 1,
      output: 'json'
    }

    // 构建URL
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    // 由于前端直接调用可能存在跨域和密钥暴露问题，这里使用示例响应
    // 实际项目中应通过后端代理或serverless函数调用
    console.log('周边搜索请求:', `https://apis.map.qq.com/ws/place/v1/search?${queryString}`)

    // 模拟API响应
    // 实际项目中应该是：const response = await fetch(`/api/map/nearby?${queryString}`)
    // 这里为了演示，使用模拟数据
    simulateSearchResponse(searchQuery.value, searchRadius.value)

  } catch (error) {
    console.error('周边搜索失败', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    mapLoading.value = false
  }
}

// 城市/区域搜索
const onSearchByRegion = async () => {
  if (!searchQuery.value || !searchCity.value) {
    ElMessage.warning('请输入搜索关键词和城市')
    return
  }

  try {
    ElMessage.info(`正在搜索: ${searchCity.value}的${searchQuery.value}`)
    mapLoading.value = true

    // 构建城市搜索参数
    const params = {
      key: 'ZXSBZ-S2GWT-UQJXD-V75OA-7DYIH-NJBYH',
      keyword: searchQuery.value,
      boundary: `region(${searchCity.value},${autoExtend.value ? 1 : 0},${mapCenter.value.lat},${mapCenter.value.lng})`,
      page_size: 20,
      page_index: 1,
      output: 'json'
    }

    // 构建URL
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    console.log('城市搜索请求:', `https://apis.map.qq.com/ws/place/v1/search?${queryString}`)

    // 模拟API响应
    simulateSearchResponse(searchQuery.value, 0, searchCity.value)

  } catch (error) {
    console.error('城市搜索失败', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    mapLoading.value = false
  }
}

// 矩形范围搜索
const onSearchByRectangle = async () => {
  if (!searchQuery.value) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    ElMessage.info(`正在范围内搜索: ${searchQuery.value}`)
    mapLoading.value = true

    // 构建矩形搜索参数
    const params = {
      key: 'ZXSBZ-S2GWT-UQJXD-V75OA-7DYIH-NJBYH',
      keyword: searchQuery.value,
      boundary: `rectangle(${rectangleSW.value.lat},${rectangleSW.value.lng},${rectangleNE.value.lat},${rectangleNE.value.lng})`,
      page_size: 20,
      page_index: 1,
      output: 'json'
    }

    // 构建URL
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    console.log('矩形搜索请求:', `https://apis.map.qq.com/ws/place/v1/search?${queryString}`)

    // 模拟API响应
    simulateSearchResponse(searchQuery.value, 0, '矩形区域')

  } catch (error) {
    console.error('矩形搜索失败', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    mapLoading.value = false
  }
}

// 周边推荐
const onRecommend = async () => {
  try {
    ElMessage.info('正在获取周边推荐地点')
    mapLoading.value = true

    // 构建周边推荐参数
    const params = {
      key: 'ZXSBZ-S2GWT-UQJXD-V75OA-7DYIH-NJBYH',
      boundary: `nearby(${mapCenter.value.lat},${mapCenter.value.lng},${searchRadius.value},${autoExtend.value ? 1 : 0})`,
      policy: recommendPolicy.value,
      page_size: 20,
      page_index: 1,
      output: 'json'
    }

    // 构建URL
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    console.log('周边推荐请求:', `https://apis.map.qq.com/ws/place/v1/explore?${queryString}`)

    // 模拟API响应
    simulateSearchResponse('周边推荐', searchRadius.value)

  } catch (error) {
    console.error('周边推荐失败', error)
    ElMessage.error('获取推荐失败，请重试')
  } finally {
    mapLoading.value = false
  }
}

// 清除搜索结果
const clearSearchResults = () => {
  searchResults.value = []
}

// 前往搜索结果位置
const goToSearchResult = (item: SearchResult): void => {
  if (!item.location) return

  const position = { lat: item.location.lat, lng: item.location.lng }
  mapCenter.value = position
  mapZoom.value = 16

  if (mapRef.value?.map) {
    mapRef.value.map.setCenter(position)
    mapRef.value.map.setZoom(16)
  }

  // 显示信息卡片
  activeInfoCard.value = {
    title: item.title,
    address: item.address,
    category: item.category?.split(',')[0] || 'other',
    lat: item.location.lat,
    lng: item.location.lng
  }

  ElMessage.success(`已定位到: ${item.title}`)
}

// 将搜索结果添加为标记点
const addSearchResultAsMarker = (item: SearchResult): void => {
  if (!item.location) return

  // 检查是否已存在此位置的标记
  const existingMarker = markerPositions.value.find(marker =>
    marker.position.lat === item.location.lat && marker.position.lng === item.location.lng
  )

  if (!existingMarker) {
    // 分析分类，映射到我们的标记分类
    const category = mapSearchCategoryToMarkerCategory(item.category)

    // 添加标记
    addMarker(
      { lat: item.location.lat, lng: item.location.lng },
      item.title,
      item.address,
      category
    )

    ElMessage.success(`已添加标记: ${item.title}`)
  } else {
    ElMessage.info('此位置已有标记')
  }
}

// 将搜索分类映射到标记分类
const mapSearchCategoryToMarkerCategory = (category?: string): string => {
  // 默认分类
  if (!category) return 'other'

  // 分类映射
  const categoryStr = category.toLowerCase()

  if (categoryStr.includes('景点') || categoryStr.includes('旅游')) return 'landmark'
  if (categoryStr.includes('购物') || categoryStr.includes('商场')) return 'shopping'
  if (categoryStr.includes('餐') || categoryStr.includes('美食')) return 'restaurant'
  if (categoryStr.includes('酒店') || categoryStr.includes('旅馆')) return 'hotel'

  return 'other'
}

// 模拟搜索响应
const simulateSearchResponse = (keyword: string, radius: number = 0, region: string = ''): Promise<SearchResult[]> => {
  console.log(`模拟搜索: 关键词=${keyword}, 半径=${radius}, 区域=${region}`);

  // 返回一个Promise包装的SearchResult数组
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟的搜索结果数据
      const sampleResults: SearchResult[] = [
        {
          id: 'poi-1',
          title: '上海中心',
          address: '上海市浦东新区陆家嘴世纪大道100号',
          tel: '021-12345678',
          category: 'landmark',
          location: { lat: 31.233649, lng: 121.505635 },
          ad_info: { adcode: 310115, province: '上海市', city: '上海市', district: '浦东新区' }
        },
        {
          id: 'poi-2',
          title: '外滩',
          address: '上海市黄浦区中山东一路',
          tel: '',
          category: 'landmark',
          location: { lat: 31.233649, lng: 121.490318 },
          ad_info: { adcode: 310101, province: '上海市', city: '上海市', district: '黄浦区' }
        },
        {
          id: 'poi-3',
          title: '田子坊',
          address: '上海市黄浦区泰康路210弄',
          tel: '',
          category: 'shopping',
          location: { lat: 31.219853, lng: 121.475573 },
          ad_info: { adcode: 310101, province: '上海市', city: '上海市', district: '黄浦区' }
        },
        {
          id: 'poi-4',
          title: '南京路步行街',
          address: '上海市黄浦区南京东路',
          tel: '',
          category: 'shopping',
          location: { lat: 31.234332, lng: 121.480909 },
          ad_info: { adcode: 310101, province: '上海市', city: '上海市', district: '黄浦区' }
        },
        {
          id: 'poi-5',
          title: '豫园',
          address: '上海市黄浦区豫园路218号',
          tel: '021-63260830',
          category: 'landmark',
          location: { lat: 31.227203, lng: 121.492386 },
          ad_info: { adcode: 310101, province: '上海市', city: '上海市', district: '黄浦区' }
        },
        {
          id: 'poi-6',
          title: '新天地',
          address: '上海市黄浦区马当路245号',
          tel: '',
          category: 'shopping',
          location: { lat: 31.220159, lng: 121.475901 },
          ad_info: { adcode: 310101, province: '上海市', city: '上海市', district: '黄浦区' }
        },
        {
          id: 'poi-7',
          title: '静安寺',
          address: '上海市静安区南京西路1686号',
          tel: '021-62575346',
          category: 'landmark',
          location: { lat: 31.224574, lng: 121.445492 },
          ad_info: { adcode: 310106, province: '上海市', city: '上海市', district: '静安区' }
        },
        {
          id: 'poi-8',
          title: '人民广场',
          address: '上海市黄浦区人民大道',
          tel: '',
          category: 'landmark',
          location: { lat: 31.230393, lng: 121.475583 },
          ad_info: { adcode: 310101, province: '上海市', city: '上海市', district: '黄浦区' }
        },
        {
          id: 'poi-9',
          title: '上海迪士尼度假区',
          address: '上海市浦东新区川沙新镇黄赵路310号',
          tel: '400-180-0000',
          category: 'entertainment',
          location: { lat: 31.146082, lng: 121.669498 },
          ad_info: { adcode: 310115, province: '上海市', city: '上海市', district: '浦东新区' }
        },
        {
          id: 'poi-10',
          title: '上海海洋水族馆',
          address: '上海市浦东新区陆家嘴环路1388号',
          tel: '021-58779988',
          category: 'entertainment',
          location: { lat: 31.240516, lng: 121.501371 },
          ad_info: { adcode: 310115, province: '上海市', city: '上海市', district: '浦东新区' }
        }
      ];

      // 根据搜索关键词过滤结果
      const results = sampleResults.filter(item =>
        item.title.includes(keyword) ||
        item.address.includes(keyword) ||
        (item.category && item.category.includes(keyword))
      );

      // 为结果添加距离信息
      const resultsWithDistance = results.map(item => {
        const distance = calculateDistance(
          mapCenter.value.lat,
          mapCenter.value.lng,
          item.location.lat,
          item.location.lng
        );

        return {
          ...item,
          _distance: distance
        };
      });

      // 如果指定了半径，根据距离过滤
      let filteredResults = resultsWithDistance;
      if (radius > 0) {
        filteredResults = resultsWithDistance.filter(item =>
          item._distance <= radius
        );
      }

      // 模拟延迟后返回结果
      resolve(filteredResults);
    }, 500); // 模拟网络延迟
  });
};

// 修复缺失的地图点击事件处理函数
const onMapClick = (e: any) => {
  console.log('地图点击事件:', e)

  // 只有在标记模式开启时才添加新标记
  if (isMarkingMode.value && e && e.latLng) {
    // 生成唯一ID
    const markerId = `marker-${Date.now()}`
    const position = { lat: e.latLng.lat, lng: e.latLng.lng }
    const title = `新标记 ${markerPositions.value.length + 1}`
    const address = `位置: ${e.latLng.lat.toFixed(6)}, ${e.latLng.lng.toFixed(6)}`

    // 添加新标记
    addMarker(position, title, address, 'other');
    ElMessage.success('已添加新标记')
  }
}

// 恢复centerMap函数
const centerMap = () => {
  console.log('定位到当前位置')
  // 使用浏览器定位API
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        mapCenter.value = currentPosition
        mapZoom.value = 15

        if (mapInstance) {
          mapInstance.setCenter(new window.TMap.LatLng(currentPosition.lat, currentPosition.lng))
          mapInstance.setZoom(15)
        }

        ElMessage.success('已定位到当前位置')
      },
      () => {
        ElMessage.error('获取位置失败，请检查浏览器位置权限')
      }
    )
  } else {
    ElMessage.error('您的浏览器不支持地理定位')
  }
}

// ... existing code ...

// 确保生命周期钩子在组件setup的顶层同步调用
if (isSetup) {
  // 使用组件挂载的生命周期钩子
  onMounted(() => {
    console.log('地图组件挂载开始');
    // 设置初始加载状态
    mapLoading.value = true;
    loadingTip.value = '地图资源初始化中...';

    // 确保DOM已经渲染完成
    nextTick(() => {
      // 设置XMLHttpRequest拦截器
      setupXHRInterceptor();

      // 初始化地图
      setTimeout(() => {
        initMap().catch(err => {
          console.error('地图初始化失败', err);
          // 错误已在initMap内部处理，这里不需额外处理
        });
      }, 500);
    });

    console.log('地图组件挂载完成');
  });

  // 使用组件卸载的生命周期钩子
  onUnmounted(() => {
    console.log('地图组件卸载中，清理资源...');
    cleanupResources();
  });
}

// XMLHttpRequest拦截器函数
const setupXHRInterceptor = () => {
  // 修复XMLHttpRequest响应类型问题
  const originalXhrOpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('loadend', function() {
      // 防止在responseType为blob时读取responseText
      if (this.responseType === 'blob') {
        const originalResponseTextGetter =
          Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText')?.get

        if (originalResponseTextGetter) {
          Object.defineProperty(this, 'responseText', {
            get: function() {
              try {
                return originalResponseTextGetter.call(this)
              } catch (e) {
                console.warn('拦截XMLHttpRequest responseText错误')
                return ''
              }
            }
          })
        }
      }
    })
    originalXhrOpen.apply(this, arguments)
  }
}

// 添加路线相关变量
const routePoints = ref([]);
const routeLayer = shallowRef<any>(null);
const routeStartMarker = shallowRef<any>(null);
const routeEndMarker = shallowRef<any>(null);

// 处理路线更新
const handleRouteUpdate = (route) => {
  try {
    if (!routeLayer.value || !mapInstance) return;

    // 将路线坐标转换为TMap坐标数组
    const path = route.points.map(point => {
      return new window.TMap.LatLng(point.lat, point.lng);
    });

    // 清除之前的路线
    routeLayer.value.setGeometries([]);

    // 添加新路线
    routeLayer.value.add({
      id: 'route',
      styleId: route.mode || 'default',
      paths: [path]
    });

    // 设置起点和终点标记
    const startMarker = {
      id: 'route-start',
      styleId: 'start',
      position: new window.TMap.LatLng(route.start.lat, route.start.lng),
      properties: {
        title: route.start.title || '起点',
        address: '起点'
      }
    };

    const endMarker = {
      id: 'route-end',
      styleId: 'end',
      position: new window.TMap.LatLng(route.end.lat, route.end.lng),
      properties: {
        title: route.end.title || '终点',
        address: '终点'
      }
    };

    // 更新标记
    if (markerLayer) {
      // 移除之前的路线起点和终点标记
      const markers = markerLayer.getGeometries();
      const filteredMarkers = markers.filter(marker =>
        marker.id !== 'route-start' && marker.id !== 'route-end'
      );

      // 添加新的起点和终点标记
      markerLayer.setGeometries([...filteredMarkers, startMarker, endMarker]);
    }

    // 调整地图视野以包含整个路线
    const bounds = new window.TMap.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    mapInstance.fitBounds(bounds, {
      padding: 100
    });

    console.log('路线绘制完成');
  } catch (error) {
    console.error('绘制路线失败:', error);
    ElMessage.error('绘制路线失败');
  }
};

// 清除路线
const handleClearRoute = () => {
  try {
    if (routeLayer.value) {
      routeLayer.value.setGeometries([]);
    }

    // 移除起点和终点标记
    if (markerLayer) {
      const markers = markerLayer.getGeometries();
      const filteredMarkers = markers.filter(marker =>
        marker.id !== 'route-start' && marker.id !== 'route-end'
      );
      markerLayer.setGeometries(filteredMarkers);
    }

    console.log('路线已清除');
  } catch (error) {
    console.error('清除路线失败:', error);
  }
};

// 设置起点
const handleSetStart = (location) => {
  console.log('设置起点:', location);
};

// 设置终点
const handleSetEnd = (location) => {
  console.log('设置终点:', location);
};

// 确保在地图卸载时清理资源
const cleanupResources = () => {
  // 清理地图实例和事件监听器
  if (mapInstance) {
    mapInstance.destroy();
    mapInstance = null;
  }

  // 清理图层
  markerLayer = null;
  rectangleLayer = null;
  infoWindow = null;
  routeLayer.value = null;

  // 清理其他可能的计时器或监听器
  mapLoading.value = false;
};

// 在onUnmounted中调用资源清理
if (isSetup) {
  onMounted(() => {
    setupXHRInterceptor();
    initMap();
    console.log('地图组件挂载完成');
  });

  onUnmounted(() => {
    console.log('地图组件卸载中，清理资源...');
    cleanupResources();
  });
}

// 导入路线规划组件，修复导入问题
import RoutePanel from './components/RoutePanel.vue'

// 避免重复搜索的标记
let searchInProgress = false;

// 关键词搜索
const keywordSearch = async () => {
  // 避免重复搜索
  if (searchInProgress) {
    console.log('搜索正在进行中，跳过重复请求');
    return;
  }

  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  try {
    searchInProgress = true;
    console.log(`开始搜索关键词: "${searchQuery.value}"`);
    ElMessage.info(`正在搜索: ${searchQuery.value}`);

    // 模拟搜索延迟，防止过快发送请求
    await new Promise(resolve => setTimeout(resolve, 300));

    // 调用搜索函数并确保返回的是SearchResult[]类型
    const results = await simulateSearchResponse(searchQuery.value) as SearchResult[];

    // 确保results是数组
    if (Array.isArray(results)) {
      searchResults.value = results;
      ElMessage.success(`找到 ${results.length} 个结果`);
    } else {
      throw new Error('搜索结果格式不正确');
    }
  } catch (error: any) {
    console.error('搜索错误:', error);
    ElMessage.error('搜索失败: ' + (error.message || '请稍后重试'));
  } finally {
    searchInProgress = false;
  }
};
</script>

<style scoped>
/* 地图容器样式 */
.map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 100px);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
  border-radius: 12px;
  overflow: hidden;
}

/* 地图备用内容样式 */
.map-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--vp-c-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.fallback-content {
  text-align: center;
  padding: 20px;
}

.fallback-controls {
  margin-top: 20px;
}

.map-header {
  position: relative;
  color: #fff;
  padding: 24px;
  overflow: hidden;
  z-index: 1;
  height: 140px;
}

.header-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-primary-light-3));
  opacity: 0.9;
  z-index: -1;
}

.header-content {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.header-text h1 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
}

.header-text .subtitle {
  font-size: 16px;
  opacity: 0.85;
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  background-color: var(--vp-c-bg);
  padding: 16px;
}

.custom-tabs {
  height: 100%;
}

.map-view-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 230px);
  min-height: 460px;
  display: flex;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.map-controls {
  width: 320px;
  max-width: 320px;
  height: 100%;
  overflow-y: auto;
  background-color: var(--vp-c-bg);
  border-right: 1px solid var(--el-border-color-light);
  padding: 16px;
  transition: all 0.3s ease;
  z-index: 10;
}

.controls-toggle {
  position: absolute;
  left: 320px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background-color: var(--el-fill-color-light);
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 11;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.controls-expanded {
  transform: translateX(0);
}

.controls-collapsed {
  transform: translateX(-100%);
}

.controls-section {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 20px;
}

.controls-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
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

.section-actions {
  display: flex;
  gap: 4px;
}

.section-content {
  font-size: 14px;
}

.map-view {
  flex: 1;
  position: relative;
  transition: all 0.3s ease;
}

.map-fullwidth {
  width: 100%;
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

/* 标记点相关样式 */
.layer-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-toggle-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  background-color: var(--el-fill-color-lighter);
  cursor: pointer;
}

.layer-toggle-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color);
  border-radius: 6px;
  margin-right: 12px;
  color: var(--el-text-color-secondary);
}

.layer-toggle-icon.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.layer-toggle-info {
  flex: 1;
}

.layer-toggle-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.layer-toggle-status {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.marker-filters {
  margin-bottom: 16px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.filter-badge {
  font-size: 12px;
  padding: 2px 6px;
  background-color: var(--el-color-info-light-9);
  border-radius: 10px;
  color: var(--el-color-info);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-tag {
  cursor: pointer;
}

.filter-tag.selected {
  font-weight: 500;
}

.markers-list, .locations-list {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.marker-item, .location-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.marker-item:last-child, .location-item:last-child {
  border-bottom: none;
}

.marker-icon, .location-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
  cursor: pointer;
}

.marker-icon.landmark {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.marker-icon.shopping {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.marker-icon.restaurant {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.marker-icon.hotel {
  background-color: var(--el-color-info-light-8);
  color: var(--el-color-info);
}

.marker-info, .location-info {
  flex: 1;
  overflow: hidden;
  cursor: pointer;
}

.marker-title, .location-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.marker-coords, .location-address {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-tag {
  flex-shrink: 0;
}

.marker-actions, .location-actions {
  display: flex;
  gap: 2px;
}

.map-info-card {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 300px;
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 20;
}

.info-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-title {
  flex: 1;
}

.info-title h3 {
  margin: 6px 0 0 0;
  font-size: 16px;
}

.info-card-body {
  padding: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.info-card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: center;
}

.info-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

.marker-detail-panel {
  padding: 16px;
}

.marker-detail-header {
  margin-bottom: 20px;
}

.detail-category {
  margin-bottom: 10px;
}

.detail-title {
  margin: 10px 0;
  font-size: 20px;
}

.detail-address {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.marker-detail-coordinates {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  background-color: var(--el-fill-color-lighter);
  padding: 12px;
  border-radius: 6px;
}

.coordinate-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coordinate-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.coordinate-value {
  font-weight: 500;
}

.marker-detail-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.marker-detail-section {
  margin-top: 24px;
}

.marker-detail-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
}

.features-container {
  padding: 20px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  height: 100%;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.feature-title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 18px;
}

.feature-desc {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  text-align: center;
}

.guide-container {
  padding: 20px 0;
}

.guide-content {
  line-height: 1.6;
}

.guide-tips {
  margin-top: 16px;
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

/* 深色模式适配 */
:root.dark .map-loading {
  background-color: rgba(0, 0, 0, 0.5);
}

:root.dark .map-controls {
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
}

:root.dark .controls-toggle {
  background-color: var(--el-fill-color-dark);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
}

:root.dark .marker-detail-coordinates {
  background-color: var(--el-fill-color-dark);
}

/* 搜索相关样式 */
.search-panel {
  display: flex;
  flex-direction: column;
    gap: 12px;
  margin-bottom: 16px;
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

.fallback-error {
  color: var(--el-color-danger);
  margin: 8px 0;
  font-size: 14px;
}

.fallback-content p {
  margin: 6px 0;
  color: var(--el-text-color-secondary);
}

/* 删除iframe相关样式，改为使用tlbs-map组件 */

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

/* 路线规划容器 */
.route-container {
  padding: 16px;
}

/* 响应式样式，确保在小屏幕上正常显示 */
@media (max-width: 768px) {
  .route-container {
    padding: 10px;
  }
}
</style>
