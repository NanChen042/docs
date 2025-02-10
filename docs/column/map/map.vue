<template>
  <div class="map-container">
    <div class="map-header">
      <el-image
        :src="mapImage"
        fit="cover"
        class="map-image"
        loading="lazy"
      >
        <template #placeholder>
          <div class="map-placeholder">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在加载请稍后...</span>
          </div>
        </template>

        <template #error>
          <div class="map-error">
            <el-icon><Picture /></el-icon>
            <span>地图加载失败</span>
          </div>
        </template>
      </el-image>
      <div class="header-content">
        <div class="header-text">
          <h1>地图导览</h1>
          <p class="subtitle">探索世界的每个角落</p>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="content-section">
      <el-col :span="24">
        <el-collapse accordion class="custom-collapse">
          <el-collapse-item title="地图概览" name="1">
            <template #title>
              <div class="collapse-title">
                <el-icon><Compass /></el-icon>
                <span>地图概览</span>
              </div>
            </template>
            <div class="collapse-content overview-section">
              <div class="overview-grid">
                <div class="overview-item">
                  <div class="overview-icon">
                    <el-icon><Timer /></el-icon>
                  </div>
                  <div class="overview-info">
                    <div class="info-label">更新时间</div>
                    <div class="info-value">
                      <el-tag size="small" effect="plain" round>2024年3月</el-tag>
                    </div>
                  </div>
                </div>

                <div class="overview-item">
                  <div class="overview-icon">
                    <el-icon><Star /></el-icon>
                  </div>
                  <div class="overview-info">
                    <div class="info-label">覆盖范围</div>
                    <div class="info-value">
                      <el-tag size="small" effect="plain" round type="success">全球200+国家和地区</el-tag>
                    </div>
                  </div>
                </div>

                <div class="overview-item">
                  <div class="overview-icon">
                    <el-icon><Collection /></el-icon>
                  </div>
                  <div class="overview-info">
                    <div class="info-label">支持功能</div>
                    <div class="info-value tag-group">
                      <el-tag size="small" effect="light">路线规划</el-tag>
                      <el-tag size="small" type="success" effect="light">实时导航</el-tag>
                      <el-tag size="small" type="warning" effect="light">离线下载</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item title="主要特点" name="2">
            <template #title>
              <div class="collapse-title">
                <el-icon><Star /></el-icon>
                <span>主要特点</span>
              </div>
            </template>
            <div class="feature-grid">
              <div v-for="(feature, index) in features" :key="index" class="feature-item">
                <div class="feature-card">
                  <div class="feature-content">
                    <div class="feature-icon-wrapper">
                      <el-icon :size="32">
                        <Location v-if="feature.icon === 'Location'" />
                        <Guide v-if="feature.icon === 'Guide'" />
                        <Download v-if="feature.icon === 'Download'" />
                        <Share v-if="feature.icon === 'Share'" />
                      </el-icon>
                    </div>
                    <div class="feature-text">
                      <h3>{{ feature.title }}</h3>
                      <p>{{ feature.description }}</p>
                    </div>
                  </div>
                  <div class="feature-backdrop"></div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { ref } from 'vue'
const { isDark } = useData()
import {
  ElButton,
  ElCard,
  ElRow,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElImage,
  ElIcon
} from 'element-plus'
import {
  Location,
  Picture,
  Guide,
  Download,
  Share,
  Compass,
  Star,
  Timer,
  Loading,
  Collection
} from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

const features = [
  {
    icon: 'Location',
    title: '精准定位',
    description: '支持GPS精准定位，误差范围小于10米'
  },
  {
    icon: 'Guide',
    title: '智能导航',
    description: '多种出行方式，智能规划最优路线'
  },
  {
    icon: 'Download',
    title: '离线地图',
    description: '支持离线下载，无网络也能导航'
  },
  {
    icon: 'Share',
    title: '位置共享',
    description: '实时位置共享，方便与好友相约'
  }
]

const mapImage = ref('https://picsum.photos/1200/300')
</script>

<style scoped>
.map-container {
  max-width: 1200px;
  margin: 0 auto;
}

.map-header {
  position: relative;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.map-image {
  width: 100%;
  height: 100%;
}

.header-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  box-sizing: border-box;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.header-text h1 {
  margin: 0;
  font-size: 24px;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 16px;
  opacity: 0.8;
}

.content-section {
  margin-top: 20px;
}

.custom-collapse {
  --el-collapse-header-height: 56px;
  border-radius: 8px;
  overflow: hidden;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  padding-left: 16px;
}

.collapse-title .el-icon {
  font-size: 20px;
  color: var(--vp-c-brand-1);
  margin-right: 4px;
}

.collapse-content {
  padding: 20px;
  padding-left: 36px;
}

.custom-descriptions {
  --el-descriptions-item-bordered-label-background: var(--el-fill-color-light);
}

.custom-descriptions :deep(.el-descriptions__label) {
  font-weight: 500;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-group .el-tag {
  --el-tag-bg-color: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  --el-tag-border-color: var(--vp-c-brand-1);
  --el-tag-text-color: var(--vp-c-brand-1);
}

.tag-group .el-tag.el-tag--success {
  --el-tag-bg-color: color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
  --el-tag-border-color: var(--vp-c-brand-1);
  --el-tag-text-color: var(--vp-c-brand-1);
}

.tag-group .el-tag.el-tag--warning {
  --el-tag-bg-color: color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent);
  --el-tag-border-color: var(--vp-c-brand-1);
  --el-tag-text-color: var(--vp-c-brand-1);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 16px;
}

.feature-item {
  perspective: 1000px;
}

.feature-card {
  position: relative;
  min-height: 160px;
  padding: 20px;
  border-radius: 16px;
  background: var(--vp-c-bg);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card:hover .feature-backdrop {
  opacity: 1;
  transform: scale(1.5) translateY(-20px);
}

.feature-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.feature-icon-wrapper {
  margin-bottom: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 12px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  color: var(--vp-c-brand-1);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  background: var(--vp-c-brand-1);
  color: white;
  transform: scale(1.1);
}

.feature-text {
  flex: 1;
}

.feature-text h3 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: color 0.3s ease;
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  transition: color 0.3s ease;
}

.feature-backdrop {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  border-radius: 50%;
}

.map-placeholder,
.map-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  color: #909399;
}

/* 移动端适配 */
@media screen and (max-width: 1200px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media screen and (max-width: 768px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;
  }

  .feature-card {
    min-height: 140px;
    padding: 16px;
  }

  .feature-icon-wrapper {
    width: 40px;
    height: 40px;
    padding: 8px;
    margin-bottom: 12px;
  }

  .feature-text h3 {
    font-size: 16px;
    margin-bottom: 6px;
  }

  .feature-text p {
    font-size: 12px;
    line-height: 1.4;
  }

  .collapse-title {
    padding-left: 12px;
  }

  .collapse-content,
  .overview-section {
    padding-left: 24px !important;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}

/* 修改深色模式的实现方式 */
.feature-card {
  position: relative;
  min-height: 160px;
  padding: 20px;
  border-radius: 16px;
  background: var(--vp-c-bg);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.overview-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--vp-c-bg);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.overview-item:hover {
  transform: translateX(4px);
  background: color-mix(in srgb, var(--vp-c-brand-1) 5%, var(--vp-c-bg));
}

.overview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  color: var(--vp-c-brand-1);
}

.overview-icon .el-icon {
  font-size: 24px;
}

.overview-info {
  flex: 1;
}

.info-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

/* 深色模式样式 */
:root.dark .feature-card {
  background: var(--vp-c-bg-soft);
}

:root.dark .feature-backdrop {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent) 0%,
    color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent) 100%
  );
}

:root.dark .feature-icon-wrapper {
  background: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}

:root.dark .overview-item {
  background: var(--vp-c-bg-soft);
}

:root.dark .overview-item:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, var(--vp-c-bg-soft));
}

:root.dark .overview-icon {
  background: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}

:root.dark .info-label {
  color: var(--vp-c-text-2);
}

:root.dark .info-value {
  color: var(--vp-c-text-1);
}

:root.dark .tag-group .el-tag {
  --el-tag-bg-color: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}

:root.dark .tag-group .el-tag.el-tag--success,
:root.dark .tag-group .el-tag.el-tag--warning {
  --el-tag-bg-color: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  --el-tag-border-color: var(--vp-c-brand-1);
  --el-tag-text-color: var(--vp-c-brand-1);
}

:root.dark .custom-collapse {
  background-color: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

:root.dark .custom-collapse :deep(.el-collapse-item__header) {
  background-color: var(--vp-c-bg-soft);
  border-bottom-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

:root.dark .custom-collapse :deep(.el-collapse-item__wrap) {
  background-color: var(--vp-c-bg-soft);
  border-bottom-color: var(--vp-c-divider);
}

:root.dark .custom-collapse :deep(.el-collapse-item__content) {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

:root.dark .feature-text h3 {
  color: var(--vp-c-text-1);
}

:root.dark .feature-text p {
  color: var(--vp-c-text-2);
}

.overview-section {
  padding: 24px !important;
  padding-left: 36px !important;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .overview-section {
    padding: 16px !important;
  }

  .overview-grid {
    gap: 16px;
  }

  .overview-item {
    padding: 16px;
    gap: 12px;
  }

  .overview-icon {
    width: 40px;
    height: 40px;
  }

  .overview-icon .el-icon {
    font-size: 20px;
  }

  .info-label {
    font-size: 13px;
  }

  .info-value {
    font-size: 14px;
  }
}
</style>
