<template>
  <div class="home-header">
    <el-image
      src="https://picsum.photos/1200/208"
      fit="cover"
      class="header-image"
      loading="lazy"
    >
      <template #placeholder>
        <div class="image-placeholder">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在寻找图片...</span>
        </div>
      </template>

      <template #error>
        <div class="image-error">
          <el-icon><Picture /></el-icon>
          <span>图片加载失败</span>
        </div>
      </template>
    </el-image>

    <div class="header-overlay"></div>

    <div class="header-content">
      <div class="header-text">
        <p class="eyebrow">Career Journey</p>
        <h1>个人成长</h1>
        <p class="subtitle">记录每一步成长的足迹</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElIcon, ElImage } from 'element-plus'
import { Loading, Picture } from '@element-plus/icons-vue'
</script>

<style scoped>
.home-header {
  position: relative;
  height: 220px;
  margin-bottom: 22px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.15);
}

.header-image {
  width: 100%;
  height: 100%;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(125deg, rgba(2, 132, 199, 0.65), rgba(30, 64, 175, 0.45) 50%, rgba(15, 23, 42, 0.7)),
    radial-gradient(circle at 82% 22%, rgba(255, 255, 255, 0.24), transparent 36%);
}

.header-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 20px 22px;
  color: #fff;
}

.header-text {
  max-width: 560px;
}

.eyebrow {
  margin: 0 0 6px;
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(4px);
}

.header-text h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.08;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  opacity: 0.95;
}

.image-placeholder,
.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 220px;
  background-color: #f5f7fa;
  color: #909399;
}

.is-loading {
  animation: rotate 1s linear infinite;
  font-size: 24px;
  color: #909399;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.image-placeholder span,
.image-error span {
  font-size: 14px;
  opacity: 0.9;
  color: #909399;
}

:root.dark .home-header {
  border-color: rgba(148, 163, 184, 0.26);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

:root.dark .image-placeholder,
:root.dark .image-error {
  background-color: #1a1a1a;
  color: white;
}

@media (max-width: 768px) {
  .home-header {
    height: 196px;
    border-radius: 14px;
    margin-bottom: 16px;
  }

  .header-content {
    padding: 16px;
  }

  .header-text h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 14px;
  }

  .image-placeholder,
  .image-error {
    height: 196px;
  }
}
</style>
