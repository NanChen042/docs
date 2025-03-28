<template>
  <div class="map-explorer">
    <!-- 顶部导航栏 -->
    <header class="explorer-header">
      <div class="header-content">
        <div class="header-brand">
          <div class="brand-logo">🌏</div>
          <h1 class="brand-title">探索地图</h1>
      </div>
        <div class="header-actions">
          <el-tooltip content="刷新地图" placement="bottom">
            <el-button class="action-btn" circle @click="refreshMap">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="全屏模式" placement="bottom">
            <el-button class="action-btn" circle @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="设置" placement="bottom">
            <el-button class="action-btn" circle @click="showSettings = true">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="explorer-content">
      <!-- 侧边栏面板 -->
      <aside :class="['sidebar-panel', { 'sidebar-collapsed': !showSidebar }]">
        <div class="sidebar-container" v-show="showSidebar">
        <div class="sidebar-header">
          <el-input
            v-model="searchQuery"
            placeholder="搜索位置"
            prefix-icon="Search"
            clearable
            @keyup.enter="searchLocation"
            class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
        </div>

          <div class="sidebar-body">
            <el-scrollbar>
              <el-collapse v-model="activeCollapse" class="explorer-collapse">
                <!-- 保存的位置面板 -->
            <el-collapse-item title="保存的位置" name="locations">
                  <div class="locations-panel">
                    <!-- 位置筛选 -->
                    <div class="filter-container">
                  <el-input
                    v-model="locationFilter"
                    placeholder="搜索已保存位置..."
                        class="filter-input"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>

                  <div class="filter-tags">
                        <div
                          v-for="tag in locationTags"
                          :key="tag.value"
                          :class="['tag-chip', { 'active': activeLocationTag === tag.value }]"
                      @click="toggleLocationTag(tag.value)"
                    >
                      {{ tag.label }}
                        </div>
                  </div>
                </div>

                <!-- 位置列表 -->
                    <div class="location-list" v-if="filteredLocations.length">
                    <div
                      v-for="(location, index) in filteredLocations"
                  :key="index"
                        :class="['location-item', { 'active': isActiveLocation(location) }]"
                  @click="goToLocation(location)"
                >
                        <div class="location-icon">
                          <el-icon><Flag /></el-icon>
                        </div>
                        <div class="location-info">
                          <div class="location-name">{{ location.name }}</div>
                          <div class="location-coords">{{ formatCoordinates(location) }}</div>
                        </div>
                        <div class="location-actions">
                          <el-tooltip content="定位" placement="top">
                            <el-button circle size="small" type="primary" @click.stop="goToLocation(location)">
                              <el-icon><Position /></el-icon>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="编辑" placement="top">
                            <el-button circle size="small" type="warning" @click.stop="editMarker(index)">
                              <el-icon><Edit /></el-icon>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="删除" placement="top">
                            <el-button circle size="small" type="danger" @click.stop="confirmDeleteLocation(index)">
                              <el-icon><Delete /></el-icon>
                            </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>

                <!-- 空状态 -->
                    <div v-else class="empty-state">
                      <el-empty description="没有找到位置">
                    <el-button type="primary" @click="addNewLocation">添加位置</el-button>
                  </el-empty>
                </div>

                <!-- 位置统计 -->
                    <div class="stats-bar">
                      <span class="stats-text">共 {{ savedLocations.length }} 个位置</span>
                </div>
              </div>
            </el-collapse-item>

            <!-- 周边搜索面板 -->
            <el-collapse-item title="周边搜索" name="nearby-search">
                  <div class="search-panel">
                <!-- 搜索表单 -->
                <div class="search-form">
                    <el-autocomplete
                        class="search-input"
                      v-model="poiSearchKeyword"
                      :fetch-suggestions="queryKeywordSuggestions"
                      :trigger-on-focus="false"
                        placeholder="搜索周边地点，例如：餐厅、超市..."
                      clearable
                      @select="handleSuggestionSelect"
                    >
                      <template #suffix>
                          <el-button class="search-button" @click="searchNearbyPoi">
                            <el-icon><Search /></el-icon>
                          </el-button>
                      </template>
                      <template #default="{ item }">
                        <div class="suggestion-item">
                          <div class="suggestion-icon">
                              <el-icon v-if="item.type === 0"><Flag /></el-icon>
                            <el-icon v-else-if="item.type === 1"><Van /></el-icon>
                            <el-icon v-else-if="item.type === 2"><MapLocation /></el-icon>
                            <el-icon v-else-if="item.type === 3"><Guide /></el-icon>
                            <el-icon v-else><Place /></el-icon>
                          </div>
                          <div class="suggestion-content">
                            <div class="suggestion-title">{{ item.title }}</div>
                            <div class="suggestion-address" v-if="item.address">{{ item.address }}</div>
                          </div>
                          <div class="suggestion-distance" v-if="item._distance">
                            {{ formatDistance(item._distance) }}
                          </div>
                        </div>
                      </template>
                    </el-autocomplete>

                      <div class="location-toggle">
                      <el-button
                        :type="isUsingUserLocation ? 'primary' : 'default'"
                        :icon="isUsingUserLocation ? Position : MapLocation"
                        @click="toggleUseCurrentLocation"
                          class="toggle-button"
                          size="small"
                      >
                        {{ isUsingUserLocation ? '使用我的位置' : '使用地图中心' }}
                      </el-button>
                  </div>

                  <div class="search-options">
                        <div class="radius-control">
                          <span class="option-label">搜索范围:</span>
                      <el-slider
                        v-model="poiSearchRadius"
                        :min="100"
                        :max="1000"
                        :step="100"
                        :marks="{100: '100m', 500: '500m', 1000: '1km'}"
                        class="radius-slider"
                      />
                    </div>

                        <div class="search-filters">
                      <el-select
                        v-model="poiSearchCategory"
                        placeholder="分类筛选"
                        clearable
                        class="category-select"
                            size="small"
                      >
                        <el-option
                          v-for="item in poiCategories"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>

                      <el-switch
                        v-model="poiAutoExtend"
                        active-text="自动扩大范围"
                        inactive-text="固定范围"
                        class="auto-extend-switch"
                            size="small"
                      />
                    </div>
                  </div>
                </div>

                <!-- 搜索结果 -->
                <div class="search-results" v-if="showSearchResults">
                  <div class="results-header">
                        <div class="results-title">
                          <el-icon><Flag /></el-icon>
                          <span v-if="poiTotalCount">找到 {{ poiTotalCount }} 个结果</span>
                      <span v-else>搜索结果</span>
                        </div>
                        <el-button size="small" text @click="clearSearchResults">
                      <el-icon><Close /></el-icon>
                          清除
                    </el-button>
                  </div>

                      <!-- 加载中状态 -->
                  <div class="results-loading" v-if="isSearching">
                    <el-skeleton :rows="3" animated />
                    <el-skeleton :rows="3" animated />
                  </div>

                  <!-- 结果列表 -->
                      <div v-else-if="poiSearchResults.length" class="results-list">

                      <div
                        v-for="poi in poiSearchResults"
                        :key="poi.id"
                          :class="['poi-item', { 'active': activePoi === poi.id }]"
                        @click="selectPoi(poi)"
                      >
                        <div class="poi-icon">
                            <el-icon><Flag /></el-icon>
                          <span class="poi-distance">{{ Math.round(poi._distance) }}m</span>
                        </div>
                          <div class="poi-info">
                            <div class="poi-title">{{ poi.title }}</div>
                            <div class="poi-address" v-if="poi.address">{{ poi.address }}</div>
                            <div class="poi-category">{{ poi.category }}</div>
                        </div>
                        <div class="poi-actions">
                          <el-tooltip content="在地图上查看" placement="top">
                            <el-button
                              type="primary"
                              circle
                              size="small"
                              @click.stop="goToPoi(poi)"
                              >
                                <el-icon><Position /></el-icon>
                              </el-button>
                          </el-tooltip>
                          <el-tooltip content="保存位置" placement="top">
                            <el-button
                              type="success"
                              circle
                              size="small"
                              @click.stop="savePoiLocation(poi)"
                              >
                                <el-icon><Plus /></el-icon>
                              </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>

                    <!-- 分页 -->
                    <div class="results-pagination" v-if="poiTotalCount > 10">
                      <el-pagination
                        layout="prev, pager, next"
                        :total="poiTotalCount"
                        :page-size="10"
                        :current-page="poiCurrentPage"
                        @current-change="handlePoiPageChange"
                        small
                      />
                    </div>

                      <!-- 空结果状态 -->
                      <div class="empty-results" v-else-if="!isSearching">
                    <el-empty
                      description="未找到结果，请尝试修改关键词或扩大搜索范围"
                      :image-size="80"
                        />
                  </div>
                </div>

                    <!-- 快捷搜索 -->
                    <div class="quick-search">
                      <div class="quick-search-label">快速搜索</div>
                <div class="quick-search-tags">
                        <div
                      v-for="tag in quickSearchTags"
                      :key="tag"
                          class="search-tag"
                          :data-keyword="tag"
                      @click="quickSearch(tag)"
                    >
                          <span>{{ tag }}</span>
                        </div>
                  </div>
                </div>
              </div>
            </el-collapse-item>

            <!-- 地图控制面板 -->
            <el-collapse-item title="地图控制" name="controls">
                  <div class="controls-panel">
              <div class="control-section">
                      <div class="section-title">地图样式</div>
                      <el-radio-group
                        v-model="mapStyle"
                        @change="updateMapStyle"
                        class="style-selector"
                        size="large"
                      >
                  <el-radio-button label="standard">标准</el-radio-button>
                  <el-radio-button label="satellite">卫星</el-radio-button>
                  <el-radio-button label="dark">暗色</el-radio-button>
                </el-radio-group>
              </div>

              <div class="control-section">
                      <div class="section-title">缩放级别</div>
                      <el-slider
                        v-model="mapZoom"
                        :min="3"
                        :max="20"
                        :step="0.5"
                        show-stops
                        @change="updateZoom"
                        class="zoom-slider"
                      />
                    </div>
              </div>
            </el-collapse-item>
          </el-collapse>
            </el-scrollbar>
        </div>

        <div class="sidebar-footer">
            <el-button type="primary" @click="saveCurrentView" class="save-view-btn">
              保存当前视图
            </el-button>
        </div>
        </div>

        <!-- 侧边栏切换按钮 -->
        <div class="sidebar-toggle">
          <el-button
            circle
            @click="showSidebar = !showSidebar"
            class="toggle-btn"
          >
            <el-icon v-if="showSidebar"><ArrowLeft /></el-icon>
            <el-icon v-else><ArrowRight /></el-icon>
          </el-button>
        </div>
      </aside>

      <!-- 地图区域 -->
      <div class="map-container">
        <!-- 腾讯地图组件 -->

        <tlbs-map
          ref="mapRef"
          api-key="XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS"
          :center="mapCenter"
          :zoom="mapZoom"
          :control="mapControl"
          @click="handleMapClick"
          @map_inited="onMapInited"
          class="map-instance"
        >
          <tlbs-multi-marker
            ref="markerRef"
            :geometries="geometries"
            :styles="styles"
            :options="options"
            @click="handleMarkerClick"
            @marker_init="handleMarkerInit"
          />
          <!-- 添加圆形覆盖物 -->
          <tlbs-multi-polygon :geometries="circleGeometries" :styles="circleStyles" />
          <tlbs-info-window
            ref="infoWindowRef"
            :visible="infoWindowVisible"
            :position="infoWindowPosition"
            :content="infoWindowContent"
            :options="infoWindowOptions"
          />
        </tlbs-map>

        <!-- 地图控件 -->
        <div class="map-controls">
          <div class="zoom-controls">
            <el-button circle @click="zoomIn" class="control-btn">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button circle @click="zoomOut" class="control-btn">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
          </div>
          <el-button circle @click="goToUserLocation" class="location-btn">
            <el-icon><Position /></el-icon>
          </el-button>
        </div>

        <!-- 信息卡片 -->
        <transition name="fade">
        <el-card v-if="selectedLocation" class="info-card">
          <template #header>
            <div class="card-header">
                <span style="color: #409EFF">选中的位置</span>
                <el-button text @click="selectedLocation = null">
                  <el-icon><Close /></el-icon>
                </el-button>
            </div>
          </template>
            <div class="card-content">
            <div class="coordinates">
              <strong>坐标：</strong>
                <span>{{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}</span>
            </div>
              <div class="card-actions">
                <el-button type="primary" @click.stop="saveLocation">
                  <el-icon><Flag /></el-icon>
                  保存位置
              </el-button>
                <el-button @click.stop="copyCoordinates">
                <el-icon><Document /></el-icon>
                  复制坐标
              </el-button>
            </div>
          </div>
        </el-card>
        </transition>
      </div>
    </main>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="地图设置"
      width="500px"
      class="settings-dialog"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="默认地图中心">
          <div class="coord-inputs">
            <el-input-number
              v-model="defaultCenter.lat"
              :precision="6"
              :step="0.000001"
              label="纬度"
              class="coord-input"
            />
            <el-input-number
              v-model="defaultCenter.lng"
              :precision="6"
              :step="0.000001"
              label="经度"
              class="coord-input"
            />
          </div>
        </el-form-item>
        <el-form-item label="默认缩放级别">
          <el-slider
            v-model="defaultZoom"
            :min="3"
            :max="20"
            :step="0.5"
            show-stops
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 标记编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑位置"
      width="400px"
      class="marker-dialog"
      destroy-on-close
      :modal="false"
      :close-on-click-modal="false"
      append-to-body
    >

      <el-form label-position="top">
        <el-form-item label="标记名称" required>
            <el-input
              v-model="markerName"
              placeholder="输入标记名称"
              maxlength="30"
              show-word-limit
              clearable
            />
          </el-form-item>
        <el-form-item label="位置坐标" v-if="editingMarker">
          <div class="coord-display">
            <div>纬度: {{ editingMarker.data.lat.toFixed(6) }}</div>
            <div>经度: {{ editingMarker.data.lng.toFixed(6) }}</div>
            </div>
          </el-form-item>
        </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveMarkerEdit"
            :disabled="!markerName.trim()"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增标记对话框 -->
    <el-dialog
      v-model="showNewMarkerDialog"
      title="新增位置"
      width="400px"
      class="marker-dialog"
      destroy-on-close
      :modal="false"
      :close-on-click-modal="false"
      append-to-body
    >

      <el-form label-position="top">
        <el-form-item label="标记名称" required>
            <el-input
              v-model="markerName"
              placeholder="输入标记名称"
              maxlength="30"
              show-word-limit
              clearable
            />
          </el-form-item>
        <el-form-item label="位置坐标" v-if="selectedLocation">
          <div class="coord-display">
            <div>纬度: {{ selectedLocation.lat.toFixed(6) }}</div>
            <div>经度: {{ selectedLocation.lng.toFixed(6) }}</div>
            </div>
          </el-form-item>
        </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showNewMarkerDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveNewMarker"
            :disabled="!markerName.trim()"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Flag,
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
  Close,
  Document,
  Edit,
  Plus,
  Van,
  Guide,
  Place,
  MapLocation
} from '@element-plus/icons-vue'

// 全局类型声明
declare global {
  interface Window {
    handleMapResponse: (data: any) => void;
    handleSuggestionResponse: (data: any) => void;
    TMap: any; // 添加TMap类型声明
    handleMarkerEdit: (index: number) => void;
    handleMarkerCenter: (lat: number, lng: number) => void;
    handleMarkerDelete: (index: number) => void;
    handleMarkerSave: (lat: number, lng: number) => void;
    handlePoiSave: (poiStr: string) => void;
  }
}

// 标记点击标志，用于阻止地图点击事件
const isMarkerClick = ref(false)
const lastMarkerClickTime = ref(0)

// 地图实例
const mapRef = ref<any>(null)

// UI状态
const showSidebar = ref(true)
const activeCollapse = ref(['locations', 'controls', 'nearby-search'])
const showSettings = ref(false)
const searchQuery = ref('')
const selectedLocation = ref<null | { lat: number, lng: number }>(null)
const editingMarker = ref<null | { index: number, data: any }>(null)
const showEditDialog = ref(false)
const markerName = ref('')
const showNewMarkerDialog = ref(false)

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

// 搜索半径圆
const searchCircleRef = ref<any>(null)
// 圆形覆盖物的几何数据
interface CircleGeometry {
  styleId: string;
  paths: { lat: number; lng: number }[][];
  properties: {
    id: string;
    isSearchCircle: boolean;
  }
}

// 圆形覆盖物的几何数据
const circleGeometries = ref<CircleGeometry[]>([])

// 标记相关数据
const markerRef = ref<any>(null)

// 修改样式类型和geometries类型
interface PoiMarkerStyle {
  width: number;
  height: number;
  anchor: { x: number; y: number };
  src: string;
}

interface MarkerStyles {
  default: PoiMarkerStyle;
  active: PoiMarkerStyle;
  poi: PoiMarkerStyle;
}

interface MarkerProperties {
  title: string;
  id: string | number;
  poiId?: string;
  isPoi?: boolean;
}

interface Geometry {
  styleId: string;
  position: { lat: number; lng: number };
  properties: MarkerProperties;
}

// 定义POI类型
interface PoiItem {
  id: string;
  title: string;
  address: string;
  category: string;
  tel?: string;
  type: number;
  location: { lat: number; lng: number };
  _distance: number;
  ad_info?: {
    adcode: number;
    province: string;
    city: string;
    district: string;
  };
  value?: string; // 用于自动补全显示
}

// 搜索建议类型定义
type PoiSuggestion = PoiItem;

// API响应类型
type ApiResponse = {
  status: number;
  message: string;
  count: number;
  data: PoiItem[];
}

// 样式和几何标记
const styles = ref<MarkerStyles>({
  default: {
    width: 32,
    height: 32,
    anchor: { x: 16, y: 32 },
    src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjQwNDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluIj48cGF0aCBkPSJNMjAgMTBjMCA2LTggMTItOCAxMnMtOC02LTgtMTJhOCA4IDAgMCAxIDE2IDBaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg=='
  },
  active: {
    width: 40,
    height: 40,
    anchor: { x: 20, y: 40 },
    src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA4MGZmIiBzdHJva2U9IiMwMDgwZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluIj48cGF0aCBkPSJNMjAgMTBjMCA2LTggMTItOCAxMnMtOC02LTgtMTJhOCA4IDAgMCAxIDE2IDBaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0id2hpdGUiIHN0cm9rZT0id2hpdGUiLz48L3N2Zz4='
  },
  poi: {
    width: 32,
    height: 32,
    anchor: { x: 16, y: 32 },
    src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjdjMjNhIiBzdHJva2U9IiM2N2MyM2EiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluIj48cGF0aCBkPSJNMjAgMTBjMCA2LTggMTItOCAxMnMtOC02LTgtMTJhOCA4IDAgMCAxIDE2IDBaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0id2hpdGUiIHN0cm9rZT0id2hpdGUiLz48L3N2Zz4='
  }
})

// 圆形样式
const circleStyles = ref({
  circle: {
    color: 'rgba(103, 194, 58, 0.2)', // 填充颜色
    borderColor: '#67C23A',           // 描边颜色
    borderWidth: 2,                  // 描边宽度
    borderStyle: 'dashed'            // 虚线样式
  }
})

const geometries = ref<Geometry[]>([
  {
    styleId: 'default',
    position: { lat: 39.984120, lng: 116.307484 },
    properties: { title: '北京市中心', id: 1 }
  },
  {
    styleId: 'default',
    position: { lat: 39.916345, lng: 116.397155 },
    properties: { title: '故宫', id: 2 }
  }
])

const options = ref({
  joinStyle: true,
  enableDragging: false,
  clickable: true,
  cursor: 'pointer'
})

// 信息窗口相关
const infoWindowRef = ref<any>(null)
const infoWindowVisible = ref(false)
const infoWindowPosition = ref({ lat: 0, lng: 0 })
const infoWindowContent = ref('')
const infoWindowOptions = ref({
  offset: { x: 0, y: -32 }, // 向上偏移以避免遮挡标记
  closeButton: true,
  enableAnimation: true,
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
})

// 保存的位置
const savedLocations = ref([
  { name: '北京市中心', lat: 39.984120, lng: 116.307484 },
  { name: '故宫', lat: 39.916345, lng: 116.397155 }
])

// 位置筛选
const locationFilter = ref('')
const activeLocationTag = ref('all')
const locationTags = ref([
  { label: '全部', value: 'all' },
  { label: '最近添加', value: 'recent' },
  { label: '常用', value: 'frequent' }
])

// 格式化坐标显示
const formatCoordinates = (location) => {
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
}

// 筛选位置列表
const filteredLocations = computed(() => {
  let result = [...savedLocations.value]

  // 根据标签筛选
  if (activeLocationTag.value === 'recent') {
    // 获取最近5个添加的位置
    result = result.slice(-5)
  } else if (activeLocationTag.value === 'frequent') {
    // 这里可以根据实际逻辑筛选常用位置
    // 简化示例：按字母排序
    result = result.sort((a, b) => a.name.localeCompare(b.name))
  }

  // 根据搜索文本筛选
  if (locationFilter.value) {
    const searchText = locationFilter.value.toLowerCase()
    result = result.filter(loc =>
      loc.name.toLowerCase().includes(searchText) ||
      formatCoordinates(loc).includes(searchText)
    )
  }

  return result
})

// 切换位置标签
const toggleLocationTag = (tag) => {
  activeLocationTag.value = tag
}

// 检查是否为当前活跃位置
const isActiveLocation = (location) => {
  return mapCenter.value.lat === location.lat && mapCenter.value.lng === location.lng
}

// 添加新位置
const addNewLocation = () => {
  // 设置地图中心为添加位置
  if (mapRef.value && mapRef.value.map) {
    const center = mapRef.value.map.getCenter()
    selectedLocation.value = {
      lat: center.lat,
      lng: center.lng
    }
    saveLocation()
  }
}

// 确认删除位置
const confirmDeleteLocation = (index) => {
  ElMessageBox.confirm(
    '确定要删除这个位置吗？此操作不可恢复。',
    '删除位置',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      removeLocation(index)
    })
    .catch(() => {
      // 取消操作
    })
}

// 地图初始化完成
const onMapInited = () => {
  ElMessage.success('地图加载成功')
  console.log('地图实例:', mapRef.value?.map)

  // 在初始化完成后设置事件处理
  console.log('标记和地图事件已正确设置')
}

// 直接处理标记点击事件（符合腾讯地图API方式）
const handleMarkerClickDirect = (evt) => {
  console.log('标记直接点击:', evt)

  // 设置标记点击标志和时间戳
  isMarkerClick.value = true
  lastMarkerClickTime.value = Date.now()

  // 腾讯地图API不支持标准的事件阻止方法
  // 不要尝试调用 stopPropagation 或 preventDefault

  if (evt.geometry && evt.geometry.properties) {
    const title = evt.geometry.properties.title
    const markerPosition = evt.latLng || evt.geometry.position

    // 清除选中位置，避免同时显示两个信息框
    selectedLocation.value = null

    // 查找关联的保存位置
    const locationIndex = savedLocations.value.findIndex(loc =>
      loc.lat === markerPosition.lat && loc.lng === markerPosition.lng
    )

    const markerInfo = {
      name: title || `标记 #${evt.geometry.properties.id || '未知'}`,
      lat: markerPosition.lat,
      lng: markerPosition.lng
    }

    // 显示带操作按钮的信息窗口
    showInfoWindowWithActions(
      markerPosition,
      markerInfo,
      locationIndex,
      evt.geometry.properties.id - 1
    )
  }
}

// 处理地图点击
const handleMapClick = (e) => {
  // 检查是否点击了信息卡片
  const infoCard = document.querySelector('.info-card');
  if (infoCard && infoCard.contains(e.target)) {
    console.log('点击了信息卡片，忽略地图点击事件');
    return;
  }

  // 检查是否在短时间内已经处理了标记点击
  if (isMarkerClick.value && Date.now() - lastMarkerClickTime.value < 300) {
    console.log('忽略地图点击，因为刚刚点击了标记');
    isMarkerClick.value = false;
    return;
  }

  console.log('地图点击:', e);

  // 先隐藏信息窗口
  infoWindowVisible.value = false;

  // 设置选中位置
  selectedLocation.value = {
    lat: e.latLng.lat,
    lng: e.latLng.lng
  };

  // 如果新增标记对话框已打开，则更新坐标
  if (showNewMarkerDialog.value) {
    console.log('对话框打开状态，更新选中的位置坐标');
    // 坐标已经更新到selectedLocation，无需额外操作
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
    const userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    // 设置地图中心
    mapCenter.value = userLocation

    // 显示信息窗口
    showInfoWindow(
      userLocation,
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

    ElMessage.success('已导航到您的当前位置')
  }, () => {
    ElMessage.error('无法获取您的位置')
  })
}

const goToLocation = (location) => {
  // 设置地图中心
  mapCenter.value = {
    lat: location.lat,
    lng: location.lng
  }

  // 查找关联的标记
  const markerIndex = geometries.value.findIndex(marker =>
    marker.position.lat === location.lat &&
    marker.position.lng === location.lng
  )

  // 查找在savedLocations中的索引
  const locationIndex = savedLocations.value.findIndex(loc =>
    loc.lat === location.lat && loc.lng === location.lng
  )

  // 显示带操作按钮的信息窗口
  showInfoWindowWithActions(
    { lat: location.lat, lng: location.lng },
    { name: location.name, lat: location.lat, lng: location.lng },
    locationIndex,
    markerIndex
  )

  ElMessage.success(`已导航到${location.name}`)
}

const saveLocation = () => {
  if (selectedLocation.value) {
    // 清空标记名称并打开对话框
    markerName.value = ''
    showNewMarkerDialog.value = true
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

// 保存新标记
const saveNewMarker = () => {
  if (selectedLocation.value && markerName.value.trim()) {
    const newLocation = {
      name: markerName.value.trim(),
      lat: selectedLocation.value.lat,
      lng: selectedLocation.value.lng
    }
    savedLocations.value.push(newLocation)
    // 添加标记
    addMarker(selectedLocation.value, newLocation.name)
    // 关闭对话框
    showNewMarkerDialog.value = false
    ElMessage.success('位置已保存')
  } else {
    ElMessage.warning('请输入标记名称')
  }
}

// 添加新标记
const addMarker = (position, title?: string | null) => {
  console.log('添加标记:', position)
  // 克隆数组以触发响应式更新
  const newGeometries = [...geometries.value]
  const markerId = geometries.value.length + 1
  const markerTitle = title || `位置 ${markerId}`

  newGeometries.push({
    styleId: 'default',
    position: { lat: position.lat, lng: position.lng },
    properties: { title: markerTitle, id: markerId }
  })
  geometries.value = newGeometries

  // 尝试手动刷新标记
  setTimeout(() => {
    if (markerRef.value && markerRef.value.refresh) {
      markerRef.value.refresh()
    }
  }, 100)

  ElMessage.success('已添加新标记')
}

// 编辑标记
const editMarker = (index) => {
  if (index >= 0 && index < savedLocations.value.length) {
    editingMarker.value = {
      index,
      data: {...savedLocations.value[index]}
    }
    markerName.value = savedLocations.value[index].name
    showEditDialog.value = true
  }
}

// 显示带操作按钮的信息窗口
const showInfoWindowWithActions = (position, markerInfo, savedIndex, markerIndex) => {
  const content = `
    <div class="info-window-content">
      <h3>${markerInfo.name}</h3>
      <p class="info-coordinates">${markerInfo.lat.toFixed(6)}, ${markerInfo.lng.toFixed(6)}</p>
      <div class="info-window-actions">
        <button class="info-action-edit" onclick="window.handleMarkerEdit(${savedIndex})">
          <span class="info-action-icon">✏️</span> 编辑
        </button>
        <button class="info-action-center" onclick="window.handleMarkerCenter(${markerInfo.lat}, ${markerInfo.lng})">
          <span class="info-action-icon">🎯</span> 定位
        </button>
        ${savedIndex > -1 ?
          `<button class="info-action-delete" onclick="window.handleMarkerDelete(${savedIndex})">
            <span class="info-action-icon">🗑️</span> 删除
          </button>` :
          `<button class="info-action-save" onclick="window.handleMarkerSave(${markerInfo.lat}, ${markerInfo.lng})">
            <span class="info-action-icon">💾</span> 保存
          </button>`
        }
      </div>
    </div>
  `;

  infoWindowPosition.value = position;
  infoWindowContent.value = content;
  infoWindowVisible.value = true;
}

const handleMarkerInit = (marker) => {
  console.log('标记初始化:', marker)

  // 在标记初始化后设置点击事件
  if (marker && marker.on) {
    try {
      // 使用原生方法绑定事件
      marker.on('click', handleMarkerClickDirect)
      console.log('已绑定标记点击事件')
    } catch (error) {
      console.error('绑定标记点击事件失败:', error)
    }
  }
}

// 显示信息窗口
const showInfoWindow = (position, content) => {
  infoWindowPosition.value = position
  infoWindowContent.value = content
  infoWindowVisible.value = true
}

// 保存标记编辑
const saveMarkerEdit = () => {
  if (editingMarker.value && markerName.value.trim()) {
    // 更新保存的位置名称
    savedLocations.value[editingMarker.value.index].name = markerName.value

    const position = savedLocations.value[editingMarker.value.index]

    // 关闭编辑对话框
    showEditDialog.value = false

    // 显示信息窗口
    showInfoWindow(
      { lat: position.lat, lng: position.lng },
      `<div class="info-window-content">
        <h3>${markerName.value}</h3>
        <p>位置已更新</p>
        <p class="info-coordinates">${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</p>
      </div>`
    )
  }
}

// 周边搜索相关状态
const poiSearchKeyword = ref('')
const poiSearchRadius = ref(500)
const poiSearchCategory = ref('')
const poiAutoExtend = ref(true)
const poiSearchResults = ref<PoiItem[]>([])
const showSearchResults = ref(false)
const isSearching = ref(false)
const poiTotalCount = ref(0)
const poiCurrentPage = ref(1)
const activePoi = ref<string | null>(null)

// POI分类
const poiCategories = ref([
  { label: '餐饮服务', value: '餐饮服务' },
  { label: '购物', value: '购物' },
  { label: '酒店', value: '酒店' },
  { label: '公交车站', value: '公交车站' },
  { label: '地铁站', value: '地铁站' },
  { label: '医疗', value: '医疗' },
  { label: '教育', value: '教育' },
  { label: '景点', value: '景点' },
  { label: '金融', value: '金融' },
  { label: '运动健身', value: '运动健身' }
])

// 快捷搜索标签
const quickSearchTags = ref(['餐厅', '超市', '酒店', '医院', '咖啡', '地铁', '公园', '银行', '健身房'])

// 用户当前位置
const userCurrentLocation = ref<null | { lat: number, lng: number }>(null)
const isUsingUserLocation = ref(false)

// 获取用户当前位置
const getCurrentLocation = () => {
  ElMessage.info('正在获取您的位置...')
  return new Promise<{lat: number, lng: number}>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      userCurrentLocation.value = userLocation
      ElMessage.success('已获取到您的位置')
      resolve(userLocation)
    }, (error) => {
      ElMessage.error(`无法获取您的位置: ${error.message}`)
      reject(error)
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
  })
}

// 修改周边搜索，使用当前位置
const toggleUseCurrentLocation = async () => {
  try {
    if (!userCurrentLocation.value) {
      // 如果还没有获取过位置，先获取
      await getCurrentLocation()
    }

    isUsingUserLocation.value = !isUsingUserLocation.value

    if (isUsingUserLocation.value) {
      ElMessage.success('已切换到使用您的当前位置进行搜索')
    } else {
      ElMessage.success('已切换到使用地图中心位置进行搜索')
    }
  } catch (error) {
    console.error('切换位置失败:', error)
    isUsingUserLocation.value = false
  }
}

// 在组件挂载时尝试获取用户位置
onMounted(async () => {
  // 注册全局事件处理函数，用于信息窗口按钮
  window.handleMarkerEdit = (index) => {
    console.log('编辑标记:', index);
    if (index > -1) {
      editMarker(index);
    }
  };

  window.handleMarkerCenter = (lat, lng) => {
    console.log('定位到坐标:', lat, lng);
    mapCenter.value = { lat, lng };
  };

  window.handleMarkerDelete = (index) => {
    console.log('删除标记:', index);
    confirmDeleteLocation(index);
  };

  window.handleMarkerSave = (lat, lng) => {
    console.log('保存位置:', lat, lng);
    selectedLocation.value = { lat, lng };
    saveLocation();
  };

  window.handlePoiSave = (poiStr) => {
    console.log('保存POI:', poiStr);
    try {
      const poiData = JSON.parse(decodeURIComponent(poiStr));
      savePoiLocation(poiData);
    } catch (error) {
      console.error('解析POI数据失败:', error);
    }
  };

  // 监听标记编辑事件
  window.addEventListener('marker-edit', ((e: CustomEvent) => {
    const { index } = e.detail as { index: number };
    if (index > -1) {
      editMarker(index);
    }
  }) as EventListener);

  // 监听标记定位事件
  window.addEventListener('marker-center', ((e: CustomEvent) => {
    const { lat, lng } = e.detail as { lat: number, lng: number };
    mapCenter.value = { lat, lng };
  }) as EventListener);

  // 监听标记删除事件
  window.addEventListener('marker-delete', ((e: CustomEvent) => {
    const { index } = e.detail as { index: number };
    if (index > -1) {
      removeLocation(index);
    }
  }) as EventListener);

  // 监听标记保存事件
  window.addEventListener('marker-save', ((e: CustomEvent) => {
    const { lat, lng } = e.detail as { lat: number, lng: number };
    selectedLocation.value = { lat, lng };
    saveLocation();
  }) as EventListener);

  // 监听POI保存事件
  window.addEventListener('poi-save', ((e: CustomEvent) => {
    try {
      const poiData = JSON.parse(decodeURIComponent(e.detail.poi))
      savePoiLocation(poiData)
    } catch (error) {
      console.error('解析POI数据失败:', error)
    }
  }) as EventListener);

  // 尝试获取用户位置
  try {
    await getCurrentLocation()
  } catch (error) {
    console.error('获取用户位置失败:', error)
  }
});

  // 计算两点间的距离（km）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // 地球半径（km）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // 格式化距离显示
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}米`;
    } else {
      return `${(distance / 1000).toFixed(1)}公里`;
    }
  };

  // 处理选择提示项
  const handleSuggestionSelect = (item: PoiSuggestion) => {
    console.log('选择了建议项:', item);

    // 如果有位置信息，将地图中心设置到该位置
    if (item.location) {
      mapCenter.value = {
        lat: item.location.lat,
        lng: item.location.lng
      };

      // 显示标记和信息窗口
      const poi = {
        id: item.id || `suggestion_${Date.now()}`,
        title: item.title,
        address: item.address || '',
        location: item.location,
        category: item.category || '',
        _distance: item._distance || 0,
        type: item.type
      };

      // 清除之前的搜索结果
      clearSearchResults();

      // 添加单个标记到地图
      showSinglePoiMarker(poi);

      // 搜索一下周边
      poiSearchKeyword.value = item.title;
      searchNearbyPoi(item.title);
    }
  };

  // 显示单个POI标记
  const showSinglePoiMarker = (poi: PoiItem) => {
    // 清除之前的POI标记
    clearPoiMarkers();

    // 添加新标记
    const newGeometries: Geometry[] = [...geometries.value];

    newGeometries.push({
      styleId: 'poi',
      position: { lat: poi.location.lat, lng: poi.location.lng },
      properties: {
        title: poi.title,
        id: poi.id,
        poiId: poi.id,
        isPoi: true
      }
    });

    // 更新标记
    geometries.value = newGeometries;

    // 刷新标记组件
    setTimeout(() => {
      if (markerRef.value && markerRef.value.refresh) {
        markerRef.value.refresh();
      }
    }, 100);
  };

  // 修改搜索周边POI函数，使用当前位置或地图中心
  const searchNearbyPoi = (keyword) => {
    if (!keyword && !poiSearchKeyword.value.trim() && !poiSearchCategory.value) {
      ElMessage.warning('请输入关键词或选择分类')
      return
    }

    isSearching.value = true
    showSearchResults.value = true

    // 清除之前可能存在的JSONP脚本
    const oldScript = document.getElementById('map-jsonp')
    if (oldScript) document.body.removeChild(oldScript)

    // 使用关键词参数或当前输入框的值
    const searchKeyword = keyword || poiSearchKeyword.value.trim()

    // 生成唯一的回调函数名
    const callbackName = 'mapCallback_' + Date.now()

    // 构建JSONP URL
    const center = isUsingUserLocation.value && userCurrentLocation.value
      ? userCurrentLocation.value
      : mapCenter.value

    const autoExtend = poiAutoExtend.value ? 1 : 0
    const encodedKeyword = encodeURIComponent(searchKeyword)
    const boundary = `nearby(${center.lat},${center.lng},${poiSearchRadius.value},${autoExtend})`
    const filter = poiSearchCategory.value ? `&filter=category=${encodeURIComponent(poiSearchCategory.value)}` : ''

    const apiUrl = `https://apis.map.qq.com/ws/place/v1/search?key=XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS&keyword=${encodedKeyword}&boundary=${boundary}${filter}&page_size=10&page_index=${poiCurrentPage.value}&get_subpois=1&output=jsonp&callback=${callbackName}`

    // 创建脚本元素
    const script = document.createElement('script')
    script.id = 'map-jsonp'
    script.src = apiUrl

    // 处理返回数据
    window[callbackName] = (data) => {
    console.log(data);

      isSearching.value = false
      if (data.status === 0) {
        // 处理数据...
        poiSearchResults.value = data.data.map((item) => {

          // 构建符合PoiItem类型的对象
          return {
            id: item.id || `poi_${Date.now()}_${Math.random()}`,
            title: item.title,
            address: item.address || '',
            category: item.category || poiSearchCategory.value || (searchKeyword ? searchKeyword : '未分类'),
            tel: item.tel || '',
            type: item.type || 0,
            location: item.location || { lat: 0, lng: 0 },
            _distance: item._distance || 0,
            ad_info: item.ad_info || {
              adcode: 0,
              province: '',
              city: '',
              district: ''
            }
          }
        });

        poiTotalCount.value = data.count || poiSearchResults.value.length;

        // 在地图上显示结果
        showPoiMarkersOnMap(poiSearchResults.value);

        // 绘制搜索半径圆
        if (poiSearchResults.value.length > 0) {
          const center = isUsingUserLocation.value && userCurrentLocation.value
            ? userCurrentLocation.value
            : mapCenter.value;
          drawSearchRadiusCircle(center, poiSearchRadius.value);
        }

        const locationSource = isUsingUserLocation.value ? '您的当前位置' : '地图中心'
        ElMessage.success(`在${locationSource}周围找到 ${data.count || poiSearchResults.value.length} 个位置`);
      } else {
        poiSearchResults.value = [];
        ElMessage.error(data.message || '搜索失败')
      }

      // 清理回调函数
      delete window[callbackName]
    }

    // 添加脚本到文档
    document.body.appendChild(script)
  }

  // 查询关键词提示，修改为使用当前位置或地图中心
  const queryKeywordSuggestions = async (queryString: string, cb: (arg: PoiSuggestion[]) => void) => {
    if (queryString.length < 1) {
      cb([]);
      return;
    }

    try {
      // 清除之前可能存在的JSONP脚本
      const oldScript = document.getElementById('suggestion-jsonp')
      if (oldScript) document.body.removeChild(oldScript)

      // 获取当前中心点（使用用户当前位置或地图中心）
      const center = isUsingUserLocation.value && userCurrentLocation.value
        ? userCurrentLocation.value
        : mapCenter.value;

      // 生成唯一的回调函数名
      const callbackName = 'suggestionCallback_' + Date.now()

      // 构建JSONP URL
      const apiUrl = `https://apis.map.qq.com/ws/place/v1/suggestion?key=XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS&keyword=${encodeURIComponent(queryString)}&location=${center.lat},${center.lng}&policy=1&page_size=10&output=jsonp&callback=${callbackName}`;

      console.log('发送建议API请求:', apiUrl);

      // 创建脚本元素
      const script = document.createElement('script')
      script.id = 'suggestion-jsonp'
      script.src = apiUrl

      // 处理返回数据
      window[callbackName] = (data) => {
        if (data.status === 0 && data.data) {
          // 转换为autocomplete组件所需格式
          const suggestions = data.data.map((item: any) => {
            // 构建符合PoiSuggestion类型的对象
            return {
              id: item.id || `suggestion_${Date.now()}_${Math.random()}`,
              title: item.title,
              address: item.address || '',
              value: item.title,
              location: item.location || { lat: 0, lng: 0 },
              _distance: item._distance || 0,
              type: item.type || 0,
              category: item.category || '',
              ad_info: item.ad_info || {
                adcode: 0,
                province: '',
                city: '',
                district: ''
              }
            };
          });

          cb(suggestions);
        } else {
          console.error('API返回错误:', data);
          cb([]);
        }

        // 清理回调函数
        delete window[callbackName]
      };

      // 添加脚本到文档
      document.body.appendChild(script)
    } catch (error) {
      console.error('获取关键词提示失败:', error);
      cb([]);
    }
  };

  // 在地图上显示POI标记
  const showPoiMarkersOnMap = (pois: PoiItem[]) => {
    // 清除之前的POI标记
    clearPoiMarkers()

    // 添加新的POI标记
    const newGeometries: Geometry[] = [...geometries.value]

    pois.forEach((poi, index) => {
      newGeometries.push({
        styleId: 'poi',
        position: { lat: poi.location.lat, lng: poi.location.lng },
        properties: {
          title: poi.title,
          id: `poi_${index}`,
          poiId: poi.id,
          isPoi: true
        }
      })
    })

    // 更新标记
    geometries.value = newGeometries

    // 刷新标记组件
    setTimeout(() => {
      if (markerRef.value && markerRef.value.refresh) {
        markerRef.value.refresh()
      }
    }, 100)
  }

  // 清除POI标记
  const clearPoiMarkers = () => {
    // 过滤掉POI标记
    geometries.value = geometries.value.filter(geo => !geo.properties.isPoi)
  }

  // 绘制搜索半径圆
  const drawSearchRadiusCircle = (center, radius) => {
    try {
      // 清除之前的圆形
      circleGeometries.value = []

      // 确保地图实例存在
      if (!mapRef.value || !mapRef.value.map) {
        console.error('地图实例不存在，无法绘制圆形')
        return
      }

      // 生成圆形的点集合
      const points: { lat: number; lng: number }[] = []
      const lat = center.lat
      const lng = center.lng
      const R = 6371000 // 地球半径（米）
      const d = radius / R  // 半径转弧度

      // 生成圆形的点坐标
      for (let i = 0; i <= 36; i++) {
        const angle = Math.PI * 2 * (i / 36)
        const dx = d * Math.cos(angle)
        const dy = d * Math.sin(angle)
        const dlat = dy
        const dlng = dx / Math.cos(lat * Math.PI / 180)

        points.push({
          lat: lat + dlat * 180 / Math.PI,
          lng: lng + dlng * 180 / Math.PI
        })
      }

      // 创建圆形几何数据
      circleGeometries.value = [{
        styleId: 'circle',
        paths: [points],
        properties: {
          id: 'search_circle',
          isSearchCircle: true
        }
      }]

      console.log(`已绘制半径 ${radius}m 的搜索范围圆，中心点: ${center.lat}, ${center.lng}`)
    } catch (error) {
      console.error('绘制搜索范围圆失败:', error)
    }
  }

  // 清除搜索结果
  const clearSearchResults = () => {
    poiSearchResults.value = []
    showSearchResults.value = false
    activePoi.value = null

    // 清除地图上的标记
    clearPoiMarkers()

    // 清除搜索半径圆
    circleGeometries.value = []
  }

  // 处理分页变化
  const handlePoiPageChange = (page) => {
    poiCurrentPage.value = page
    searchNearbyPoi(poiSearchKeyword.value)
  }

  // 选择POI
  const selectPoi = (poi) => {
    activePoi.value = poi.id

    // 显示信息窗口
    showPoiInfoWindow(poi)
  }

  // 显示POI信息窗口
  const showPoiInfoWindow = (poi) => {
    // 确保全局方法存在
    window.handlePoiSave = (poiStr) => {
      try {
        const poiData = JSON.parse(decodeURIComponent(poiStr));
        savePoiLocation(poiData);
      } catch (error) {
        console.error('解析POI数据失败:', error);
      }
    };

    const content = `
      <div class="info-window-content">
        <h3>${poi.title}</h3>
        <p>${poi.address || ''}</p>
        <p class="info-coordinates">${poi.location.lat.toFixed(6)}, ${poi.location.lng.toFixed(6)}</p>
        <p><strong>分类：</strong>${poi.category}</p>
        ${poi.tel ? `<p><strong>电话：</strong>${poi.tel}</p>` : ''}
        <div class="info-window-actions">
          <button class="info-action-center" onclick="window.handleMarkerCenter(${poi.location.lat}, ${poi.location.lng})">
            <span class="info-action-icon">🎯</span> 定位
          </button>
          <button class="info-action-save" onclick="window.handlePoiSave('${encodeURIComponent(JSON.stringify(poi))}')">
            <span class="info-action-icon">💾</span> 保存
          </button>
        </div>
      </div>
    `;

    showInfoWindow(
      poi.location,
      content
    );
  }

  // 定位到POI
  const goToPoi = (poi) => {
    mapCenter.value = {
      lat: poi.location.lat,
      lng: poi.location.lng
    }

    // 显示信息窗口
    showPoiInfoWindow(poi)

    // 设置激活POI
    activePoi.value = poi.id
  }

  // 保存POI位置
  const savePoiLocation = (poi) => {
    // 打开保存对话框
    selectedLocation.value = {
      lat: poi.location.lat,
      lng: poi.location.lng
    }

    // 预填充名称
    markerName.value = poi.title

    // 显示对话框
    showNewMarkerDialog.value = true
  }

  // 快速搜索
  const quickSearch = (keyword) => {
    poiSearchKeyword.value = keyword
    searchNearbyPoi(keyword)
}

const handleMarkerClick = (evt) => {
  // 打印信息，便于调试
  console.log('标记点击:', evt);

  // 设置标记点击标志和时间戳
  isMarkerClick.value = true
  lastMarkerClickTime.value = Date.now()

  // 不要尝试使用DOM事件方法
  // 腾讯地图API有自己的事件处理机制

  // 处理事件...
  if (evt.geometry && evt.geometry.properties) {
    const title = evt.geometry.properties.title;
    const markerPosition = evt.latLng || evt.geometry.position;

    // 显示信息窗口逻辑...
    showInfoWindowWithActions(
      markerPosition,
      { name: title, lat: markerPosition.lat, lng: markerPosition.lng },
      -1,
      evt.geometry.properties.id
    );
  }
}

// 组件卸载时清除全局事件监听
onUnmounted(() => {
  // 清除全局事件处理函数 - 使用类型断言解决类型问题
  if ('handleMarkerEdit' in window) (window as any).handleMarkerEdit = null;
  if ('handleMarkerCenter' in window) (window as any).handleMarkerCenter = null;
  if ('handleMarkerDelete' in window) (window as any).handleMarkerDelete = null;
  if ('handleMarkerSave' in window) (window as any).handleMarkerSave = null;
  if ('handlePoiSave' in window) (window as any).handlePoiSave = null;

  // 移除事件监听器
  window.removeEventListener('marker-edit', () => {});
  window.removeEventListener('marker-center', () => {});
  window.removeEventListener('marker-delete', () => {});
  window.removeEventListener('marker-save', () => {});
  window.removeEventListener('poi-save', () => {});
});

</script>

<style scoped>
/* 全局样式变量 */
:root {
  --el-color-primary: #326dee;
  --el-color-success: #57bc7c;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-info: #909399;

  --primary-gradient: linear-gradient(135deg, #326dee 0%, #5b8af7 100%);
  --success-gradient: linear-gradient(135deg, #57bc7c 0%, #7ed695 100%);
  --map-gradient: linear-gradient(180deg, rgba(50, 109, 238, 0.08) 0%, rgba(50, 109, 238, 0) 100%);

  --card-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  --hover-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  --element-radius: 10px;
  --transition-bezier: cubic-bezier(0.4, 0, 0.2, 1);

  /* 新增颜色变量 */
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #dcdfe6;
  --background-color: #f5f7fa;
  --hover-color: #ecf5ff;
}

/* 全局样式 */
.map-explorer {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-color-primary);
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  color: #303133;
  overflow: hidden;
}

/* 顶部导航 */
.explorer-header {
  height: 64px;
  background: var(--primary-gradient);
  box-shadow: 0 2px 12px rgba(50, 109, 238, 0.15);
  z-index: 20;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  font-size: 1.8rem;
  line-height: 1;
  background: #fff;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s var(--transition-bezier);
  width: 40px;
  height: 40px;
}

.action-btn:hover {
  transform: translateY(-3px);
  background-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 主内容区域 */
.explorer-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  background-color: #f5f7fa;
}

/* 侧边栏 */
.sidebar-panel {
  width: 440px;
  height: 100%;
  position: relative;
  transition: all 0.35s var(--transition-bezier);
  z-index: 10;
  display: flex;
}

.sidebar-collapsed {
  width: 0;
}

.sidebar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(220, 223, 230, 0.5);
  background: linear-gradient(to right, var(--el-color-primary-light-9), white);
}

.sidebar-header .search-input {
  width: 100%;
}

.sidebar-header :deep(.el-input__wrapper) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(220, 223, 230, 0.5) inset;
  border-radius: 12px;
  padding: 4px 14px;
  transition: all 0.3s var(--transition-bezier);
}

.sidebar-header :deep(.el-input__wrapper:hover) {
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--el-color-primary-light-7) inset;
}

.sidebar-header :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1.5px var(--el-color-primary), 0 4px 16px rgba(50, 109, 238, 0.1);
}

.sidebar-header :deep(.el-input__prefix-inner .el-icon) {
  color: var(--el-color-primary);
  font-size: 16px;
}

/* 侧边栏主体内容 */
.sidebar-body {
  flex: 1;
  overflow: hidden;
  padding: 12px 0;
  background-color: var(--background-color);
}

.sidebar-footer {
  padding: 18px 20px;
  border-top: 1px solid #ebeef5;
  background: white;
}

.save-view-btn {
  width: 100%;
  height: 44px;
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.5px;
  border-radius: 8px;
}

.save-view-btn:hover {
  opacity: 0.92;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(50, 109, 238, 0.25);
}

.sidebar-toggle {
  position: absolute;
  right: -22px;
  top: 18px;
  z-index: 15;
}

.toggle-btn {
  background-color: white;
  box-shadow: 3px 0 12px rgba(0, 0, 0, 0.15);
  border: none;
  color: #326dee;
  transition: all 0.3s ease;
  width: 44px;
  height: 44px;
}

.toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.2);
}

/* 搜索输入框 */
.search-input {
  width: 100%;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: var(--element-radius);
  padding: 4px 14px;
  transition: box-shadow 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1.5px var(--el-color-primary);
}

/* 折叠面板 */
.explorer-collapse {
  border: none;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  height: 58px;
  border: none;
  padding: 0 16px;
  background-color: white;
  margin: 0 10px 8px;
  border-radius: 12px;
  transition: all 0.25s var(--transition-bezier);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

:deep(.el-collapse-item__header:hover) {
  background-color: var(--hover-color);
  color: var(--el-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

:deep(.el-collapse-item__arrow) {
  color: var(--text-secondary);
  font-size: 16px;
  transition: transform 0.3s var(--transition-bezier);
}

:deep(.el-collapse-item__header:hover .el-collapse-item__arrow) {
  color: var(--el-color-primary);
}

:deep(.el-collapse-item__wrap) {
  border: none;
  background-color: transparent;
}

:deep(.el-collapse-item__content) {
  padding: 5px 16px 20px;
}

/* 位置筛选容器 */
.filter-container {
  margin-bottom: 20px;
  padding: 0 2px;
}

.filter-input {
  margin-bottom: 16px;
}

.filter-input :deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(220, 223, 230, 0.5) inset;
  border-radius: 10px;
}

.filter-input :deep(.el-input__prefix-inner .el-icon) {
  color: var(--text-secondary);
}

/* 标签样式优化 */
.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.tag-chip {
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 10px;
  background-color: white;
  color: var(--text-regular);
  cursor: pointer;
  transition: all 0.25s var(--transition-bezier);
  user-select: none;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.tag-chip:hover {
  background-color: var(--hover-color);
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-7);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.tag-chip.active {
  background-color: var(--el-color-primary);
  color: white;
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 10px rgba(50, 109, 238, 0.2);
}

/* 位置列表样式优化 */
.location-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  max-height: 450px;
  overflow-y: auto;
  padding: 0 2px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(144, 147, 153, 0.3) transparent;
}

.location-list::-webkit-scrollbar {
  width: 6px;
}

.location-list::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.location-list::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}

.location-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  padding: 16px;
  background-color: white;
  border-radius: var(--element-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s var(--transition-bezier);
  cursor: pointer;
  position: relative;
  border: 1px solid transparent;
  overflow: hidden;
}

.location-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: transparent;
  transition: all 0.25s ease;
}

.location-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-7);
}

.location-item:hover::before {
  background-color: var(--el-color-primary);
}

.location-item.active {
  background-color: var(--hover-color);
  border-color: var(--el-color-primary-light-5);
}

.location-item.active::before {
  background-color: var(--el-color-primary);
}

/* 位置图标优化 */
.location-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: var(--el-color-danger);
  border-radius: 10px;
  color: white;
  box-shadow: 0 3px 8px rgba(50, 109, 238, 0.15);
  transition: all 0.3s var(--transition-bezier);
}

.location-item:hover .location-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(50, 109, 238, 0.25);
}

.location-icon .el-icon {
  font-size: 20px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
}

/* 位置信息样式 */
.location-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.location-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-coords {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: monospace;
}

/* 位置操作按钮 */
.location-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s var(--transition-bezier);
  transform: translateX(10px);
}

.location-item:hover .location-actions {
  visibility: visible;
  opacity: 1;
  transform: translateX(0);
}

.location-actions .el-button {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.25s var(--transition-bezier);
}

.location-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.location-actions .el-button.el-button--primary {
  background: var(--el-color-primary);
}

.location-actions .el-button.el-button--warning {
  background: var(--el-color-warning);
}

.location-actions .el-button.el-button--danger {
  background: var(--el-color-danger);
}

.location-actions .el-icon {
  color: white;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
}

/* 统计信息 */
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 8px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 10px;
  border-top: 1px dashed rgba(220, 223, 230, 0.6);
}

/* 底部按钮区域 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(220, 223, 230, 0.5);
  background: linear-gradient(to left, var(--el-color-primary-light-9), white);
}

.save-view-btn {
  width: 100%;
  height: 44px;
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.5px;
  border-radius: 10px;
  transition: all 0.3s var(--transition-bezier);
  box-shadow: 0 4px 12px rgba(50, 109, 238, 0.2);
}

.save-view-btn:hover {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(50, 109, 238, 0.3);
}

.save-view-btn .el-icon {
  color: white;
  font-size: 16px;
  margin-right: 6px;
}

/* 侧边栏切换按钮 */
.sidebar-toggle {
  position: absolute;
  right: -22px;
  top: 20px;
  z-index: 15;
}

.toggle-btn {
  background-color: white;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.15);
  border: none;
  color: var(--el-color-primary);
  transition: all 0.3s var(--transition-bezier);
  width: 44px;
  height: 44px;
}

.toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 5px 0 20px rgba(0, 0, 0, 0.2);
}

.toggle-btn .el-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

/* 补充样式 - 确保radio按钮和滑块在侧边栏中正确显示 */
.style-selector {
  width: 100%;
  margin-top: 10px;
}

:deep(.el-radio-button__inner) {
  box-shadow: none !important;
  color: var(--text-regular);
  font-weight: 500;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--el-color-primary);
  color: white;
  box-shadow: -1px 0 0 0 var(--el-color-primary) !important;
}

.zoom-slider {
  margin: 20px 0 10px;
}

:deep(.el-empty__description) {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 地图容器 */
.map-container {
  position: relative;
  flex: 1;
  height: 100%;
  background-color: #eee;
  overflow: hidden;
  pointer-events: auto;
}

.map-instance {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

/* 地图控件 */
.map-controls {
  position: absolute;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 5;
}

.zoom-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
}

.control-btn {
  width: 44px;
  height: 44px;
  border: none;
  transition: all 0.25s var(--transition-bezier);
  color: var(--el-color-primary);
  background-color: transparent;
}

.control-btn:hover {
  transform: scale(1.1);
  background-color: #e9f2ff;
}

.location-btn {
  width: 58px;
  height: 58px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  box-shadow: 0 4px 16px rgba(50, 109, 238, 0.35);
  transition: all 0.3s var(--transition-bezier);
  border-radius: 50%;
}

.location-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 25px rgba(50, 109, 238, 0.5);
}

/* 信息卡片 */
.info-card {
  position: absolute;
  right: 30px;
  top: 30px;
  width: 320px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border: none;
  overflow: hidden;
  z-index: 1000; /* 提高z-index确保在地图层之上 */
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.98);
  pointer-events: all; /* 确保元素可以接收所有事件 */
}

/* 文本溢出处理 */
.card-header-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.coordinates {
  background-color: var(--background-color);
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 24px;
  font-family: monospace;
  font-size: 0.95rem;
  border-left: 3px solid var(--el-color-primary);
  word-break: break-all; /* 处理坐标过长的情况 */
  line-height: 1.5;
}

/* 美化卡片头部 */
:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(220, 223, 230, 0.4);
  background: var(--primary-gradient);
  color: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 列表项文本溢出处理 */
.location-name, .poi-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.location-address, .poi-address {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

/* 美化地图控件与交互元素 */
.map-controls {
  position: absolute;
  top: 110px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 5;
}

.map-control-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.25s var(--transition-bezier);
}

.map-control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: white;
  color: var(--el-color-primary);
}

/* 美化侧边栏与主界面布局 */
.map-page {
  display: flex;
  height: 100%;
  background: var(--background-color);
  position: relative;
  overflow: hidden;
}

.sidebar {
  flex: none;
  width: 350px;
  min-width: 350px; /* 确保最小宽度 */
  height: 100%;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s var(--transition-bezier);
  z-index: 10;
}

.sidebar-header {
  padding: 20px;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-btn {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s var(--transition-bezier);
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateX(2px);
}

.sidebar-collapsed {
  width: 60px;
  min-width: 60px;
}

.sidebar-collapsed .toggle-btn:hover {
  transform: translateX(-2px);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.map-container {
  position: relative;
  flex: 1;
  height: 100%;
  background-color: #eee;
  overflow: hidden;
  pointer-events: auto;
}

/* 美化信息窗口 */
:deep(.info-window-content) {
  padding: 12px;
  max-width: 320px;
  font-family: 'Inter var';
}

:deep(.info-window-content h3) {
  color: var(--el-color-primary);
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid var(--hover-color);
  padding-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.info-window-content p) {
  margin: 8px 0;
  color: var(--text-regular);
  font-family: 'Inter var';
  font-size: 14px;
  line-height: 1.5;
}

:deep(.info-coordinates) {
  background-color: var(--background-color);
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 3px solid var(--text-secondary);
  margin: 14px 0;
  font-family: monospace;
  word-break: break-all;
  font-size: 13px;
}

:deep(.info-actions) {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

:deep(.info-button) {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--hover-color);
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-7);
  cursor: pointer;
  font-size: 13px;
  text-align: center;
  transition: all 0.25s var(--transition-bezier);
}

:deep(.info-button:hover) {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary-dark-2);
  transform: translateY(-2px);
}

/* 美化按钮样式 */
.primary-btn {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s var(--transition-bezier);
  font-weight: 500;
}

.primary-btn:hover {
  box-shadow: 0 4px 15px rgba(50, 109, 238, 0.25);
  transform: translateY(-2px);
}

/* 优化搜索区域 */
.search-form {
  padding: 24px;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  border: 1px solid rgba(220, 223, 230, 0.4);
  position: relative;
  transition: all 0.3s var(--transition-bezier);
  overflow: hidden;
}

.search-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, var(--el-color-success), var(--el-color-warning));
}

/* 搜索输入框美化 */
.search-input {
  width: 100%;
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(220, 223, 230, 0.5) inset;
  transition: all 0.3s var(--transition-bezier);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--el-color-primary-light-8) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1.5px var(--el-color-primary), 0 4px 16px rgba(50, 109, 238, 0.1);
}

:deep(.el-input__inner) {
  font-size: 15px;
  color: var(--text-primary);
  padding: 10px 0;
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-secondary);
}

.search-button {
  background: var(--el-color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s var(--transition-bezier);
}

.search-button:hover {
  background: var(--el-color-primary-dark-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(50, 109, 238, 0.2);
}

.search-button:active {
  transform: translateY(1px);
}

/* 位置切换按钮美化 */
.location-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.toggle-button {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.25s var(--transition-bezier);
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
}

.toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.toggle-button.el-button--primary {
  background: var(--primary-gradient);
}

.toggle-button.el-button--default {
  background: white;
  border: 1px solid var(--border-color);
}

/* 搜索选项区域美化 */
.search-options {
  background-color: var(--background-color);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(220, 223, 230, 0.4);
  position: relative;
}

.option-label {
  font-size: 15px;
  color: var(--text-primary);
  display: block;
  margin-bottom: 14px;
  font-weight: 600;
}

.radius-control {
  margin-bottom: 24px;
}

/* 滑块美化 */
:deep(.el-slider__runway) {
  margin: 18px 0;
  height: 6px;
  background-color: rgba(220, 223, 230, 0.4);
}

:deep(.el-slider__bar) {
  background: linear-gradient(to right, var(--el-color-success), var(--el-color-warning));
  height: 6px;
}

:deep(.el-slider__button) {
  width: 20px;
  height: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
}

:deep(.el-slider__button:hover) {
  transform: scale(1.1);
}

:deep(.el-slider__marks-text) {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 搜索过滤器美化 */
.search-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-select {
  width: 160px;
}

:deep(.el-select .el-input__wrapper) {
  padding: 2px 12px;
  border-radius: 10px;
}

:deep(.el-select-dropdown__item) {
  padding: 10px 14px;
  font-size: 14px;
}

:deep(.el-select-dropdown__item.selected) {
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.el-switch) {
  --el-switch-on-color: var(--el-color-success);
}

:deep(.auto-extend-switch .el-switch__label) {
  font-size: 13px;
  color: var(--text-secondary);
}

:deep(.auto-extend-switch .el-switch__label.is-active) {
  color: var(--el-color-success);
}

/* 自动完成建议项美化 */
:deep(.el-autocomplete-suggestion) {
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(220, 223, 230, 0.3);
  overflow: hidden;
  padding: 8px;
}

:deep(.el-scrollbar__view) {
  padding: 6px;
}

.suggestion-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  padding: 12px;
  border-radius: 10px;
  transition: all 0.25s var(--transition-bezier);
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.suggestion-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  width: 40px;
  height: 40px;
  background-color: var(--hover-color);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(50, 109, 238, 0.1);
  transition: all 0.25s var(--transition-bezier);
}

.suggestion-item:hover .suggestion-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(50, 109, 238, 0.15);
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.suggestion-title {
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.suggestion-address {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.suggestion-distance {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-success);
  white-space: nowrap;
  padding: 4px 10px;
  background-color: rgba(87, 188, 124, 0.1);
  border-radius: 12px;
  align-self: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-form {
    padding: 18px;
  margin-bottom: 16px;
  }

  .search-options {
    padding: 16px;
  }

  .search-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .category-select {
    width: 100%;
  }

  .suggestion-item {
    padding: 10px;
    gap: 10px;
  }

  .suggestion-icon {
    width: 32px;
    height: 32px;
  }

  .suggestion-address {
    max-width: 180px;
  }
}

/* 搜索结果区域全新设计 */
.search-results {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
  position: relative;
  border: 1px solid rgba(220, 223, 230, 0.3);
}

/* 结果标题栏 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(to right, rgba(50, 109, 238, 0.05), rgba(50, 109, 238, 0.1));
  border-bottom: 1px solid rgba(220, 223, 230, 0.5);
}

.results-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.results-title .el-icon {
  color: var(--el-color-primary);
  background: rgba(50, 109, 238, 0.1);
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-title span {
  position: relative;
}

.results-title span::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

/* 结果列表 */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 640px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(144, 147, 153, 0.3) transparent;
  padding: 2px;
}

.results-list::-webkit-scrollbar {
  width: 6px;
}

.results-list::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
  transition: background 0.3s;
}

.results-list::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}

/* POI项目卡片 */
.poi-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  padding: 18px;
  background-color: white;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.25s var(--transition-bezier);
  cursor: pointer;
  position: relative;
  /* overflow: hidden; */
}

.poi-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: transparent;
  transition: all 0.25s ease;
}

.poi-item:hover {
  background-color: rgba(240, 249, 242, 0.5);
}

.poi-item:hover::before {
  background-color: var(--el-color-success);
}

.poi-item.active {
  background-color: rgba(240, 249, 242, 0.7);
}

.poi-item.active::before {
  background-color: var(--el-color-success);
}

/* POI图标区域 */
.poi-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.poi-icon .el-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success-gradient);
  border-radius: 12px;
  color: white;
  box-shadow: 0 3px 10px rgba(87, 188, 124, 0.2);
  transition: all 0.3s var(--transition-bezier);
}

.poi-distance {
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: var(--el-color-success);
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(87, 188, 124, 0.15);
  transition: all 0.3s var(--transition-bezier);
}

.poi-item:hover .poi-icon .el-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(87, 188, 124, 0.3);
}

/* POI信息区域 */
.poi-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.poi-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poi-address {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.poi-category {
  font-size: 13px;
  color: var(--text-secondary);
  background-color: var(--background-color);
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  max-width: fit-content;
}

/* POI操作按钮 */
.poi-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s var(--transition-bezier);
}

.poi-item:hover .poi-actions {
  opacity: 1;
  transform: translateX(0);
}

.poi-actions .el-button {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.25s var(--transition-bezier);
}

.poi-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.poi-actions .el-button--primary {
  background: var(--primary-gradient);
}

.poi-actions .el-button--success {
  background: var(--success-gradient);
}

/* 分页控件 */
.results-pagination {
  padding: 16px;
  border-top: 1px solid rgba(220, 223, 230, 0.3);
  display: flex;
  justify-content: center;
  background-color: rgba(245, 247, 250, 0.5);
}

:deep(.el-pagination) {
  --el-pagination-button-bg-color: white;
  --el-pagination-hover-color: var(--el-color-primary);
}

:deep(.el-pagination .el-pager li.is-active) {
  background: var(--el-color-primary);
  color: white;
  font-weight: 600;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 0 8px;
  transition: all 0.2s ease;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background-color: var(--el-color-primary-light-9);
}

/* 无结果状态 */
.empty-results {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}

/* 加载中状态 */
.results-loading {
  padding: 30px 0;
  text-align: center;
}

/* 平板和移动端适配 */
@media (max-width: 768px) {
  .poi-item {
    grid-template-columns: auto 1fr;
    gap: 12px;
    padding: 14px;
  }

  .poi-icon {
    grid-row: span 3;
  }

  .poi-actions {
    grid-column: 2;
    opacity: 1;
    transform: none;
  margin-top: 8px;
}

  .results-list {
    max-height: 480px;
  }
}




/* 快速搜索区域全新设计 */
.quick-search {
  margin-top: 24px;
  margin-bottom: 24px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(220, 223, 230, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s var(--transition-bezier);
}

.quick-search::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, var(--el-color-primary), var(--el-color-success));
}

.quick-search-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  position: relative;
}

.quick-search-label::before {
  content: '🔍';
  font-size: 20px;
  margin-right: 8px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
}

.quick-search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.search-tag {
  padding: 12px 16px;
  background-color: var(--background-color);
  color: var(--text-regular);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s var(--transition-bezier);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  user-select: none;
  transform-origin: center bottom;
}

.search-tag::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.7);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: center;
}

.search-tag:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0) translate(-50%, -50%);
    opacity: 0.5;
  }
  100% {
    transform: scale(40) translate(-50%, -50%);
    opacity: 0;
  }
}

.search-tag:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.search-tag.active {
  transform: translateY(-2px);
  background: var(--el-color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(50, 109, 238, 0.25);
  font-weight: 600;
}

/* 标签图标和颜色自定义 */
.search-tag[data-keyword="餐厅"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="餐厅"]::before { content: '🍽️'; position: absolute; left: 14px; }
.search-tag[data-keyword="餐厅"]:hover { background-color: rgba(245, 108, 108, 0.1); border-color: #F56C6C; color: #F56C6C; }
.search-tag[data-keyword="餐厅"].active { background-color: #F56C6C; }

.search-tag[data-keyword="超市"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="超市"]::before { content: '🛒'; position: absolute; left: 14px; }
.search-tag[data-keyword="超市"]:hover { background-color: rgba(230, 162, 60, 0.1); border-color: #E6A23C; color: #E6A23C; }
.search-tag[data-keyword="超市"].active { background-color: #E6A23C; }

.search-tag[data-keyword="酒店"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="酒店"]::before { content: '🏨'; position: absolute; left: 14px; }
.search-tag[data-keyword="酒店"]:hover { background-color: rgba(64, 158, 255, 0.1); border-color: #409EFF; color: #409EFF; }
.search-tag[data-keyword="酒店"].active { background-color: #409EFF; }

.search-tag[data-keyword="医院"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="医院"]::before { content: '🏥'; position: absolute; left: 14px; }
.search-tag[data-keyword="医院"]:hover { background-color: rgba(245, 108, 108, 0.1); border-color: #F56C6C; color: #F56C6C; }
.search-tag[data-keyword="医院"].active { background-color: #F56C6C; }

.search-tag[data-keyword="咖啡"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="咖啡"]::before { content: '☕'; position: absolute; left: 14px; }
.search-tag[data-keyword="咖啡"]:hover { background-color: rgba(139, 87, 42, 0.1); border-color: #8B572A; color: #8B572A; }
.search-tag[data-keyword="咖啡"].active { background-color: #8B572A; }

.search-tag[data-keyword="地铁"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="地铁"]::before { content: '🚇'; position: absolute; left: 14px; }
.search-tag[data-keyword="地铁"]:hover { background-color: rgba(103, 112, 230, 0.1); border-color: #6770E6; color: #6770E6; }
.search-tag[data-keyword="地铁"].active { background-color: #6770E6; }

.search-tag[data-keyword="公园"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="公园"]::before { content: '🌳'; position: absolute; left: 14px; }
.search-tag[data-keyword="公园"]:hover { background-color: rgba(103, 194, 58, 0.1); border-color: #67C23A; color: #67C23A; }
.search-tag[data-keyword="公园"].active { background-color: #67C23A; }

.search-tag[data-keyword="银行"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="银行"]::before { content: '🏦'; position: absolute; left: 14px; }
.search-tag[data-keyword="银行"]:hover { background-color: rgba(199, 21, 133, 0.1); border-color: #C71585; color: #C71585; }
.search-tag[data-keyword="银行"].active { background-color: #C71585; }

.search-tag[data-keyword="健身房"] { padding-left: 38px; position: relative; }
.search-tag[data-keyword="健身房"]::before { content: '💪'; position: absolute; left: 14px; }
.search-tag[data-keyword="健身房"]:hover { background-color: rgba(255, 152, 0, 0.1); border-color: #FF9800; color: #FF9800; }
.search-tag[data-keyword="健身房"].active { background-color: #FF9800; }

/* 移动端适配 */
@media (max-width: 768px) {
  .quick-search {
    padding: 18px;
    margin-top: 16px;
    margin-bottom: 16px;
  border-radius: 12px;
  }

  .quick-search-label {
  margin-bottom: 16px;
}

  .quick-search-tags {
    gap: 10px;
  }

  .search-tag {
    padding: 10px 10px 10px 34px;
    font-size: 13px;
    border-radius: 10px;
  }

  .search-tag[data-keyword]::before {
    left: 10px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 100;
    transform: translateX(0);
    width: 300px;
    min-width: 300px;
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
    width: 0;
    min-width: 0;
  }

.toggle-btn {
    position: absolute;
    right: -40px;
    top: 20px;
  background-color: white;
    color: var(--el-color-primary);
    border-radius: 0 6px 6px 0;
    box-shadow: 3px 0 10px rgba(0, 0, 0, 0.1);
  }

  .info-card {
    width: 90%;
    max-width: 320px;
    right: 5%;
    top: 20px;
  }

  .map-controls {
    right: 10px;
  }

  .search-form {
    padding: 18px;
    margin-bottom: 16px;
  }

  .search-options {
    padding: 16px;
  }

  .search-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .category-select {
    width: 100%;
  }

  .suggestion-item {
    padding: 10px;
    gap: 10px;
  }

  .suggestion-icon {
    width: 32px;
    height: 32px;
  }

  .suggestion-address {
    max-width: 180px;
  }
}

/* 分类筛选器样式优化 */
.category-select {
  width: 160px;
}

:deep(.el-select .el-input__wrapper) {
  padding: 2px 12px;
  border-radius: 10px;
}

:deep(.el-select__placeholder) {
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.el-select .el-input__inner) {
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.el-select-dropdown) {
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(220, 223, 230, 0.3);
  padding: 8px;
}

:deep(.el-select-dropdown__item) {
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-regular);
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.2s var(--transition-bezier);
}

:deep(.el-select-dropdown__item:hover) {
  background-color: var(--hover-color);
  color: var(--el-color-primary);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: rgba(50, 109, 238, 0.1);
  color: var(--el-color-primary);
  font-weight: 600;
}

/* 扩展范围开关样式 */
:deep(.el-switch) {
  --el-switch-on-color: var(--el-color-success);
}

:deep(.el-switch__label) {
  color: var(--text-regular);
  font-weight: 500;
  font-size: 13px;
}

:deep(.el-switch__label.is-active) {
  color: var(--el-color-success);
}

:deep(.auto-extend-switch) {
  margin-top: 4px;
}

/* 全局图标颜色修复 */
:deep(.el-icon) {
  color: var(--text-regular);
}

:deep(.el-button .el-icon) {
  color: inherit;
}

/* 确保地图控件上的图标颜色可见 */
.map-controls .el-button .el-icon {
  color: var(--text-primary);
  font-size: 18px;
}

.map-controls .el-button.is-plain:hover .el-icon {
  color: var(--el-color-primary);
}

.sidebar-header :deep(.el-input__prefix-inner .el-icon) {
  color: var(--el-color-primary);
  font-size: 16px;
}

.sidebar-toggle .el-icon {
  color: var(--el-color-primary);
  font-size: 18px;
}

.location-icon .el-icon {
  font-size: 20px;
  color: white;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
}

.search-input :deep(.el-input__prefix-inner .el-icon) {
  color: var(--el-color-primary);
}

.search-options .el-icon,
.filter-controls .el-icon {
  color: var(--text-secondary);
  font-size: 16px;
}

.card-actions .el-icon {
  color: white;
}

/* 对话框样式优化，使其不遮挡地图点击 */
.marker-dialog {
  position: absolute !important;
  right: 20px;
  top: 80px;
  margin: 0 !important;
}

.marker-dialog :deep(.el-dialog__header) {
  padding: 16px;
  margin-right: 0;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(to right, var(--el-color-primary-light-8), var(--el-color-primary-light-9));
}

.marker-dialog :deep(.el-dialog__headerbtn) {
  top: 16px;
}

.marker-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.marker-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.marker-dialog :deep(.el-overlay) {
  background-color: transparent;
  pointer-events: none;
}

.marker-dialog :deep(.el-dialog) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  pointer-events: auto;
}

.marker-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  padding-bottom: 6px;
}

.coord-display {
  font-family: monospace;
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
}
</style>

