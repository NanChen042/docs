<template>
  <div class="features-container">
    <div class="features-grid">
      <el-card v-for="(feature, index) in features" :key="index" class="feature-card" :body-style="{padding: '20px'}">
        <div class="feature-icon">
          <el-icon :size="36">
            <component :is="feature.icon" />
          </el-icon>
        </div>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-desc">{{ feature.description }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 功能介绍数据
const features = ref([
  {
    icon: 'Position',
    title: '精准定位',
    description: '基于GPS和网络定位，提供米级定位精度，快速找到您的当前位置和周边信息。'
  },
  {
    icon: 'Guide',
    title: '智能导航',
    description: '支持多种出行方式规划，实时路况分析，智能推荐最优路线，躲避拥堵。'
  },
  {
    icon: 'Connection',
    title: '全景街景',
    description: '沉浸式360°全景街景体验，提前了解目的地环境，减少出行不确定性。'
  },
  {
    icon: 'Share',
    title: '位置共享',
    description: '一键分享位置给好友，支持实时位置追踪，方便聚会、旅行等场景使用。'
  },
  {
    icon: 'Download',
    title: '离线地图',
    description: '支持城市和区域地图离线下载，无网络环境下也能正常导航和查询。'
  },
  {
    icon: 'Place',
    title: '商户信息',
    description: '覆盖全国超过5000万商户信息，包含评分、营业时间、联系方式等详情。'
  }
])
</script>

<style scoped>
.features-container {
  padding: 20px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  height: 100%;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.feature-title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 18px;
}

.feature-desc {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  text-align: center;
}
</style>
