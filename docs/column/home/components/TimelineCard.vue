<template>
  <el-card class="timeline-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <h3>成长历程</h3>
        <span class="header-sub">Milestones</span>
      </div>
    </template>

    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :timestamp="activity.timestamp"
        :type="activity.type"
      >
        <el-card class="timeline-item-card" shadow="never">
          <h4>{{ activity.title }}</h4>
          <p>{{ activity.content }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script lang="ts" setup>
import { ElCard, ElTimeline, ElTimelineItem } from 'element-plus'
import type { GrowthActivity } from '../types'

defineProps<{
  activities: GrowthActivity[]
}>()
</script>

<style scoped>
.timeline-card {
  margin-bottom: 20px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
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
  font-weight: 700;
}

.header-sub {
  font-size: 12px;
  color: var(--vp-c-text-2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.timeline-item-card {
  margin-bottom: 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.88);
}

.timeline-item-card h4 {
  margin: 0 0 8px;
  color: var(--vp-c-text-1);
  font-size: 1.05em;
  font-weight: 700;
}

.timeline-item-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.92em;
  line-height: 1.6;
}

:deep(.el-timeline-item__timestamp) {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  margin-bottom: 8px;
}

:deep(.el-timeline-item__node) {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid color-mix(in srgb, var(--vp-c-brand-1) 32%, rgba(148, 163, 184, 0.28));
}

:root.dark .timeline-card {
  background: linear-gradient(165deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.86));
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.26);
}

:root.dark .timeline-item-card {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(148, 163, 184, 0.2);
}

:root.dark :deep(.el-timeline-item__tail) {
  border-left-color: rgba(148, 163, 184, 0.32);
}

@media (max-width: 768px) {
  .timeline-card {
    border-radius: 14px;
  }

  .header-sub {
    font-size: 11px;
  }

  .timeline-item-card p {
    font-size: 0.9em;
  }
}
</style>
