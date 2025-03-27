<template>
  <div class="map-application">
    <!-- 页面头部与全局控制按钮 -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">
          <span class="title-icon">🌏</span>
          <span class="title-text">探索地图</span>
        </h1>
      </div>
      <div class="header-right">
        <el-button-group class="header-actions">
          <el-button :icon="Refresh" circle @click="refreshMap" class="action-button" />
          <el-button :icon="FullScreen" circle @click="toggleFullscreen" class="action-button" />
          <el-button :icon="Setting" circle @click="showSettings = true" class="action-button" />
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
            class="search-input"
          />
        </div>

        <div class="sidebar-content">
          <!-- 位置面板 -->
          <el-collapse v-model="activeCollapse" class="custom-collapse">
            <el-collapse-item title="保存的位置" name="locations">
              <div class="location-panel">
                <!-- 位置搜索过滤器 -->
                <div class="location-filter">
                  <el-input
                    v-model="locationFilter"
                    placeholder="搜索已保存位置..."
                    prefix-icon="Search"
                    clearable
                    class="location-search"
                  />
                  <div class="filter-tags">
                    <el-tag
                      v-for="(tag, idx) in locationTags"
                      :key="idx"
                      :class="{ 'tag-active': activeLocationTag === tag.value }"
                      @click="toggleLocationTag(tag.value)"
                      size="small"
                      :effect="activeLocationTag === tag.value ? 'dark' : 'plain'"
                    >
                      {{ tag.label }}
                    </el-tag>
                  </div>
                </div>

                <!-- 位置列表 -->
                <template v-if="filteredLocations.length">
                  <div class="location-collection">
                    <div
                      v-for="(location, index) in filteredLocations"
                  :key="index"
                      class="location-card"
                  @click="goToLocation(location)"
                      :class="{ 'location-card-active': isActiveLocation(location) }"
                >
                      <div class="location-card-content">
                        <div class="location-card-icon">
                  <el-icon><Location /></el-icon>
                        </div>
                        <div class="location-card-info">
                          <h4 class="location-card-title">{{ location.name }}</h4>
                          <p class="location-card-coords">{{ formatCoordinates(location) }}</p>
                        </div>
                        <div class="location-card-actions">
                          <el-tooltip content="定位到此位置" placement="top" :show-after="500">
                    <el-button
                      type="primary"
                      circle
                      :icon="Position"
                      @click.stop="goToLocation(location)"
                              class="location-action-btn"
                              size="small"
                    />
                          </el-tooltip>
                          <el-tooltip content="编辑位置" placement="top" :show-after="500">
                    <el-button
                              type="warning"
                              circle
                              :icon="Edit"
                              @click.stop="editMarker(index)"
                              class="location-action-btn"
                      size="small"
                            />
                          </el-tooltip>
                          <el-tooltip content="删除位置" placement="top" :show-after="500">
                            <el-button
                              type="danger"
                      circle
                      :icon="Delete"
                              @click.stop="confirmDeleteLocation(index)"
                              class="location-action-btn"
                              size="small"
                            />
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 空状态 -->
                <div v-else class="location-empty-state">
                  <el-empty
                    description="没有找到位置"
                    :image-size="100"
                  >
                    <template #image>
                      <div class="empty-icon">
                        <el-icon :size="40"><Location /></el-icon>
                      </div>
                    </template>
                    <el-button type="primary" @click="addNewLocation">添加位置</el-button>
                  </el-empty>
                </div>

                <!-- 位置统计 -->
                <div class="location-stats">
                  <p class="stats-text">共 {{ savedLocations.length }} 个位置</p>

                </div>
              </div>
            </el-collapse-item>

            <!-- 周边搜索面板 -->
            <el-collapse-item title="周边搜索" name="nearby-search">
              <div class="nearby-search-panel">
                <!-- 搜索表单 -->
                <div class="search-form">
                  <div class="search-header">
                    <el-autocomplete
                      v-model="poiSearchKeyword"
                      :fetch-suggestions="queryKeywordSuggestions"
                      :trigger-on-focus="false"
                      placeholder="搜索周边地点，如：餐厅、超市..."
                      clearable
                      class="search-keyword-input"
                      @select="handleSuggestionSelect"
                    >
                      <template #suffix>
                        <el-tooltip content="开始搜索" placement="top" :show-after="500">
                          <el-button :icon="Search" @click="searchNearbyPoi" class="search-btn" />
                        </el-tooltip>
                      </template>
                      <template #default="{ item }">
                        <div class="suggestion-item">
                          <div class="suggestion-icon">
                            <el-icon v-if="item.type === 0"><Location /></el-icon>
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

                    <!-- 添加位置切换按钮 -->
                    <el-tooltip :content="isUsingUserLocation ? '当前使用您的位置搜索' : '当前使用地图中心搜索'" placement="top">
                      <el-button
                        :type="isUsingUserLocation ? 'primary' : 'default'"
                        :icon="isUsingUserLocation ? Position : MapLocation"
                        @click="toggleUseCurrentLocation"
                        class="location-toggle-btn"
                      >
                        {{ isUsingUserLocation ? '使用我的位置' : '使用地图中心' }}
                      </el-button>
                    </el-tooltip>
                  </div>

                  <div class="search-options">
                    <div class="search-radius">
                      <span class="option-label">搜索范围：</span>
                      <el-slider
                        v-model="poiSearchRadius"
                        :min="100"
                        :max="1000"
                        :step="100"
                        :marks="{100: '100m', 500: '500m', 1000: '1km'}"
                        class="radius-slider"
                      />
                    </div>

                    <div class="search-filter">
                      <el-select
                        v-model="poiSearchCategory"
                        placeholder="分类筛选"
                        clearable
                        class="category-select"
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
                      />
                    </div>
                  </div>
                </div>

                <!-- 搜索结果 -->
                <div class="search-results" v-if="showSearchResults">
                  <!-- 结果标题和统计 -->
                  <div class="results-header">
                    <h4 class="results-title">
                      <el-icon><Location /></el-icon>
                      <span v-if="poiSearchResults.length">找到 {{ poiSearchResults.length }} 个结果</span>
                      <span v-else>搜索结果</span>
                    </h4>
                    <el-button  @click="clearSearchResults" class="clear-results-btn">
                      <el-icon><Close /></el-icon>
                      清除结果
                    </el-button>
                  </div>

                  <!-- 加载中 -->
                  <div class="results-loading" v-if="isSearching">
                    <el-skeleton :rows="3" animated />
                    <el-skeleton :rows="3" animated />
                  </div>

                  <!-- 结果列表 -->
                  <template v-else-if="poiSearchResults.length">
                    <div class="poi-list">
                      <div
                        v-for="poi in poiSearchResults"
                        :key="poi.id"
                        class="poi-item"
                        :class="{ 'poi-item-active': activePoi === poi.id }"
                        @click="selectPoi(poi)"
                      >
                        <div class="poi-icon">
                          <el-icon><Location /></el-icon>
                          <span class="poi-distance">{{ Math.round(poi._distance) }}m</span>
                        </div>
                        <div class="poi-content">
                          <h5 class="poi-title">{{ poi.title }}</h5>
                          <p class="poi-address" v-if="poi.address">{{ poi.address }}</p>
                          <p class="poi-category">{{ poi.category }}</p>
                        </div>
                        <div class="poi-actions">
                          <el-tooltip content="在地图上查看" placement="top">
                            <el-button
                              type="primary"
                              circle
                              :icon="Position"
                              size="small"
                              @click.stop="goToPoi(poi)"
                              class="poi-action-btn"
                            />
                          </el-tooltip>
                          <el-tooltip content="保存位置" placement="top">
                            <el-button
                              type="success"
                              circle
                              :icon="Plus"
                              size="small"
                              @click.stop="savePoiLocation(poi)"
                              class="poi-action-btn"
                            />
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
                  </template>

                  <!-- 空结果 -->
                  <div class="empty-results" v-else>
                    <el-empty
                      description="未找到结果，请尝试修改关键词或扩大搜索范围"
                      :image-size="80"
                    >
                      <template #image>
                        <div class="empty-search-icon">
                          <el-icon :size="30"><Search /></el-icon>
                        </div>
                      </template>
                    </el-empty>
                  </div>
                </div>

                <!-- 快捷搜索标签 -->
                <div class="quick-search-tags">
                  <span class="tags-label">快速搜索：</span>
                  <div class="tags-container">
                    <el-tag
                      v-for="tag in quickSearchTags"
                      :key="tag"
                      @click="quickSearch(tag)"
                      class="quick-search-tag"
                      effect="plain"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-collapse-item>

            <!-- 地图控制面板 -->
            <el-collapse-item title="地图控制" name="controls">
              <div class="control-section">
                <h4 class="control-title">地图样式</h4>
                <el-radio-group v-model="mapStyle" @change="updateMapStyle" class="map-style-selector">
                  <el-radio-button label="standard">标准</el-radio-button>
                  <el-radio-button label="satellite">卫星</el-radio-button>
                  <el-radio-button label="dark">暗色</el-radio-button>
                </el-radio-group>
              </div>

              <div class="control-section">
                <h4 class="control-title">缩放级别</h4>
                <el-slider v-model="mapZoom" :min="3" :max="20" :step="0.5" show-stops @change="updateZoom" class="custom-slider" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div class="sidebar-footer">
          <el-button type="primary" @click="saveCurrentView" class="save-view-btn">保存当前视图</el-button>
        </div>
      </el-aside>

      <!-- 右侧地图区域 -->
      <el-main class="map-area">
        <!-- 侧边栏切换按钮 -->
        <div class="sidebar-toggle">
          <el-button :icon="showSidebar ? ArrowLeft : ArrowRight" circle @click="showSidebar = !showSidebar" class="toggle-btn" />
        </div>

        <!-- 腾讯地图组件 -->
        <tlbs-map ref="mapRef" api-key="XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS

" :center="mapCenter" :zoom="mapZoom" :control="mapControl" @click="handleMapClick" @map_inited="onMapInited" class="map-instance" >
          <tlbs-multi-marker ref="markerRef" :geometries="geometries" :styles="styles" :options="options" @marker_init="handleMarkerInit" />
          <tlbs-info-window
            ref="infoWindowRef"
            :visible="infoWindowVisible"
            :position="infoWindowPosition"
            :content="infoWindowContent"
            :options="infoWindowOptions"
          />
        </tlbs-map>

        <!-- 快速操作按钮浮层 -->
        <div class="map-actions">
          <el-button-group class="map-control-buttons">
            <el-button :icon="ZoomIn" circle @click="zoomIn" class="map-ctrl-btn" />
            <el-button :icon="ZoomOut" circle @click="zoomOut" class="map-ctrl-btn" />
            <el-button :icon="Position" circle @click="goToUserLocation" class="map-ctrl-btn location-btn" />
          </el-button-group>
        </div>

        <!-- 信息卡片浮层 -->
        <el-card v-if="selectedLocation" class="info-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">选中的位置</span>
              <el-button :icon="Close" @click="selectedLocation = null" class="close-btn" />
            </div>
          </template>
          <div class="location-details">
            <div class="coordinates">
              <strong>坐标：</strong>
              <span class="coordinate-value">{{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}</span>
            </div>
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="saveLocation" class="card-action-btn">
                <el-icon><Location /></el-icon>
                <span>保存位置</span>
              </el-button>
              <el-button type="info" size="small" @click="copyCoordinates" class="card-action-btn">
                <el-icon><Document /></el-icon>
                <span>复制坐标</span>
              </el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <!-- 设置对话框 -->
    <el-dialog v-model="showSettings" title="地图设置" width="500px" class="custom-dialog settings-dialog">
      <el-form label-position="top" class="settings-form">
        <el-form-item label="默认地图中心" class="setting-item">
          <div class="coord-inputs">
            <el-input-number v-model="defaultCenter.lat" :precision="6" :step="0.000001" label="纬度" class="coord-input" />
            <el-input-number v-model="defaultCenter.lng" :precision="6" :step="0.000001" label="经度" class="coord-input" />
          </div>
        </el-form-item>
        <el-form-item label="默认缩放级别" class="setting-item">
          <el-slider v-model="defaultZoom" :min="3" :max="20" :step="0.5" show-stops class="custom-slider" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="saveSettings" class="save-btn">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 标记编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑标记" width="400px" class="custom-dialog marker-edit-dialog">
      <div class="marker-edit-content">
        <div class="location-icon-container">
          <el-icon :size="40" color="#409EFF" class="edit-icon"><Location /></el-icon>
  </div>
        <el-form label-position="top" class="marker-form">
          <el-form-item label="标记名称" required class="marker-name-item">
            <el-input
              v-model="markerName"
              placeholder="输入标记名称"
              maxlength="30"
              show-word-limit
              clearable
              :prefix-icon="Edit"
              class="marker-name-input"
            />
          </el-form-item>
          <el-form-item label="位置坐标" v-if="editingMarker" class="marker-coord-item">
            <div class="coordinates-display">
              <span>纬度: {{ editingMarker.data.lat.toFixed(6) }}</span>
              <span>经度: {{ editingMarker.data.lng.toFixed(6) }}</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="saveMarkerEdit" :disabled="!markerName.trim()" class="save-btn">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增标记对话框 -->
    <el-dialog v-model="showNewMarkerDialog" title="新增位置" width="400px" class="custom-dialog new-marker-dialog">
      <div class="new-marker-content">
        <div class="location-icon-container">
          <el-icon :size="40" color="#67C23A" class="new-icon"><Location /></el-icon>
        </div>
        <el-form label-position="top" class="marker-form">
          <el-form-item label="标记名称" required class="marker-name-item">
            <el-input
              v-model="markerName"
              placeholder="输入标记名称"
              maxlength="30"
              show-word-limit
              clearable
              :prefix-icon="Edit"
              class="marker-name-input"
            />
          </el-form-item>
          <el-form-item label="位置坐标" v-if="selectedLocation" class="marker-coord-item">
            <div class="coordinates-display">
              <span>纬度: {{ selectedLocation.lat.toFixed(6) }}</span>
              <span>经度: {{ selectedLocation.lng.toFixed(6) }}</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewMarkerDialog = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="saveNewMarker" :disabled="!markerName.trim()" class="save-btn">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
  Close,
  Document,
  Edit,
  Plus,
  Van,
  Guide,
  Place,
  MapLocation
} from '@element-plus/icons-vue'

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
  // 初始化标记组件
  setTimeout(() => {
    if (markerRef.value) {
      console.log('标记组件已加载:', markerRef.value)
      // 添加直接点击事件监听
      markerRef.value.on && markerRef.value.on('click', handleMarkerClickDirect)
    }
  }, 1000)
}

// 直接处理标记点击事件（符合腾讯地图API方式）
const handleMarkerClickDirect = (evt) => {
  console.log('标记直接点击:', evt)
  // 阻止事件继续传播
  evt.domEvent && evt.domEvent.stopPropagation && evt.domEvent.stopPropagation()

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

    // 返回false可以阻止事件冒泡到地图
    return false
  }
}

// 处理地图点击
const handleMapClick = (e) => {
  console.log('地图点击:', e)

  // 先隐藏信息窗口
  infoWindowVisible.value = false

  // 设置选中位置
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
        <button class="info-action-edit" onclick="window.dispatchEvent(new CustomEvent('marker-edit', {detail: {index: ${savedIndex}}}))">
          <span class="info-action-icon">✏️</span> 编辑
        </button>
        <button class="info-action-center" onclick="window.dispatchEvent(new CustomEvent('marker-center', {detail: {lat: ${markerInfo.lat}, lng: ${markerInfo.lng}}}))">
          <span class="info-action-icon">🎯</span> 定位
        </button>
        ${savedIndex > -1 ?
          `<button class="info-action-delete" onclick="window.dispatchEvent(new CustomEvent('marker-delete', {detail: {index: ${savedIndex}}}))">
            <span class="info-action-icon">🗑️</span> 删除
          </button>` :
          `<button class="info-action-save" onclick="window.dispatchEvent(new CustomEvent('marker-save', {detail: {lat: ${markerInfo.lat}, lng: ${markerInfo.lng}}}))">
            <span class="info-action-icon">💾</span> 保存
          </button>`
        }
      </div>
    </div>
  `;

  infoWindowPosition.value = position;
  infoWindowContent.value = content;
  infoWindowVisible.value = true;

  // 信息窗口保持显示，不自动关闭
}

const handleMarkerInit = (marker) => {
  console.log('标记初始化:', marker)
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
      searchNearbyPoi();
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
  const searchNearbyPoi = async () => {
    if (!poiSearchKeyword.value.trim() && !poiSearchCategory.value) {
      ElMessage.warning('请输入关键词或选择分类')
      return
    }

    isSearching.value = true
    showSearchResults.value = true

    try {
      // 获取搜索中心点（使用用户当前位置或地图中心）
      const center = isUsingUserLocation.value && userCurrentLocation.value
        ? userCurrentLocation.value
        : mapCenter.value

      // 准备API请求参数
      const autoExtend = poiAutoExtend.value ? 1 : 0
      const keyword = encodeURIComponent(poiSearchKeyword.value.trim())
      const boundary = `nearby(${center.lat},${center.lng},${poiSearchRadius.value},${autoExtend})`
      const filter = poiSearchCategory.value ? `category=${encodeURIComponent(poiSearchCategory.value)}` : ''

      // 构建API URL
      const apiUrl = `/api/map/ws/place/v1/search?key=XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS&keyword=${keyword}&boundary=${boundary}${filter ? '&filter=' + filter : ''}&page_size=10&page_index=${poiCurrentPage.value}&get_subpois=1`

      console.log('发送API请求:', apiUrl);

      try {
        // 使用真实API调用
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 0) {
          // 处理返回结果
          const processedData = data.data.map((item: any) => {
            // 构建符合PoiItem类型的对象
            const poi: PoiItem = {
              id: item.id || `poi_${Date.now()}_${Math.random()}`,
              title: item.title,
              address: item.address || '',
              category: item.category || poiSearchCategory.value || (poiSearchKeyword.value ? poiSearchKeyword.value : '未分类'),
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
            };
            return poi;
          });

          poiSearchResults.value = processedData;
          poiTotalCount.value = data.count;

          // 在地图上显示结果
          showPoiMarkersOnMap(processedData);

          // 如果有结果，绘制搜索半径圆
          if (processedData.length > 0) {
            drawSearchRadiusCircle(center, poiSearchRadius.value);
          }

          const locationSource = isUsingUserLocation.value ? '您的当前位置' : '地图中心'
          ElMessage.success(`在${locationSource}周围找到 ${data.count} 个位置`);
        } else {
          console.error('API返回错误:', data);
          ElMessage.error(`搜索失败: ${data.message || '未知错误'}`);
          poiSearchResults.value = [];
        }
      } catch (apiError) {
        console.error('API请求失败:', apiError);
        ElMessage.error('搜索服务暂时不可用，请稍后重试');
      }
    } catch (error) {
      console.error('搜索失败:', error)
      ElMessage.error('搜索失败，请稍后重试')
      poiSearchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // 查询关键词提示，修改为使用当前位置或地图中心
  const queryKeywordSuggestions = async (queryString: string, cb: (arg: PoiSuggestion[]) => void) => {
    if (queryString.length < 1) {
      cb([]);
      return;
    }

    try {
      // 获取当前中心点（使用用户当前位置或地图中心）
      const center = isUsingUserLocation.value && userCurrentLocation.value
        ? userCurrentLocation.value
        : mapCenter.value;

      // 构建API URL
      const apiUrl = `/api/map/ws/place/v1/suggestion?key=XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS&keyword=${encodeURIComponent(queryString)}&location=${center.lat},${center.lng}&policy=1&page_size=10&output=json`;

      console.log('发送建议API请求:', apiUrl);

      try {
        // 使用真实API调用
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 0 && data.data) {
          // 转换为autocomplete组件所需格式
          const suggestions = data.data.map((item: any) => {
            // 构建符合PoiSuggestion类型的对象
            const suggestion: PoiSuggestion = {
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
            return suggestion;
          });

          cb(suggestions);
        } else {
          console.error('API返回错误:', data);
          cb([]);
        }
      } catch (apiError) {
        console.error('API请求失败:', apiError);
        cb([]);
      }
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
    // 实际应用中应该使用地图API的圆形覆盖物
    console.log(`绘制半径 ${radius}m 的搜索范围圆，中心点: ${center.lat}, ${center.lng}`)

    // 这里仅做模拟
    // 实际实现时，应当创建圆形覆盖物
    // 例如腾讯地图的 new TMap.CircleGeometry() 方法
  }

  // 清除搜索结果
  const clearSearchResults = () => {
    poiSearchResults.value = []
    showSearchResults.value = false
    activePoi.value = null

    // 清除地图上的标记
    clearPoiMarkers()

    // 清除搜索半径圆
    // 实际应用中应该调用地图API移除圆形覆盖物
  }

  // 处理分页变化
  const handlePoiPageChange = (page) => {
    poiCurrentPage.value = page
    searchNearbyPoi()
  }

  // 选择POI
  const selectPoi = (poi) => {
    activePoi.value = poi.id

    // 显示信息窗口
    showPoiInfoWindow(poi)
  }

  // 显示POI信息窗口
  const showPoiInfoWindow = (poi) => {
    const content = `
      <div class="info-window-content">
        <h3>${poi.title}</h3>
        <p>${poi.address || ''}</p>
        <p class="info-coordinates">${poi.location.lat.toFixed(6)}, ${poi.location.lng.toFixed(6)}</p>
        <p><strong>分类：</strong>${poi.category}</p>
        ${poi.tel ? `<p><strong>电话：</strong>${poi.tel}</p>` : ''}
        <div class="info-window-actions">
          <button class="info-action-center" onclick="window.dispatchEvent(new CustomEvent('marker-center', {detail: {lat: ${poi.location.lat}, lng: ${poi.location.lng}}}))">
            <span class="info-action-icon">🎯</span> 定位
          </button>
          <button class="info-action-save" onclick="window.dispatchEvent(new CustomEvent('poi-save', {detail: {poi: '${encodeURIComponent(JSON.stringify(poi))}'}}))">
            <span class="info-action-icon">💾</span> 保存
          </button>
        </div>
      </div>
    `

    showInfoWindow(
      poi.location,
      content
    )
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
    searchNearbyPoi()
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

/* 位置面板样式 */
.location-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.location-filter {
  margin-bottom: 8px;
}

.location-search {
  margin-bottom: 12px;
}

.location-search :deep(.el-input__inner) {
  border-radius: 20px;
  transition: all 0.3s;
}

.location-search :deep(.el-input__inner:focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.filter-tags .el-tag {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 16px;
  padding: 0 12px;
}

.filter-tags .el-tag:hover {
  transform: translateY(-2px);
}

.tag-active {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.location-collection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-card {
  background: white;
  border-radius: 12px;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.location-card::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: transparent;
  transition: all 0.3s;
}

.location-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: #e0e0e0;
}

.location-card:hover::after {
  background: #409EFF;
}

.location-card-active {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.location-card-active::after {
  background: #409EFF;
}

.location-card-content {
  padding: 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.location-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-card-icon .el-icon {
  font-size: 20px;
  color: #409EFF;
}

.location-card-info {
  overflow: hidden;
}

.location-card-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-card-coords {
  margin: 0;
  font-size: 12px;
  color: #909399;
  font-family: 'Consolas', monospace;
}

.location-card-actions {
  display: flex;
  gap: 8px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.location-card:hover .location-card-actions {
  opacity: 1;
}

.location-action-btn {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.location-action-btn:hover {
  transform: scale(1.1);
}

.location-empty-state {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.location-stats {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.add-location-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 20px;
  transition: all 0.3s;
}

.add-location-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* 标记编辑对话框样式 */
.marker-edit-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.marker-edit-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.location-icon {
  margin-bottom: 20px;
  background-color: #f0f9ff;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 100, 250, 0.1);
}

.coordinates-display {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  display: flex;
  justify-content: space-between;
  color: #606266;
}

/* 信息窗口自定义样式 */
:deep(.info-window-content) {
  padding: 8px;
  max-width: 250px;
}

:deep(.info-window-content h3) {
  margin: 0 0 8px 0;
  color: #409EFF;
  font-size: 16px;
}

:deep(.info-window-content p) {
  margin: 4px 0;
  color: #606266;
}

:deep(.info-coordinates) {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  margin-bottom: 12px;
}

:deep(.info-window-actions) {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

:deep(.info-window-actions button) {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  background-color: #f5f7fa;
  color: #303133;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
}

:deep(.info-window-actions button:hover) {
  background-color: #ecf5ff;
}

:deep(.info-action-icon) {
  font-size: 16px;
  margin-bottom: 4px;
}

:deep(.info-action-edit:hover) {
  background-color: #ecf5ff;
  color: #409EFF;
}

:deep(.info-action-center:hover) {
  background-color: #f0f9eb;
  color: #67c23a;
}

:deep(.info-action-delete:hover) {
  background-color: #fef0f0;
  color: #f56c6c;
}

:deep(.info-action-save:hover) {
  background-color: #f0f9eb;
  color: #67c23a;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    width: 100% !important;
    position: absolute;
    z-index: 20;
    height: calc(100vh - 60px);
  }

  .info-card {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }
}

/* 周边搜索面板样式 */
.nearby-search-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-keyword-input {
  flex: 1;
}

.location-toggle-btn {
  white-space: nowrap;
  transition: all 0.3s;
}

.location-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-keyword-input {
  width: 100%;
}

.search-options {
  display: grid;
  gap: 12px;
}

.search-radius {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.radius-slider {
  padding: 0 10px;
}

.search-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.category-select {
  flex: 1;
}

.search-results {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.results-title {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-results-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  transition: all 0.3s;
}

.clear-results-btn:hover {
  color: #f56c6c;
}

.poi-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.poi-list::-webkit-scrollbar {
  width: 6px;
}

.poi-list::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.poi-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.poi-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.poi-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #dcdfe6;
}

.poi-item-active {
  border-color: #67c23a;
  background-color: #f0f9eb;
}

.poi-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.poi-icon .el-icon {
  font-size: 20px;
  color: #67c23a;
  background-color: #f0f9eb;
  border-radius: 50%;
  padding: 6px;
}

.poi-distance {
  font-size: 11px;
  color: #909399;
  background-color: #f5f7fa;
  border-radius: 10px;
  padding: 2px 6px;
  white-space: nowrap;
}

.poi-content {
  overflow: hidden;
}

.poi-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poi-address {
  margin: 0 0 2px 0;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.poi-category {
  margin: 0;
  font-size: 12px;
  color: #909399;
  display: inline-block;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 2px 6px;
}

.poi-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.poi-action-btn {
  transition: all 0.3s;
}

.poi-action-btn:hover {
  transform: scale(1.1);
}

.results-pagination {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.empty-results {
  padding: 16px 0;
}

.empty-search-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  background-color: #f5f7fa;
  border-radius: 50%;
  margin: 0 auto;
  color: #909399;
}

.quick-search-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-label {
  font-size: 13px;
  color: #606266;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-search-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.quick-search-tag:hover {
  transform: scale(1.05);
  color: #67c23a;
}

/* 搜索关键词提示样式 */
.search-keyword-input {
  width: 100%;
}

.search-keyword-input :deep(.el-input__suffix) {
  right: 0;
}

.search-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-right: -12px;
}

.suggestion-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  padding: 8px 0;
  align-items: center;
}

.suggestion-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #f0f9fb;
  border-radius: 50%;
  color: #409EFF;
}

.suggestion-content {
  overflow: hidden;
}

.suggestion-title {
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-address {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-distance {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}
</style>
