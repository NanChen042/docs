<template>
  <div class="map-explorer">
    <!-- 左侧操作面板 -->
    <aside class="sidebar" :class="{ collapsed: !showSidebar }">
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div class="header-brand">
          <div class="brand-logo">🌏</div>
          <h2 class="brand-title">探索地图</h2>
        </div>
        <div class="header-actions">
          <el-button circle text @click="refreshMap" class="header-action-btn">
            <el-icon><Refresh /></el-icon>
          </el-button>
          <el-button
            circle
            text
            @click="showSettings = true"
            class="header-action-btn"
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 侧边栏内容区 -->
      <div class="sidebar-content">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索位置"
            clearable
            @keyup.enter="searchLocation"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 标签页 -->
        <div class="tabs-header">
          <el-radio-group v-model="activeTab" size="large">
            <el-radio-button value="locations">位置</el-radio-button>
            <el-radio-button value="search">搜索</el-radio-button>
            <el-radio-button value="controls">地图控制</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 标签页内容 -->
        <div class="tab-content">
          <!-- 位置标签页 -->
          <div v-if="activeTab === 'locations'" class="locations-panel">
            <div class="locations-header">
              <h3>保存的位置</h3>
              <div class="locations-stats">
                共 {{ savedLocations.length }} 个位置
              </div>
            </div>

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

              <div class="tags-container">
                <div
                  v-for="tag in locationTags"
                  :key="tag.value"
                  :class="[
                    'tag-chip',
                    { active: activeLocationTag === tag.value },
                  ]"
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
                :class="[
                  'location-item',
                  { active: isActiveLocation(location) },
                ]"
                @click="goToLocation(location)"
              >
                <div class="location-icon">
                  <el-icon><Flag /></el-icon>
                </div>
                <div class="location-info">
                  <div class="location-name">{{ location.name }}</div>
                  <div class="location-coordinates">
                    {{ formatCoordinates(location) }}
                  </div>
                </div>
                <div class="location-actions">
                  <el-button
                    circle
                    size="small"
                    type="primary"
                    @click.stop="goToLocation(location)"
                  >
                    <el-icon><Position /></el-icon>
                  </el-button>
                  <el-button
                    circle
                    size="small"
                    type="warning"
                    @click.stop="editMarker(index)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    circle
                    size="small"
                    type="danger"
                    @click.stop="confirmDeleteLocation(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <el-empty description="没有找到位置">
                <el-button type="primary" @click="addNewLocation"
                  >添加位置</el-button
                >
              </el-empty>
            </div>
          </div>

          <!-- 搜索标签页 -->
          <div v-if="activeTab === 'search'" class="search-panel">
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
              </el-autocomplete>

              <div class="search-form-group">
                <el-button
                  :type="isUsingUserLocation ? 'primary' : 'default'"
                  @click="toggleUseCurrentLocation"
                  class="toggle-button"
                >
                  <el-icon v-if="isUsingUserLocation"><Position /></el-icon>
                  <el-icon v-else><MapLocation /></el-icon>
                  {{ isUsingUserLocation ? "使用我的位置" : "使用地图中心" }}
                </el-button>
              </div>

              <div class="search-options">
                <div class="option-group">
                  <label class="option-label">搜索范围:</label>
                  <el-slider
                    v-model="poiSearchRadius"
                    :min="100"
                    :max="1000"
                    :step="100"
                    :marks="{ 100: '100m', 500: '500m', 1000: '1km' }"
                    class="option-slider"
                  />
                </div>

                <div class="search-form-group">
                  <div class="form-control">
                    <el-select
                      v-model="poiSearchCategory"
                      placeholder="分类筛选"
                      clearable
                    >
                      <el-option
                        v-for="item in poiCategories"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                  <div class="form-control">
                    <el-switch
                      v-model="poiAutoExtend"
                      active-text="自动扩大范围"
                      inactive-text="固定范围"
                    />
                  </div>
                </div>
              </div>

              <div class="button-group">
                <el-button type="primary" @click="searchNearbyPoi"
                  >搜索</el-button
                >
                <el-button @click="clearSearchResults">清除</el-button>
              </div>
            </div>

            <!-- 快捷搜索 -->
            <div class="quick-search">
              <div class="quick-title">快速搜索</div>
              <div class="tags-container">
                <div
                  v-for="tag in quickSearchTags"
                  :key="tag"
                  class="tag-chip"
                  @click="quickSearch(tag)"
                >
                  {{ tag }}
                </div>
              </div>
            </div>

            <!-- 搜索结果 -->
            <div class="search-results" v-if="showSearchResults">
              <div class="search-header">
                <h3 v-if="poiTotalCount">找到 {{ poiTotalCount }} 个结果</h3>
                <h3 v-else>搜索结果</h3>
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
              <div v-else-if="poiSearchResults.length" class="location-list">
                <div
                  v-for="poi in poiSearchResults"
                  :key="poi.id"
                  :class="['location-item', { active: activePoi === poi.id }]"
                  @click="selectPoi(poi)"
                >
                  <div class="location-icon">
                    <el-icon><Flag /></el-icon>
                  </div>
                  <div class="location-info">
                    <div class="location-name">{{ poi.title }}</div>
                    <div class="location-coordinates">
                      {{
                        poi.address || "约" + Math.round(poi._distance) + "m"
                      }}
                    </div>
                  </div>
                  <div class="location-actions">
                    <el-button
                      circle
                      size="small"
                      type="primary"
                      @click.stop="goToPoi(poi)"
                    >
                      <el-icon><Position /></el-icon>
                    </el-button>
                    <el-button
                      circle
                      size="small"
                      type="success"
                      @click.stop="savePoiLocation(poi)"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
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
          </div>

          <!-- 地图控制标签页 -->
          <div v-if="activeTab === 'controls'" class="control-panel">
            <div class="control-section">
              <div class="section-title">地图样式</div>
              <el-radio-group
                v-model="mapStyle"
                @change="updateMapStyle"
                class="style-selector"
              >
                <el-radio-button value="standard">标准</el-radio-button>
                <el-radio-button value="satellite">卫星</el-radio-button>
                <el-radio-button value="dark">暗色</el-radio-button>
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
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="sidebar-footer">
        <el-button
          type="primary"
          @click="saveCurrentView"
          class="save-view-btn"
        >
          保存当前视图
        </el-button>
      </div>
    </aside>

    <!-- 侧边栏切换按钮 -->
    <button class="toggle-btn" @click="showSidebar = !showSidebar">
      <el-icon v-if="showSidebar"><ArrowLeft /></el-icon>
      <el-icon v-else><ArrowRight /></el-icon>
    </button>

    <!-- 右侧地图容器 -->
    <div class="map-wrapper">
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
        <tlbs-multi-polygon
          id="search_polygon"
          ref="polygonRef"
          :geometries="circleGeometries"
          :styles="circleStyles"
          @polygon_init="handlePolygonInit"
        />
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
              <span>选中的位置</span>
              <el-button text @click="selectedLocation = null">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="card-content">
            <div class="coordinates">
              <strong>坐标：</strong>
              <span
                >{{ selectedLocation.lat.toFixed(6) }},
                {{ selectedLocation.lng.toFixed(6) }}</span
              >
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

    <!-- 新建标记对话框 -->
    <el-dialog
      v-model="showNewMarkerDialog"
      title="新建标记"
      width="400px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="标记名称" required>
          <el-input v-model="markerName" placeholder="请输入标记名称" />
        </el-form-item>
        <el-form-item label="坐标">
          <div class="coord-display">
            <span>纬度: {{ selectedLocation?.lat.toFixed(6) }}</span>
            <span>经度: {{ selectedLocation?.lng.toFixed(6) }}</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showNewMarkerDialog = false">取消</el-button>
          <el-button type="primary" @click="saveNewMarker">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑标记对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑标记"
      width="400px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="标记名称" required>
          <el-input v-model="markerName" placeholder="请输入标记名称" />
        </el-form-item>
        <el-form-item label="坐标" v-if="editingMarker">
          <div class="coord-display">
            <span>纬度: {{ editingMarker.data?.lat.toFixed(6) }}</span>
            <span>经度: {{ editingMarker.data?.lng.toFixed(6) }}</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveMarkerEdit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
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
  MapLocation,
} from "@element-plus/icons-vue";

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
const isMarkerClick = ref(false);
const lastMarkerClickTime = ref(0);

// 地图实例
const mapRef = ref<any>(null);

// UI状态
const showSidebar = ref(true);
const activeCollapse = ref(["locations", "controls", "nearby-search"]);
const showSettings = ref(false);
const searchQuery = ref("");
const selectedLocation = ref<null | { lat: number; lng: number }>(null);
const editingMarker = ref<null | { index: number; data: any }>(null);
const showEditDialog = ref(false);
const markerName = ref("");
const showNewMarkerDialog = ref(false);

// 地图状态
const mapCenter = ref({ lat: 39.909187, lng: 116.397451 });
const defaultCenter = ref({ lat: 39.98412, lng: 116.307484 });
const mapZoom = ref(12);
const defaultZoom = ref(17.2);
const mapStyle = ref("standard");
const activeTab = ref("locations");
const mapControl = ref({
  scale: true,
  zoom: {
    position: "bottomright",
    showZoom: true,
  },
  rotation: true,
});

// 搜索半径圆
const searchCircleRef = ref<any>(null);
// 圆形覆盖物的几何数据
interface CircleGeometry {
  styleId: string;
  paths: { lat: number; lng: number }[][];
  properties: {
    id: string;
    isSearchCircle: boolean;
  };
}

// 圆形覆盖物的几何数据
const circleGeometries = ref<CircleGeometry[]>([]);

// 标记相关数据
const markerRef = ref<any>(null);
// 多边形覆盖物引用
const polygonRef = ref<any>(null);

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
};

// 样式和几何标记
const styles = ref<MarkerStyles>({
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
});

// 圆形样式
const circleStyles = ref({
  circle: {
    color: "rgba(103, 194, 58, 0.25)", // 填充颜色（稍微增加透明度）
    borderColor: "#67C23A", // 描边颜色
    borderWidth: 3, // 增加边框宽度
    borderStyle: "solid", // 改为实线边框，更加明显
  },
});

const geometries = ref<Geometry[]>([
  {
    styleId: "default",
    position: { lat: 39.98412, lng: 116.307484 },
    properties: { title: "北京市中心", id: 1 },
  },
  {
    styleId: "default",
    position: { lat: 39.916345, lng: 116.397155 },
    properties: { title: "故宫", id: 2 },
  },
]);

const options = ref({
  joinStyle: true,
  enableDragging: false,
  clickable: true,
  cursor: "pointer",
});

// 信息窗口相关
const infoWindowRef = ref<any>(null);
const infoWindowVisible = ref(false);
const infoWindowPosition = ref({ lat: 0, lng: 0 });
const infoWindowContent = ref("");
const infoWindowOptions = ref({
  offset: { x: 0, y: -32 }, // 向上偏移以避免遮挡标记
  closeButton: true,
  enableAnimation: true,
  borderRadius: "8px",
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
});

// 保存的位置
const savedLocations = ref([
  { name: "北京市中心", lat: 39.98412, lng: 116.307484 },
  { name: "故宫", lat: 39.916345, lng: 116.397155 },
]);

// 位置筛选
const locationFilter = ref("");
const activeLocationTag = ref("all");
const locationTags = ref([
  { label: "全部", value: "all" },
  { label: "最近添加", value: "recent" },
  { label: "常用", value: "frequent" },
]);

// 格式化坐标显示
const formatCoordinates = (location) => {
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
};

// 筛选位置列表
const filteredLocations = computed(() => {
  let result = [...savedLocations.value];

  // 根据标签筛选
  if (activeLocationTag.value === "recent") {
    // 获取最近5个添加的位置
    result = result.slice(-5);
  } else if (activeLocationTag.value === "frequent") {
    // 这里可以根据实际逻辑筛选常用位置
    // 简化示例：按字母排序
    result = result.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 根据搜索文本筛选
  if (locationFilter.value) {
    const searchText = locationFilter.value.toLowerCase();
    result = result.filter(
      (loc) =>
        loc.name.toLowerCase().includes(searchText) ||
        formatCoordinates(loc).includes(searchText)
    );
  }

  return result;
});

// 切换位置标签
const toggleLocationTag = (tag) => {
  activeLocationTag.value = tag;
};

// 检查是否为当前活跃位置
const isActiveLocation = (location) => {
  return (
    mapCenter.value.lat === location.lat && mapCenter.value.lng === location.lng
  );
};

// 添加新位置
const addNewLocation = () => {
  // 设置地图中心为添加位置
  if (mapRef.value && mapRef.value.map) {
    const center = mapRef.value.map.getCenter();
    selectedLocation.value = {
      lat: center.lat,
      lng: center.lng,
    };
    saveLocation();
  }
};

// 确认删除位置
const confirmDeleteLocation = (index) => {
  ElMessageBox.confirm("确定要删除这个位置吗？此操作不可恢复。", "删除位置", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      removeLocation(index);
    })
    .catch(() => {
      // 取消操作
    });
};

// 地图初始化完成
const onMapInited = () => {
  ElMessage.success("地图加载成功");
  console.log("地图实例:", mapRef.value?.map);

  // 加载保存的默认设置
  try {
    const savedSettings = localStorage.getItem("mapSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.center) {
        defaultCenter.value = settings.center;
        mapCenter.value = { ...settings.center };
      }
      if (settings.zoom) {
        defaultZoom.value = settings.zoom;
        mapZoom.value = settings.zoom;
      }
      if (settings.style) {
        mapStyle.value = settings.style;
        updateMapStyle(settings.style);
      }
    }

    // 加载保存的位置标记
    const savedLocationData = localStorage.getItem("savedLocations");
    if (savedLocationData) {
      const locations = JSON.parse(savedLocationData);
      if (Array.isArray(locations) && locations.length > 0) {
        savedLocations.value = locations;
        // 重建对应的标记几何数据
        rebuildMarkersFromLocations();
      }
    }
  } catch (error) {
    console.error("加载保存的设置失败:", error);
  }

  // 设置标记和地图事件
  console.log("标记和地图事件已正确设置");
};

// 添加函数：重建标记
const rebuildMarkersFromLocations = () => {
  // 清除现有标记（保留ID 1和2的预设标记）
  const defaultMarkers = geometries.value.filter(
    (m) => m.properties.id === 1 || m.properties.id === 2
  );
  const newGeometries = [...defaultMarkers];

  // 重新添加保存的位置标记
  savedLocations.value.forEach((location, index) => {
    // 跳过已包含在默认标记中的位置
    const isDuplicate = defaultMarkers.some(
      (m) => m.position.lat === location.lat && m.position.lng === location.lng
    );

    if (!isDuplicate) {
      newGeometries.push({
        styleId: "default",
        position: { lat: location.lat, lng: location.lng },
        properties: {
          title: location.name,
          id: defaultMarkers.length + index + 1,
        },
      });
    }
  });

  // 更新几何标记数据
  geometries.value = newGeometries;

  // 刷新标记组件
  setTimeout(() => {
    if (markerRef.value && markerRef.value.refresh) {
      markerRef.value.refresh();
    }
  }, 100);
};

// 直接处理标记点击事件（符合腾讯地图API方式）
const handleMarkerClickDirect = (evt) => {
  console.log("标记直接点击:", evt);

  // 设置标记点击标志和时间戳
  isMarkerClick.value = true;
  lastMarkerClickTime.value = Date.now();

  // 腾讯地图API不支持标准的事件阻止方法
  // 不要尝试调用 stopPropagation 或 preventDefault

  if (evt.geometry && evt.geometry.properties) {
    const title = evt.geometry.properties.title;
    const markerPosition = evt.latLng || evt.geometry.position;

    // 清除选中位置，避免同时显示两个信息框
    selectedLocation.value = null;

    // 查找关联的保存位置
    const locationIndex = savedLocations.value.findIndex(
      (loc) => loc.lat === markerPosition.lat && loc.lng === markerPosition.lng
    );

    const markerInfo = {
      name: title || `标记 #${evt.geometry.properties.id || "未知"}`,
      lat: markerPosition.lat,
      lng: markerPosition.lng,
    };

    // 显示带操作按钮的信息窗口
    showInfoWindowWithActions(
      markerPosition,
      markerInfo,
      locationIndex,
      evt.geometry.properties.id - 1
    );
  }
};

// 处理地图点击
const handleMapClick = (e) => {
  console.log("Map clicked:", e);

  // 检查是否在短时间内已经处理了标记点击（防止双重触发）
  if (isMarkerClick.value && Date.now() - lastMarkerClickTime.value < 300) {
    console.log("忽略地图点击，因为刚刚点击了标记");
    isMarkerClick.value = false;
    return;
  }

  // 必须延迟一点点检查，确保DOM已更新
  setTimeout(() => {
    // 检查点击是否在info-card上
    const infoCard = document.querySelector(".info-card");
    if (infoCard) {
      // 使用事件路径或组合坐标检查
      const rect = infoCard.getBoundingClientRect();
      const clickX = e.pixel.x;
      const clickY = e.pixel.y;

      // 检查点击坐标是否在info-card矩形范围内
      if (
        clickX >= rect.left &&
        clickX <= rect.right &&
        clickY >= rect.top &&
        clickY <= rect.bottom
      ) {
        console.log("Click detected on info-card, ignoring map click");
        return;
      }
    }

    // 先隐藏信息窗口
    infoWindowVisible.value = false;

    // 点击不在card上，正常处理地图点击
    selectedLocation.value = {
      lat: e.latLng.lat,
      lng: e.latLng.lng,
    };

    console.log("Selected location updated:", selectedLocation.value);

    // 如果新增标记对话框已打开，则更新坐标
    if (showNewMarkerDialog.value) {
      console.log("对话框打开状态，更新选中的位置坐标");
    }
  }, 10); // 很短的延迟以确保DOM已更新
};

// 地图控制方法
const zoomIn = () => {
  mapZoom.value += 1;
};

const zoomOut = () => {
  mapZoom.value -= 1;
};

const updateZoom = (value) => {
  mapZoom.value = value;
};

const updateMapStyle = (style) => {
  // 这将取决于实际的地图实现
  console.log("更改地图样式为:", style);
  ElMessage.success(`地图样式已更改为${style}`);
};

const refreshMap = () => {
  // 实际刷新地图，重新初始化组件状态
  if (mapRef.value && mapRef.value.map) {
    // 刷新地图标记
    if (markerRef.value && markerRef.value.refresh) {
      markerRef.value.refresh();
    }

    // 清除搜索圆圈
    circleGeometries.value = [];

    // 重置POI搜索结果
    clearSearchResults();

    // 重置地图视图到默认值
    mapCenter.value = { ...defaultCenter.value };
    mapZoom.value = defaultZoom.value;

    // 刷新地图瓦片
    setTimeout(() => {
      mapRef.value.map.setCenter(mapCenter.value);
      mapRef.value.map.setZoom(mapZoom.value);

      // 同步地图实例中可能的缓存
      if (typeof mapRef.value.map.updateView === "function") {
        mapRef.value.map.updateView();
      }
    }, 100);

    ElMessage.success("地图已刷新");
  } else {
    ElMessage.warning("地图实例未初始化，无法刷新");
  }
};

const toggleFullscreen = () => {
  // 实现将取决于浏览器API
  ElMessage.success("切换全屏模式");
};

const goToUserLocation = () => {
  // 使用地理位置API
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      // 设置地图中心
      mapCenter.value = userLocation;

      // 显示信息窗口
      showInfoWindow(
        userLocation,
        `<div class="info-window-content">
        <h3>您的当前位置</h3>
        <p class="info-coordinates">${userLocation.lat.toFixed(
          6
        )}, ${userLocation.lng.toFixed(6)}</p>
        <div class="info-window-actions">
          <button class="info-action-save" onclick="window.dispatchEvent(new CustomEvent('marker-save', {detail: {lat: ${
            userLocation.lat
          }, lng: ${userLocation.lng}}}))">
            <span class="info-action-icon">💾</span> 保存位置
          </button>
        </div>
      </div>`
      );

      ElMessage.success("已导航到您的当前位置");
    },
    () => {
      ElMessage.error("无法获取您的位置");
    }
  );
};

const goToLocation = (location) => {
  // 设置地图中心
  mapCenter.value = {
    lat: location.lat,
    lng: location.lng,
  };

  // 查找关联的标记
  const markerIndex = geometries.value.findIndex(
    (marker) =>
      marker.position.lat === location.lat &&
      marker.position.lng === location.lng
  );

  // 查找在savedLocations中的索引
  const locationIndex = savedLocations.value.findIndex(
    (loc) => loc.lat === location.lat && loc.lng === location.lng
  );

  // 显示带操作按钮的信息窗口
  showInfoWindowWithActions(
    { lat: location.lat, lng: location.lng },
    { name: location.name, lat: location.lat, lng: location.lng },
    locationIndex,
    markerIndex
  );

  ElMessage.success(`已导航到${location.name}`);
};

const saveLocation = () => {
  if (selectedLocation.value) {
    // 清空标记名称并打开对话框
    markerName.value = "";
    showNewMarkerDialog.value = true;
  }
};

const removeLocation = (index) => {
  if (index >= 0 && index < savedLocations.value.length) {
    const location = savedLocations.value[index];

    // 从列表中移除
    savedLocations.value.splice(index, 1);

    // 保存到本地存储
    try {
      localStorage.setItem(
        "savedLocations",
        JSON.stringify(savedLocations.value)
      );
    } catch (error) {
      console.error("更新位置到本地存储失败:", error);
    }

    // 同步移除地图标记
    const markerIndex = geometries.value.findIndex(
      (marker) =>
        marker.position.lat === location.lat &&
        marker.position.lng === location.lng
    );

    if (markerIndex >= 0) {
      geometries.value.splice(markerIndex, 1);
      // 刷新标记组件
      setTimeout(() => {
        if (markerRef.value && markerRef.value.refresh) {
          markerRef.value.refresh();
        }
      }, 100);
    }

    ElMessage.success("位置已删除");
  }
};

const copyCoordinates = () => {
  if (selectedLocation.value) {
    try {
      const coordText = `${selectedLocation.value.lat.toFixed(
        6
      )}, ${selectedLocation.value.lng.toFixed(6)}`;
      navigator.clipboard
        .writeText(coordText)
        .then(() => {
          ElMessage.success("坐标已复制到剪贴板");
        })
        .catch((err) => {
          console.error("无法复制到剪贴板:", err);
          // 备用方法
          const textArea = document.createElement("textarea");
          textArea.value = coordText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          ElMessage.success("坐标已复制到剪贴板");
        });
    } catch (error) {
      console.error("复制坐标失败:", error);
      ElMessage.error("复制坐标失败");
    }
  }
};

const searchLocation = () => {
  if (searchQuery.value.trim()) {
    // 使用地理编码API
    ElMessage.info(`正在搜索"${searchQuery.value}"`);
  }
};

const saveCurrentView = () => {
  savedLocations.value.push({
    name: `视图 ${savedLocations.value.length + 1}`,
    lat: mapCenter.value.lat,
    lng: mapCenter.value.lng,
  });
  ElMessage.success("当前视图已保存");
};

const saveSettings = () => {
  // 设置当前值
  defaultCenter.value = { ...mapCenter.value };
  defaultZoom.value = mapZoom.value;

  // 保存到本地存储
  try {
    const settings = {
      center: defaultCenter.value,
      zoom: defaultZoom.value,
      style: mapStyle.value,
    };
    localStorage.setItem("mapSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("保存设置到本地存储失败:", error);
  }

  showSettings.value = false;
  ElMessage.success("设置已保存");
};

// 保存新标记
const saveNewMarker = () => {
  if (selectedLocation.value && markerName.value.trim()) {
    const newLocation = {
      name: markerName.value.trim(),
      lat: selectedLocation.value.lat,
      lng: selectedLocation.value.lng,
    };
    savedLocations.value.push(newLocation);

    // 添加标记
    addMarker(selectedLocation.value, newLocation.name);

    // 保存到本地存储
    try {
      localStorage.setItem(
        "savedLocations",
        JSON.stringify(savedLocations.value)
      );
    } catch (error) {
      console.error("保存位置到本地存储失败:", error);
    }

    // 关闭对话框
    showNewMarkerDialog.value = false;
    ElMessage.success("位置已保存");
  } else {
    ElMessage.warning("请输入标记名称");
  }
};

// 添加新标记
const addMarker = (position, title?: string | null) => {
  console.log("添加标记:", position);
  // 克隆数组以触发响应式更新
  const newGeometries = [...geometries.value];
  const markerId = geometries.value.length + 1;
  const markerTitle = title || `位置 ${markerId}`;

  newGeometries.push({
    styleId: "default",
    position: { lat: position.lat, lng: position.lng },
    properties: { title: markerTitle, id: markerId },
  });
  geometries.value = newGeometries;

  // 尝试手动刷新标记
  setTimeout(() => {
    if (markerRef.value && markerRef.value.refresh) {
      markerRef.value.refresh();
    }
  }, 100);

  ElMessage.success("已添加新标记");
};

// 编辑标记
const editMarker = (index) => {
  if (index >= 0 && index < savedLocations.value.length) {
    editingMarker.value = {
      index,
      data: { ...savedLocations.value[index] },
    };
    markerName.value = savedLocations.value[index].name;
    showEditDialog.value = true;
  }
};

// 显示带操作按钮的信息窗口
const showInfoWindowWithActions = (
  position,
  markerInfo,
  savedIndex,
  markerIndex
) => {
  // 确保全局方法注册 - 这是关键修复，防止全局函数丢失
  if (
    !window.handleMarkerEdit ||
    !window.handleMarkerCenter ||
    !window.handleMarkerDelete ||
    !window.handleMarkerSave
  ) {
    window.handleMarkerEdit = (index) => {
      console.log("编辑标记:", index);
      if (index > -1) {
        editMarker(index);
      }
    };

    window.handleMarkerCenter = (lat, lng) => {
      console.log("定位到坐标:", lat, lng);
      mapCenter.value = { lat, lng };

      // 添加视图调整
      mapZoom.value = 16; // 设置更高的缩放级别
    };

    window.handleMarkerDelete = (index) => {
      console.log("删除标记:", index);
      confirmDeleteLocation(index);
    };

    window.handleMarkerSave = (lat, lng) => {
      console.log("保存位置:", lat, lng);
      selectedLocation.value = { lat, lng };
      showNewMarkerDialog.value = true;
    };
  }

  const content = `
    <div class="info-window-content">
      <h3>${markerInfo.name}</h3>
      <p class="info-coordinates">${markerInfo.lat.toFixed(
        6
      )}, ${markerInfo.lng.toFixed(6)}</p>
      <div class="info-window-actions">
        <button class="info-action-edit" onclick="window.handleMarkerEdit(${savedIndex})">
          <span class="info-action-icon">✏️</span> 编辑
        </button>
        <button class="info-action-center" onclick="window.handleMarkerCenter(${
          markerInfo.lat
        }, ${markerInfo.lng})">
          <span class="info-action-icon">🎯</span> 定位
        </button>
        ${
          savedIndex > -1
            ? `<button class="info-action-delete" onclick="window.handleMarkerDelete(${savedIndex})">
            <span class="info-action-icon">🗑️</span> 删除
          </button>`
            : `<button class="info-action-save" onclick="window.handleMarkerSave(${markerInfo.lat}, ${markerInfo.lng})">
            <span class="info-action-icon">💾</span> 保存
          </button>`
        }
      </div>
    </div>
  `;

  infoWindowPosition.value = position;
  infoWindowContent.value = content;
  infoWindowVisible.value = true;
};

const handleMarkerInit = (marker) => {
  console.log("标记初始化:", marker);

  // 在标记初始化后设置点击事件
  if (marker && marker.on) {
    try {
      // 使用原生方法绑定事件
      marker.on("click", handleMarkerClickDirect);
      console.log("已绑定标记点击事件");
    } catch (error) {
      console.error("绑定标记点击事件失败:", error);
    }
  }
};

// 显示信息窗口
const showInfoWindow = (position, content) => {
  infoWindowPosition.value = position;
  infoWindowContent.value = content;
  infoWindowVisible.value = true;
};

// 保存标记编辑
const saveMarkerEdit = () => {
  if (editingMarker.value && markerName.value.trim()) {
    // 更新保存的位置名称
    savedLocations.value[editingMarker.value.index].name = markerName.value;

    const position = savedLocations.value[editingMarker.value.index];

    // 保存到本地存储
    try {
      localStorage.setItem(
        "savedLocations",
        JSON.stringify(savedLocations.value)
      );

      // 更新地图标记
      const markerIndex = geometries.value.findIndex(
        (marker) =>
          marker.position.lat === position.lat &&
          marker.position.lng === position.lng
      );

      if (markerIndex >= 0) {
        geometries.value[markerIndex].properties.title = markerName.value;
        // 刷新标记组件
        setTimeout(() => {
          if (markerRef.value && markerRef.value.refresh) {
            markerRef.value.refresh();
          }
        }, 100);
      }
    } catch (error) {
      console.error("更新位置到本地存储失败:", error);
    }

    // 关闭编辑对话框
    showEditDialog.value = false;

    // 显示信息窗口
    showInfoWindow(
      { lat: position.lat, lng: position.lng },
      `<div class="info-window-content">
        <h3>${markerName.value}</h3>
        <p>位置已更新</p>
        <p class="info-coordinates">${position.lat.toFixed(
          6
        )}, ${position.lng.toFixed(6)}</p>
      </div>`
    );
  }
};

// 周边搜索相关状态
const poiSearchKeyword = ref("");
const poiSearchRadius = ref(500);
const poiSearchCategory = ref("");
const poiAutoExtend = ref(true);
const poiSearchResults = ref<PoiItem[]>([]);
const showSearchResults = ref(false);
const isSearching = ref(false);
const poiTotalCount = ref(0);
const poiCurrentPage = ref(1);
const activePoi = ref<string | null>(null);

// POI分类
const poiCategories = ref([
  { label: "餐饮服务", value: "餐饮服务" },
  { label: "购物", value: "购物" },
  { label: "酒店", value: "酒店" },
  { label: "公交车站", value: "公交车站" },
  { label: "地铁站", value: "地铁站" },
  { label: "医疗", value: "医疗" },
  { label: "教育", value: "教育" },
  { label: "景点", value: "景点" },
  { label: "金融", value: "金融" },
  { label: "运动健身", value: "运动健身" },
]);

// 快捷搜索标签
const quickSearchTags = ref([
  "餐厅",
  "超市",
  "酒店",
  "医院",
  "咖啡",
  "地铁",
  "公园",
  "银行",
  "健身房",
]);

// 用户当前位置
const userCurrentLocation = ref<null | { lat: number; lng: number }>(null);
const isUsingUserLocation = ref(false);

// 获取用户当前位置
const getCurrentLocation = () => {
  ElMessage.info("正在获取您的位置...");
  return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        userCurrentLocation.value = userLocation;
        ElMessage.success("已获取到您的位置");
        resolve(userLocation);
      },
      (error) => {
        ElMessage.error(`无法获取您的位置: ${error.message}`);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// 修改周边搜索，使用当前位置
const toggleUseCurrentLocation = async () => {
  try {
    if (!userCurrentLocation.value) {
      // 如果还没有获取过位置，先获取
      await getCurrentLocation();
    }

    isUsingUserLocation.value = !isUsingUserLocation.value;

    if (isUsingUserLocation.value) {
      ElMessage.success("已切换到使用您的当前位置进行搜索");
    } else {
      ElMessage.success("已切换到使用地图中心位置进行搜索");
    }
  } catch (error) {
    console.error("切换位置失败:", error);
    isUsingUserLocation.value = false;
  }
};

// 定义事件处理函数（需要在setup顶层作用域内）
const markerEditHandler = ((e: CustomEvent) => {
  const { index } = e.detail as { index: number };
  if (index > -1) {
    editMarker(index);
  }
}) as EventListener;

const markerCenterHandler = ((e: CustomEvent) => {
  const { lat, lng } = e.detail as { lat: number; lng: number };
  mapCenter.value = { lat, lng };
}) as EventListener;

const markerDeleteHandler = ((e: CustomEvent) => {
  const { index } = e.detail as { index: number };
  if (index > -1) {
    removeLocation(index);
  }
}) as EventListener;

const markerSaveHandler = ((e: CustomEvent) => {
  const { lat, lng } = e.detail as { lat: number; lng: number };
  selectedLocation.value = { lat, lng };
  saveLocation();
}) as EventListener;

const poiSaveHandler = ((e: CustomEvent) => {
  try {
    const poiData = JSON.parse(decodeURIComponent(e.detail.poi));
    savePoiLocation(poiData);
  } catch (error) {
    console.error("解析POI数据失败:", error);
  }
}) as EventListener;

// 在组件挂载时尝试获取用户位置
onMounted(async () => {
  // 注册全局事件处理函数，用于信息窗口按钮
  window.handleMarkerEdit = (index) => {
    console.log("编辑标记:", index);
    if (index > -1) {
      editMarker(index);
    }
  };

  window.handleMarkerCenter = (lat, lng) => {
    console.log("定位到坐标:", lat, lng);
    mapCenter.value = { lat, lng };

    // 添加视图调整
    mapZoom.value = 16; // 设置更高的缩放级别
  };

  window.handleMarkerDelete = (index) => {
    console.log("删除标记:", index);
    confirmDeleteLocation(index);
  };

  window.handleMarkerSave = (lat, lng) => {
    console.log("保存位置:", lat, lng);
    selectedLocation.value = { lat, lng };
    showNewMarkerDialog.value = true;
  };

  window.handlePoiSave = (poiStr) => {
    console.log("保存POI:", poiStr);
    try {
      const poiData = JSON.parse(decodeURIComponent(poiStr));
      savePoiLocation(poiData);
    } catch (error) {
      console.error("解析POI数据失败:", error);
    }
  };

  // 添加事件监听器
  window.addEventListener("marker-edit", markerEditHandler);
  window.addEventListener("marker-center", markerCenterHandler);
  window.addEventListener("marker-delete", markerDeleteHandler);
  window.addEventListener("marker-save", markerSaveHandler);
  window.addEventListener("poi-save", poiSaveHandler);

  // 尝试获取用户位置
  try {
    await getCurrentLocation();
  } catch (error) {
    console.error("获取用户位置失败:", error);
  }
});

// 计算两点间的距离（km）
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371; // 地球半径（km）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
  console.log("选择了建议项:", item);

  // 如果有位置信息，将地图中心设置到该位置
  if (item.location) {
    mapCenter.value = {
      lat: item.location.lat,
      lng: item.location.lng,
    };

    // 显示标记和信息窗口
    const poi = {
      id: item.id || `suggestion_${Date.now()}`,
      title: item.title,
      address: item.address || "",
      location: item.location,
      category: item.category || "",
      _distance: item._distance || 0,
      type: item.type,
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
    styleId: "poi",
    position: { lat: poi.location.lat, lng: poi.location.lng },
    properties: {
      title: poi.title,
      id: poi.id,
      poiId: poi.id,
      isPoi: true,
    },
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
    ElMessage.warning("请输入关键词或选择分类");
    return;
  }

  isSearching.value = true;
  showSearchResults.value = true;

  // 清除之前可能存在的JSONP脚本
  const oldScript = document.getElementById("map-jsonp");
  if (oldScript) document.body.removeChild(oldScript);

  // 使用关键词参数或当前输入框的值
  const searchKeyword = keyword || poiSearchKeyword.value.trim();

  // 生成唯一的回调函数名
  const callbackName = "mapCallback_" + Date.now();

  // 构建JSONP URL
  const center =
    isUsingUserLocation.value && userCurrentLocation.value
      ? userCurrentLocation.value
      : mapCenter.value;

  const autoExtend = poiAutoExtend.value ? 1 : 0;
  const encodedKeyword = encodeURIComponent(searchKeyword);
  const boundary = `nearby(${center.lat},${center.lng},${poiSearchRadius.value},${autoExtend})`;
  const filter = poiSearchCategory.value
    ? `&filter=category=${encodeURIComponent(poiSearchCategory.value)}`
    : "";

  const apiUrl = `https://apis.map.qq.com/ws/place/v1/search?key=XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS&keyword=${encodedKeyword}&boundary=${boundary}${filter}&page_size=10&page_index=${poiCurrentPage.value}&get_subpois=1&output=jsonp&callback=${callbackName}`;

  // 创建脚本元素
  const script = document.createElement("script");
  script.id = "map-jsonp";
  script.src = apiUrl;

  // 处理返回数据
  window[callbackName] = (data) => {
    console.log(data);

    isSearching.value = false;
    if (data.status === 0) {
      // 处理数据...
      poiSearchResults.value = data.data.map((item) => {
        // 构建符合PoiItem类型的对象
        return {
          id: item.id || `poi_${Date.now()}_${Math.random()}`,
          title: item.title,
          address: item.address || "",
          category:
            item.category ||
            poiSearchCategory.value ||
            (searchKeyword ? searchKeyword : "未分类"),
          tel: item.tel || "",
          type: item.type || 0,
          location: item.location || { lat: 0, lng: 0 },
          _distance: item._distance || 0,
          ad_info: item.ad_info || {
            adcode: 0,
            province: "",
            city: "",
            district: "",
          },
        };
      });

      poiTotalCount.value = data.count;
      ElMessage.success(`搜索到 ${data.count} 个结果`);

      // 绘制搜索范围圆
      if (poiSearchResults.value.length > 0) {
        drawSearchRadiusCircle(center, poiSearchRadius.value);

        // 确保圆形覆盖物在短暂延迟后再次尝试更新
        setTimeout(() => {
          if (
            polygonRef.value &&
            typeof polygonRef.value.refresh === "function"
          ) {
            polygonRef.value.refresh();
            console.log("强制刷新圆形覆盖物");
          }
        }, 300);

        // 绘制POI标记
        showPoiMarkersOnMap(poiSearchResults.value);

        // 添加视图自动调整逻辑
        adjustMapView(center, poiSearchRadius.value, poiSearchResults.value);
      }
    } else {
      ElMessage.error(`搜索失败: ${data.message}`);
    }

    // 清理回调函数
    setTimeout(() => {
      delete window[callbackName];
    }, 500);
  };

  document.body.appendChild(script);
};

// 添加新的视图调整函数
const adjustMapView = (center, radius, results) => {
  // 如果没有结果，只展示搜索范围圆
  if (!results || results.length === 0) {
    mapCenter.value = center;

    // 根据半径设置缩放级别
    if (radius <= 500) {
      mapZoom.value = 15; // 小范围搜索，设置更高缩放级别
    } else if (radius <= 1000) {
      mapZoom.value = 14; // 中等范围
    } else {
      mapZoom.value = 13; // 大范围
    }

    return;
  }

  // 如果有结果，计算包含所有结果的视图范围
  let minLat = center.lat;
  let maxLat = center.lat;
  let minLng = center.lng;
  let maxLng = center.lng;

  // 确保搜索范围圆在视图内
  // 计算圆在地图上的近似经纬度范围
  const radiusInDegrees = radius / 111000; // 1度约等于111km
  minLat = Math.min(minLat, center.lat - radiusInDegrees);
  maxLat = Math.max(maxLat, center.lat + radiusInDegrees);
  // 经度需要根据纬度调整
  const lngOffset = radiusInDegrees / Math.cos((center.lat * Math.PI) / 180);
  minLng = Math.min(minLng, center.lng - lngOffset);
  maxLng = Math.max(maxLng, center.lng + lngOffset);

  // 考虑所有POI位置
  results.forEach((poi) => {
    if (poi.location) {
      minLat = Math.min(minLat, poi.location.lat);
      maxLat = Math.max(maxLat, poi.location.lat);
      minLng = Math.min(minLng, poi.location.lng);
      maxLng = Math.max(maxLng, poi.location.lng);
    }
  });

  // 设置地图中心到范围的中心点
  mapCenter.value = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };

  // 设置适当的缩放级别
  // 这是一个简化的计算方法
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  if (maxDiff < 0.01) {
    mapZoom.value = 16; // 非常小的区域
  } else if (maxDiff < 0.05) {
    mapZoom.value = 14; // 小区域
  } else if (maxDiff < 0.1) {
    mapZoom.value = 13; // 中等区域
  } else {
    mapZoom.value = 12; // 大区域
  }

  console.log(
    `调整地图视图 - 中心: ${mapCenter.value.lat}, ${mapCenter.value.lng} 缩放级别: ${mapZoom.value}`
  );
};

// 查询关键词提示，修改为使用当前位置或地图中心
const queryKeywordSuggestions = async (
  queryString: string,
  cb: (arg: PoiSuggestion[]) => void
) => {
  if (queryString.length < 1) {
    cb([]);
    return;
  }

  try {
    // 清除之前可能存在的JSONP脚本
    const oldScript = document.getElementById("suggestion-jsonp");
    if (oldScript) document.body.removeChild(oldScript);

    // 获取当前中心点（使用用户当前位置或地图中心）
    const center =
      isUsingUserLocation.value && userCurrentLocation.value
        ? userCurrentLocation.value
        : mapCenter.value;

    // 生成唯一的回调函数名
    const callbackName = "suggestionCallback_" + Date.now();

    // 构建JSONP URL
    const apiUrl = `https://apis.map.qq.com/ws/place/v1/suggestion?key=XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS&keyword=${encodeURIComponent(
      queryString
    )}&location=${center.lat},${
      center.lng
    }&policy=1&page_size=10&output=jsonp&callback=${callbackName}`;

    console.log("发送建议API请求:", apiUrl);

    // 创建脚本元素
    const script = document.createElement("script");
    script.id = "suggestion-jsonp";
    script.src = apiUrl;

    // 处理返回数据
    window[callbackName] = (data) => {
      if (data.status === 0 && data.data) {
        // 转换为autocomplete组件所需格式
        const suggestions = data.data.map((item: any) => {
          // 构建符合PoiSuggestion类型的对象
          return {
            id: item.id || `suggestion_${Date.now()}_${Math.random()}`,
            title: item.title,
            address: item.address || "",
            value: item.title,
            location: item.location || { lat: 0, lng: 0 },
            _distance: item._distance || 0,
            type: item.type || 0,
            category: item.category || "",
            ad_info: item.ad_info || {
              adcode: 0,
              province: "",
              city: "",
              district: "",
            },
          };
        });

        cb(suggestions);
      } else {
        console.error("API返回错误:", data);
        cb([]);
      }

      // 清理回调函数
      delete window[callbackName];
    };

    // 添加脚本到文档
    document.body.appendChild(script);
  } catch (error) {
    console.error("获取关键词提示失败:", error);
    cb([]);
  }
};

// 在地图上显示POI标记
const showPoiMarkersOnMap = (pois: PoiItem[]) => {
  // 清除之前的POI标记
  clearPoiMarkers();

  // 添加新的POI标记
  const newGeometries: Geometry[] = [...geometries.value];

  pois.forEach((poi, index) => {
    newGeometries.push({
      styleId: "poi",
      position: { lat: poi.location.lat, lng: poi.location.lng },
      properties: {
        title: poi.title,
        id: `poi_${index}`,
        poiId: poi.id,
        isPoi: true,
      },
    });
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

// 清除POI标记
const clearPoiMarkers = () => {
  // 过滤掉POI标记
  geometries.value = geometries.value.filter((geo) => !geo.properties.isPoi);
};

// 绘制搜索半径圆
const drawSearchRadiusCircle = (center, radius) => {
  try {
    // 清除之前的圆形
    circleGeometries.value = [];

    // 确保地图实例存在
    if (!mapRef.value || !mapRef.value.map) {
      console.error("地图实例不存在，无法绘制圆形");
      return;
    }

    // 获取腾讯地图实例，用于坐标转换
    const map = mapRef.value.map;

    // 生成圆形的点集合
    const points: { lat: number; lng: number }[] = [];
    const lat = center.lat;
    const lng = center.lng;

    // 计算合适的点数来保证圆形平滑
    const segments = 36;

    // 将米转换为度的近似公式
    // 1度纬度约等于111.32km
    const radiusLat = radius / 111320; // 半径（度纬度）

    // 根据纬度调整经度转换比例
    const radiusLng = radiusLat / Math.cos((lat * Math.PI) / 180);

    // 生成圆形的点坐标
    for (let i = 0; i <= segments; i++) {
      const angle = Math.PI * 2 * (i / segments);
      const dx = Math.cos(angle) * radiusLng;
      const dy = Math.sin(angle) * radiusLat;

      points.push({
        lat: lat + dy,
        lng: lng + dx,
      });
    }

    // 确保首尾相连
    if (
      points.length > 0 &&
      (points[0].lat !== points[points.length - 1].lat ||
        points[0].lng !== points[points.length - 1].lng)
    ) {
      points.push({ ...points[0] });
    }

    // 创建圆形几何数据
    circleGeometries.value = [
      {
        styleId: "circle",
        paths: [points],
        properties: {
          id: "search_circle",
          isSearchCircle: true,
        },
      },
    ];

    console.log(
      `已绘制半径 ${radius}m 的搜索范围圆，中心点: ${center.lat}, ${center.lng}, 点数: ${points.length}`
    );

    // 如果多边形组件已初始化，手动触发更新
    if (mapRef.value && mapRef.value.getMapInstance) {
      setTimeout(() => {
        console.log("尝试刷新圆形覆盖物");
        const polygonInstance = mapRef.value
          .getMapInstance()
          .getOverlayById("search_polygon");
        if (polygonInstance && polygonInstance.updateGeometries) {
          polygonInstance.updateGeometries(circleGeometries.value);
        }
      }, 100);
    }
  } catch (error) {
    console.error("绘制搜索范围圆失败:", error);
  }
};

// 清除搜索结果
const clearSearchResults = () => {
  poiSearchResults.value = [];
  showSearchResults.value = false;
  activePoi.value = null;

  // 清除地图上的标记
  clearPoiMarkers();

  // 清除搜索半径圆
  circleGeometries.value = [];
};

// 处理分页变化
const handlePoiPageChange = (page) => {
  poiCurrentPage.value = page;
  searchNearbyPoi(poiSearchKeyword.value);
};

// 选择POI
const selectPoi = (poi) => {
  activePoi.value = poi.id;

  // 显示信息窗口
  showPoiInfoWindow(poi);
};

// 显示POI信息窗口
const showPoiInfoWindow = (poi) => {
  // 确保全局方法注册 - 这是关键修复，防止全局函数丢失
  if (!window.handleMarkerCenter || !window.handlePoiSave) {
    window.handleMarkerCenter = (lat, lng) => {
      console.log("定位到坐标:", lat, lng);
      mapCenter.value = { lat, lng };

      // 添加视图调整
      mapZoom.value = 16; // 设置更高的缩放级别
    };

    window.handlePoiSave = (poiStr) => {
      try {
        const poiData = JSON.parse(decodeURIComponent(poiStr));
        savePoiLocation(poiData);
      } catch (error) {
        console.error("解析POI数据失败:", error);
      }
    };
  }

  const content = `
      <div class="info-window-content">
        <h3>${poi.title}</h3>
        <p>${poi.address || ""}</p>
        <p class="info-coordinates">${poi.location.lat.toFixed(
          6
        )}, ${poi.location.lng.toFixed(6)}</p>
        <p><strong>分类：</strong>${poi.category}</p>
        ${poi.tel ? `<p><strong>电话：</strong>${poi.tel}</p>` : ""}
        <div class="info-window-actions">
          <button class="info-action-center" onclick="window.handleMarkerCenter(${
            poi.location.lat
          }, ${poi.location.lng})">
            <span class="info-action-icon">🎯</span> 定位
          </button>
          <button class="info-action-save" onclick="window.handlePoiSave('${encodeURIComponent(
            JSON.stringify(poi)
          )}')">
            <span class="info-action-icon">💾</span> 保存
          </button>
        </div>
      </div>
    `;

  showInfoWindow(poi.location, content);
};

// 定位到POI
const goToPoi = (poi) => {
  mapCenter.value = {
    lat: poi.location.lat,
    lng: poi.location.lng,
  };

  // 显示信息窗口
  showPoiInfoWindow(poi);

  // 设置激活POI
  activePoi.value = poi.id;
};

// 保存POI位置
const savePoiLocation = (poi) => {
  // 打开保存对话框
  selectedLocation.value = {
    lat: poi.location.lat,
    lng: poi.location.lng,
  };

  // 预填充名称
  markerName.value = poi.title;

  // 显示对话框
  showNewMarkerDialog.value = true;
};

// 快速搜索
const quickSearch = (keyword) => {
  // 设置标签页到搜索
  activeTab.value = "search";

  // 设置搜索关键词
  poiSearchKeyword.value = keyword;

  // 执行搜索
  searchNearbyPoi(keyword);
};

// 处理标记点击事件
const handleMarkerClick = (evt) => {
  // 打印信息，便于调试
  console.log("标记点击:", evt);

  // 设置标记点击标志和时间戳
  isMarkerClick.value = true;
  lastMarkerClickTime.value = Date.now();

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
};

// 组件卸载时清除全局事件监听
onUnmounted(() => {
  // 清除全局事件处理函数
  if ("handleMarkerEdit" in window) (window as any).handleMarkerEdit = null;
  if ("handleMarkerCenter" in window) (window as any).handleMarkerCenter = null;
  if ("handleMarkerDelete" in window) (window as any).handleMarkerDelete = null;
  if ("handleMarkerSave" in window) (window as any).handleMarkerSave = null;
  if ("handlePoiSave" in window) (window as any).handlePoiSave = null;

  // 移除事件监听器 - 使用之前定义的相同引用
  window.removeEventListener("marker-edit", markerEditHandler);
  window.removeEventListener("marker-center", markerCenterHandler);
  window.removeEventListener("marker-delete", markerDeleteHandler);
  window.removeEventListener("marker-save", markerSaveHandler);
  window.removeEventListener("poi-save", poiSaveHandler);
});

// 添加处理多边形初始化的方法
const handlePolygonInit = (polygon) => {
  console.log("圆形覆盖物初始化:", polygon);
  // 确保正确渲染多边形
  if (
    polygon &&
    polygon.updateGeometries &&
    circleGeometries.value.length > 0
  ) {
    setTimeout(() => {
      polygon.updateGeometries(circleGeometries.value);
    }, 200);
  }
};
</script>

<style>
@import "../../assets/styles/map-explorer.css";
</style>
