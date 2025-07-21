<template>
  <div class="settings-dialog">
    <el-form label-width="120px">
      <el-form-item label="默认中心点">
        <div class="coordinate-inputs">
          <el-input 
            v-model.number="localSettings.center.lat"
            placeholder="纬度"
            type="number"
            step="0.000001"
          />
          <el-input 
            v-model.number="localSettings.center.lng"
            placeholder="经度"
            type="number"
            step="0.000001"
          />
        </div>
      </el-form-item>
      
      <el-form-item label="默认缩放级别">
        <el-slider 
          v-model="localSettings.zoom"
          :min="3"
          :max="20"
          :step="0.1"
          show-input
        />
      </el-form-item>
      
      <el-form-item label="地图样式">
        <el-select v-model="localSettings.style" placeholder="选择地图样式">
          <el-option label="标准" value="standard" />
          <el-option label="卫星" value="satellite" />
          <el-option label="混合" value="hybrid" />
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <div class="dialog-actions">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Props
interface Props {
  defaultCenter: { lat: number; lng: number }
  defaultZoom: number
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'save', settings: any): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// 本地状态
const localSettings = ref({
  center: { lat: 39.909187, lng: 116.397451 },
  zoom: 12,
  style: 'standard',
})

// 监听 props 变化
watch(() => props.defaultCenter, (newValue) => {
  localSettings.value.center = { ...newValue }
}, { immediate: true, deep: true })

watch(() => props.defaultZoom, (newValue) => {
  localSettings.value.zoom = newValue
}, { immediate: true })

// 方法
const handleSave = () => {
  emit('save', { ...localSettings.value })
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.settings-dialog {
  padding: var(--space-4);
}

.coordinate-inputs {
  display: flex;
  gap: var(--space-3);
}

.coordinate-inputs .el-input {
  flex: 1;
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
