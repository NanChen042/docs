<template>
  <div class="sidebar-header">
    <!-- 品牌区域 -->
    <div class="header-brand">
      <div class="brand-logo">🌏</div>
      <h2 class="brand-title">探索地图</h2>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="header-actions">
      <el-button 
        circle 
        text 
        @click="handleRefresh" 
        class="header-action-btn"
        :title="'刷新地图'"
      >
        <el-icon>
          <Refresh />
        </el-icon>
      </el-button>
      
      <el-button 
        circle 
        text 
        @click="handleSettings" 
        class="header-action-btn"
        :title="'地图设置'"
      >
        <el-icon>
          <Setting />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, Setting } from '@element-plus/icons-vue'

// Emits
interface Emits {
  (e: 'refresh'): void
  (e: 'settings'): void
}

const emit = defineEmits<Emits>()

// 事件处理方法
const handleRefresh = () => {
  emit('refresh')
}

const handleSettings = () => {
  emit('settings')
}
</script>

<style scoped>
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  background: var(--gradient-primary);
  color: var(--text-inverse);
  position: relative;
  overflow: hidden;
  min-height: 72px;
  box-shadow: var(--shadow-md);
}

/* 添加背景纹理 */
.sidebar-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.1;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  position: relative;
  z-index: 1;
}

.brand-logo {
  font-size: 1.8rem;
  width: var(--space-12);
  height: var(--space-12);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: transform var(--transition-bounce);
  position: relative;
  overflow: hidden;
}

.brand-logo::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  border-radius: inherit;
}

.brand-logo:hover {
  transform: rotate(15deg) scale(1.05);
}

.brand-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-inverse);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.02em;
  background: linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
  position: relative;
  z-index: 1;
}

.header-action-btn {
  width: var(--space-10);
  height: var(--space-10);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-inverse);
  transition: all var(--transition-normal);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.header-action-btn:active {
  transform: translateY(0);
}
</style>
