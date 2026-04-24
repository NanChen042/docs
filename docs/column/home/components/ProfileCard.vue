<template>
  <el-card class="profile-card" shadow="hover">
    <div class="profile-top">
      <el-avatar :size="96" src="/docs/wxlogo.jpg" class="profile-avatar" />
      <h2 class="profile-name">Southern Wind</h2>
      <p class="profile-title">前端开发工程师</p>
    </div>

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
</template>

<script lang="ts" setup>
import { ElAvatar, ElCard, ElDivider, ElIcon } from 'element-plus'
import { Collection, Document, Timer } from '@element-plus/icons-vue'

defineProps<{
  experience: string
}>()
</script>

<style scoped>
.profile-card {
  margin-bottom: 20px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
  transition: all 0.3s ease;
}

.profile-top {
  text-align: center;
}

.profile-avatar {
  margin-bottom: 14px;
  border: 4px solid color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
}

.profile-name {
  margin: 8px 0 5px;
  font-size: 1.34em;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.profile-title {
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
  font-size: 0.94em;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.stat-item {
  text-align: left;
  display: flex;
  align-items: center;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.22);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 40%, rgba(148, 163, 184, 0.22));
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 14%, white);
  margin-right: 12px;
  color: var(--vp-c-brand-1);
  font-size: 1.05em;
}

.stat-info {
  flex: 1;
}

.stat-label {
  margin: 0;
  font-size: 0.81em;
  color: var(--vp-c-text-2);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.stat-info h3 {
  margin: 2px 0 0;
  color: var(--vp-c-text-1);
  font-size: 1.05em;
  font-weight: 700;
}

:root.dark .profile-card {
  background: linear-gradient(165deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.86));
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.26);
}

:root.dark .stat-item {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(148, 163, 184, 0.2);
}

:root.dark .stat-item:hover {
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
}

:root.dark .stat-icon {
  background: color-mix(in srgb, var(--vp-c-brand-1) 18%, rgba(15, 23, 42, 0.8));
}

@media (max-width: 768px) {
  .profile-card {
    border-radius: 14px;
  }

  .profile-stats {
    gap: 8px;
  }

  .stat-item {
    padding: 12px;
  }
}
</style>
