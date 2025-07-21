<template>
  <div class="map-dialogs">
    <!-- 设置对话框 -->
    <el-dialog
      :model-value="showSettings"
      @update:model-value="handleSettingsClose"
      title="地图设置"
      width="500px"
      @close="handleSettingsClose"
    >
      <SettingsDialog
        :default-center="defaultCenter"
        :default-zoom="defaultZoom"
        @save="handleSettingsSave"
        @close="handleSettingsClose"
      />
    </el-dialog>

    <!-- 新增标记对话框 -->
    <el-dialog
      :model-value="showNewMarker"
      @update:model-value="handleDialogClose"
      title="添加新位置"
      width="400px"
      @close="handleDialogClose"
    >
      <NewMarkerDialog
        :marker-name="markerName"
        :selected-location="selectedLocation"
        @save="handleMarkerSave"
        @close="handleDialogClose"
      />
    </el-dialog>

    <!-- 编辑标记对话框 -->
    <el-dialog
      :model-value="showEdit"
      @update:model-value="handleDialogClose"
      title="编辑位置"
      width="400px"
      @close="handleDialogClose"
    >
      <EditMarkerDialog
        :marker-name="markerName"
        :editing-marker="editingMarker"
        @save="handleMarkerEditSave"
        @close="handleDialogClose"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import SettingsDialog from './SettingsDialog.vue'
import NewMarkerDialog from './NewMarkerDialog.vue'
import EditMarkerDialog from './EditMarkerDialog.vue'
import type { Location } from '../composables'

// Props
interface Props {
  showSettings: boolean
  showNewMarker: boolean
  showEdit: boolean
  markerName: string
  selectedLocation: Location | null
  editingMarker: { index: number; data: any } | null
  defaultCenter: { lat: number; lng: number }
  defaultZoom: number
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'settings-close'): void
  (e: 'settings-save', settings: any): void
  (e: 'marker-save', data: { name: string; location: Location }): void
  (e: 'marker-edit-save', data: { name: string; index: number }): void
  (e: 'dialog-close'): void
}

const emit = defineEmits<Emits>()

// 事件处理方法
const handleSettingsClose = () => {
  emit('settings-close')
}

const handleSettingsSave = (settings: any) => {
  emit('settings-save', settings)
}

const handleMarkerSave = (data: { name: string; location: Location }) => {
  emit('marker-save', data)
}

const handleMarkerEditSave = (data: { name: string; index: number }) => {
  emit('marker-edit-save', data)
}

const handleDialogClose = () => {
  emit('dialog-close')
}
</script>

<style scoped>
.map-dialogs {
  /* 对话框容器样式 */
}

/* 自定义对话框样式 */
.map-dialogs :deep(.el-dialog) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  backdrop-filter: var(--glass-blur);
  background: var(--glass-bg);
  border: var(--glass-border);
}

.map-dialogs :deep(.el-dialog__header) {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-5) var(--space-6);
}

.map-dialogs :deep(.el-dialog__title) {
  color: var(--text-inverse);
  font-weight: 700;
  font-size: var(--text-lg);
}

.map-dialogs :deep(.el-dialog__headerbtn) {
  top: var(--space-5);
  right: var(--space-6);
  width: var(--space-8);
  height: var(--space-8);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.map-dialogs :deep(.el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.3);
}

.map-dialogs :deep(.el-dialog__close) {
  color: var(--text-inverse);
  font-size: var(--text-lg);
}

.map-dialogs :deep(.el-dialog__body) {
  padding: var(--space-6);
  background: var(--bg-primary);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.map-dialogs :deep(.el-overlay) {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.3);
}
</style>
