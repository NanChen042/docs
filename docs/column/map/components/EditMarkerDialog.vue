<template>
  <div class="edit-marker-dialog">
    <el-form @submit.prevent="handleSave">
      <el-form-item label="位置名称">
        <el-input 
          v-model="localMarkerName"
          placeholder="请输入位置名称"
          clearable
          autofocus
        />
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

// Props
interface Props {
  markerName: string
  editingMarker: { index: number; data: any } | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'save', data: { name: string; index: number }): void
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
const handleSave = () => {
  if (localMarkerName.value.trim() && props.editingMarker) {
    emit('save', {
      name: localMarkerName.value.trim(),
      index: props.editingMarker.index,
    })
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.edit-marker-dialog {
  padding: var(--space-4);
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
