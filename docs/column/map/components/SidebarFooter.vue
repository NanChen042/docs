<template>
  <div class="sidebar-footer">
    <div class="footer-actions">
      <el-button 
        type="primary" 
        @click="handleSaveView"
        class="footer-btn"
      >
        <el-icon><Star /></el-icon>
        保存当前视图
      </el-button>
    </div>
    
    <div class="footer-info">
      <div class="app-version">地图探索器 v1.0</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'

// Emits
interface Emits {
  (e: 'save-view'): void
}

const emit = defineEmits<Emits>()

// 事件处理方法
const handleSaveView = () => {
  emit('save-view')
}
</script>

<style scoped>
.sidebar-footer {
  padding: var(--space-5) var(--space-6);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.footer-actions {
  display: flex;
  justify-content: center;
}

.footer-btn {
  width: 100%;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.footer-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.footer-info {
  text-align: center;
}

.app-version {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 500;
}
</style>
