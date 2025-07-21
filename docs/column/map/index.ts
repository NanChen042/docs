// 使用动态导入
const MainMap = () => import('./components/MainMap.vue');
const MapContainer = () => import('./components/MapContainer.vue');
const MapView = () => import('./components/MapView.vue');
const MapSidebar = () => import('./components/MapSidebar.vue');
const MapControl = () => import('./components/MapControl.vue');
const LocationItem = () => import('./components/LocationItem.vue');
const SearchPanel = () => import('./components/SearchPanel.vue');
const MapDialogs = () => import('./components/MapDialogs.vue');

// 提供组件导出
export {
  MainMap,
  MapContainer,
  MapView,
  MapSidebar,
  MapControl,
  LocationItem,
  SearchPanel,
  MapDialogs
};

// 导出默认组件
export default MainMap;
