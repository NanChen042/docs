<template>
  <div class="home-container">
    <!-- 添加头部背景 -->
    <div class="home-header">
      <el-image
        src="https://picsum.photos/1200/208"
        fit="cover"
        class="header-image"
        loading="lazy"
      >
        <!-- 添加占位符插槽 -->
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
      <div class="header-content">
        <div class="header-text">
          <h1>个人成长</h1>
          <p class="subtitle">记录每一步成长的足迹</p>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="content-section">
      <!-- 个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <el-card class="profile-card" shadow="hover">
          <el-avatar :size="100" src="/docs/wxlogo.jpg" class="profile-avatar" />
          <h2 class="profile-name">Southern Wind</h2>
          <p class="profile-title">前端开发工程师</p>
          <el-divider />
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">工作经验</p>
                <h3>{{ experience }}</h3>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Collection /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">项目经验</p>
                <h3>20+</h3>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">技术文章</p>
                <h3>100+</h3>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 成长时间线 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <el-card class="timeline-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>成长历程</h3>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              <el-card class="timeline-item-card" shadow="hover">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useData } from 'vitepress'
const { isDark } = useData()
import {
  ElButton,
  ElCard,
  ElRow,
  ElCol,
  ElTimeline,
  ElTimelineItem,
  ElAvatar,
  ElDivider,
  ElImage,
  ElIcon
} from 'element-plus'
import {
  Timer,
  Collection,
  Document,
  Picture,
  Loading
} from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

const activities:any = ref([
  {
    timestamp: '2024',
    title: '未来规划',
    content: '计划学习算法、计算机图形学、数据结构和游戏开发，同时关注鸿蒙开发方向，并且了解最新的前言技术的更新，能够快速适应最新的前端技术栈，善于解决问题和攻克挑战。',
    type: 'primary'
  },
  {
    timestamp: '2023',
    title: 'AR方向探索',
    content: '公司开始向AR和3D方向发展，继续积累项目经验',
    type: 'success'
  },
  {
    timestamp: '2022年5月',
    title: '正式入职',
    content: '入职上海某互联网公司，主要负责医疗相关网站和小程序开发',
    type: 'info'
  },

  {
    timestamp: '2022年2月',
    title: '来到上海',
    content: '独立负责WEB端、小程序、H5和APP开发。主要负责医疗相关网站',
    type: 'info'
  },
  {
    timestamp: '2021年3月',
    title: '职业起步',
    content: '在合肥某科技公司担任前端开发工程师，注重组件的复用性设计，并参与项目的性能优化和打包部署',
    type: 'success'
  }
]);

// 设置工作开始时间
const startDate = new Date('2021-03-10'); // 请修改为你的实际工作开始时间

const experience = computed(() => {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

  if (years === 0) {
    return `${months}个月`;
  } else if (months === 0) {
    return `${years}年`;
  } else {
    return `${years}年${months}个月`;
  }
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.home-header {
  position: relative;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.header-image {
  width: 100%;
  height: 100%;
}

.header-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
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



.profile-card {
  text-align: center;

  margin-bottom: 20px;
  background: var(--vp-c-bg);
  transition: all 0.3s ease;
}

.profile-avatar {
  margin-bottom: 16px;
  border: 4px solid color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  transition: all 0.3s ease;
}

.profile-name {
  margin: 15px 0 5px;
  font-size: 1.4em;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.profile-title {
  color: var(--vp-c-text-2);
  margin-bottom: 15px;
  font-size: 0.95em;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  padding: 0 8px;
}

.stat-item {
  text-align: left;
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--vp-c-divider);
  position: relative;
  overflow: hidden;
}

.stat-item:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 5%, var(--vp-c-bg));
  transform: translateX(6px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  margin-right: 14px;
  color: var(--vp-c-brand-1);
  font-size: 1.1em;
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 1.2em;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2px;
}

.stat-info p {
  margin: 0;
  font-size: 0.85em;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.timeline-card {
  margin-bottom: 20px;
  background: var(--vp-c-bg);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  color: var(--vp-c-text-1);
  margin: 0;
  font-size: 1.2em;
  font-weight: 600;
}

.timeline-item-card {
  margin-bottom: 10px;
  background: var(--vp-c-bg);
  transition: all 0.3s ease;
}

.timeline-item-card h4 {
  margin: 0 0 8px;
  color: var(--vp-c-brand-1);
  font-size: 1.1em;
  font-weight: 600;
}

.timeline-item-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
  line-height: 1.5;
}

/* 深色模式特定样式 */
:root.dark .profile-card,
:root.dark .timeline-card,
:root.dark .timeline-item-card {
  background: var(--vp-c-bg-soft);
}

:root.dark .stat-item {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

:root.dark .stat-item:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, var(--vp-c-bg-soft));
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:root.dark .stat-icon {
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
}

/* Element Plus 组件的暗色模式适配 */
:root.dark .el-card {
  --el-card-bg-color: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

:root.dark .el-timeline-item__node {
  background-color: var(--vp-c-brand-1);
}

:root.dark .el-timeline-item__tail {
  border-left-color: var(--vp-c-divider);
}

:root.dark .el-divider {
  border-color: var(--vp-c-divider);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }

  .profile-stats {
    padding: 0 10px;
  }

  .stat-item {
    width: 100%;
    margin-bottom: 10px;
  }
}

.image-placeholder,
.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  color: #909399;
}

.is-loading {
  animation: rotate 1s linear infinite;
  font-size: 24px;
  color: #909399;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.image-placeholder span,
.image-error span {
  font-size: 14px;
  opacity: 0.9;
  color: #909399;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

/* 深色模式下的颜色 */
:root.dark .image-placeholder,
:root.dark .image-error {
  background-color: #1a1a1a;
  color: white;
}
</style>
