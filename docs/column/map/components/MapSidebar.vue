<template>
  <aside class="sidebar" :class="{ collapsed: !showSidebar }">
    <!-- 侧边栏头部 -->
    <SidebarHeader
      @refresh="handleRefresh"
      @settings="handleSettings"
    />

    <!-- 侧边栏内容区 -->
    <div class="sidebar-content">
      <!-- 搜索栏 -->
      <SearchBar
        :model-value="searchQuery"
        @update:model-value="searchQuery = $event"
        @search="handleSearch"
      />

      <!-- 标签页导航 -->
      <TabNavigation
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />

      <!-- 标签页内容 -->
      <div class="tab-content">
        <!-- 位置标签页 -->
        <LocationsPanel
          v-if="activeTab === 'locations'"
          :locations="filteredLocations"
          :filter="locationFilter"
          :active-tag="activeLocationTag"
          :tags="locationTags"
          @filter-change="handleFilterChange"
          @tag-change="handleTagChange"
          @location-click="handleLocationClick"
          @location-edit="handleLocationEdit"
          @location-delete="handleLocationDelete"
          @add-location="handleAddLocation"
        />

        <!-- 搜索标签页 -->
        <SearchPanel
          v-if="activeTab === 'search'"
          :keyword="poiSearchKeyword"
          :radius="poiSearchRadius"
          :category="poiSearchCategory"
          :auto-extend="poiAutoExtend"
          :is-using-user-location="isUsingUserLocation"
          :categories="poiCategories"
          :quick-tags="quickSearchTags"
          :search-results="poiSearchResults"
          :is-searching="isSearching"
          :total-count="poiTotalCount"
          :current-page="poiCurrentPage"
          :show-results="showSearchResults"
          @keyword-change="handleKeywordChange"
          @radius-change="handleRadiusChange"
          @category-change="handleCategoryChange"
          @auto-extend-change="handleAutoExtendChange"
          @location-mode-toggle="handleLocationModeToggle"
          @search="handlePoiSearch"
          @clear-results="handleClearResults"
          @quick-search="handleQuickSearch"
          @poi-select="handlePoiSelect"
          @poi-goto="handlePoiGoto"
          @poi-save="handlePoiSave"
          @page-change="handlePageChange"
        />

        <!-- 地图控制标签页 -->
        <ControlPanel
          v-if="activeTab === 'controls'"
          :map-style="mapStyle"
          :map-zoom="mapZoom"
          @style-change="handleStyleChange"
          @zoom-change="handleZoomChange"
        />
      </div>
    </div>

    <!-- 底部操作区 -->
    <SidebarFooter
      @save-view="handleSaveView"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SidebarHeader from './SidebarHeader.vue'
import SearchBar from './SearchBar.vue'
import TabNavigation from './TabNavigation.vue'
import LocationsPanel from './LocationsPanel.vue'
import SearchPanel from './SearchPanel.vue'
import ControlPanel from './ControlPanel.vue'
import SidebarFooter from './SidebarFooter.vue'
import { useMapExplorer } from '../composables'
import type { MapLocation, PoiItem } from '../composables'

// Props
interface Props {
  showSidebar: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSidebar: true,
})

// Emits
interface Emits {
  (e: 'update:showSidebar', value: boolean): void
  (e: 'refresh'): void
  (e: 'settings'): void
  (e: 'search', query: string): void
  (e: 'location-navigate', location: MapLocation): void
  (e: 'poi-navigate', poi: PoiItem): void
}

const emit = defineEmits<Emits>()

// 使用组合式函数
const {
  mapState,
  locationManager,
  poiSearch,
  mapInteraction,
  goToLocation,
  searchPoi,
} = useMapExplorer()

// 解构响应式状态
const {
  mapZoom,
  mapStyle,
} = mapState

const {
  savedLocations,
  filteredLocations,
  locationFilter,
  activeLocationTag,
  locationTags,
} = locationManager

const {
  poiSearchKeyword,
  poiSearchRadius,
  poiSearchCategory,
  poiAutoExtend,
  isUsingUserLocation,
  poiCategories,
  quickSearchTags,
  poiSearchResults,
  isSearching,
  poiTotalCount,
  poiCurrentPage,
  showSearchResults,
} = poiSearch

// 本地状态
const activeTab = ref<string>('locations')

const searchQuery = computed({
  get: () => poiSearchKeyword.value,
  set: (value: string) => {
    poiSearchKeyword.value = value
  }
})

// 事件处理方法
const handleRefresh = () => {
  emit('refresh')
}

const handleSettings = () => {
  emit('settings')
}

const handleSearch = (query: string) => {
  emit('search', query)
}

const handleFilterChange = (filter: string) => {
  locationManager.locationFilter.value = filter
}

const handleTagChange = (tag: string) => {
  locationManager.toggleLocationTag(tag)
}

const handleLocationClick = (location: Location) => {
  goToLocation(location)
  emit('location-navigate', location)
}

const handleLocationEdit = (index: number) => {
  mapInteraction.openEditDialog({ index, data: savedLocations.value[index] })
}

const handleLocationDelete = async (index: number) => {
  const location = savedLocations.value[index]
  const confirmed = await mapInteraction.confirmDeleteLocation(location.name)
  if (confirmed) {
    locationManager.removeLocation(index)
  }
}

const handleAddLocation = () => {
  mapInteraction.openNewMarkerDialog()
}

const handleKeywordChange = (keyword: string) => {
  poiSearchKeyword.value = keyword
}

const handleRadiusChange = (radius: number) => {
  poiSearchRadius.value = radius
}

const handleCategoryChange = (category: string) => {
  poiSearchCategory.value = category
}

const handleAutoExtendChange = (autoExtend: boolean) => {
  poiAutoExtend.value = autoExtend
}

const handleLocationModeToggle = () => {
  poiSearch.toggleUseCurrentLocation()
}

const handlePoiSearch = () => {
  const center = isUsingUserLocation.value && locationManager.userCurrentLocation.value
    ? locationManager.userCurrentLocation.value
    : mapState.mapCenter.value

  poiSearch.searchNearbyPoi(poiSearchKeyword.value, center)
}

const handleClearResults = () => {
  poiSearch.clearSearchResults()
}

const handleQuickSearch = (keyword: string) => {
  const center = isUsingUserLocation.value && locationManager.userCurrentLocation.value
    ? locationManager.userCurrentLocation.value
    : mapState.mapCenter.value

  poiSearch.quickSearch(keyword, center)
}

const handlePoiSelect = (poi: PoiItem) => {
  poiSearch.selectPoi(poi)
}

const handlePoiGoto = (poi: PoiItem) => {
  mapState.setMapCenter({ lat: poi.location.lat, lng: poi.location.lng })
  emit('poi-navigate', poi)
}

const handlePoiSave = (poi: PoiItem) => {
  mapInteraction.openNewMarkerDialog({
    name: poi.title,
    lat: poi.location.lat,
    lng: poi.location.lng,
    id: `poi_${Date.now()}`,
  })
}

const handlePageChange = (page: number) => {
  poiSearch.handlePageChange(page)
}

const handleStyleChange = (style: string) => {
  mapState.updateMapStyle(style)
}

const handleZoomChange = (zoom: number) => {
  mapState.zoomLevel.value = zoom
}

const handleSaveView = () => {
  const currentView = {
    name: `视图 ${savedLocations.value.length + 1}`,
    lat: mapState.mapCenter.value.lat,
    lng: mapState.mapCenter.value.lng,
  }
  locationManager.addLocation(currentView)
}
</script>

<style scoped>
/* 侧边栏样式继承自主样式文件 */
.sidebar {
  width: 380px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-right: var(--glass-border);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  overflow-y: scroll;
  position: relative;
}

.sidebar.collapsed {
  transform: translateX(-380px);
  box-shadow: none;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
}

.tab-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-light);
}
</style>
