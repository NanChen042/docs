<template>
  <div class="new-marker-dialog">
    <el-form @submit.prevent="handleSave">
      <el-form-item label="位置名称">
        <el-input 
          v-model="localMarkerName"
          placeholder="请输入位置名称"
          clearable
          autofocus
        />
      </el-form-item>
      
      <el-form-item label="坐标信息" v-if="selectedLocation">
        <div class="coordinates-info">
          <span>{{ formatCoordinates(selectedLocation) }}</span>
        </div>
      </el-form-item>
      
      <el-form-item>
        <div class="dialog-actions">
          <el-button @click="handleClose">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSave"
            :disabled="!localMarkerName.trim()"
          >
            保存
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Location } from '../composables'

// Props
interface Props {
  markerName: string
  selectedLocation: Location | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'save', data: { name: string; location: Location }): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// 本地状态
const localMarkerName = ref<string>('')

// 监听 props 变化
watch(() => props.markerName, (newValue) => {
  localMarkerName.value = newValue
}, { immediate: true })

// 方法
const formatCoordinates = (location: Location): string => {
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

const handleSave = () => {
  if (localMarkerName.value.trim() && props.selectedLocation) {
    emit('save', {
      name: localMarkerName.value.trim(),
      location: props.selectedLocation,
    })
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.new-marker-dialog {
  padding: var(--space-4);
}

.coordinates-info {
  padding: var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-left: 3px solid var(--color-primary);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.dialog-actions .el-button {
  min-width: 80px;
}
</style>
