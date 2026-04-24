<template>
  <div class="home-container">
    <HomeHeader />

    <el-row :gutter="20" class="content-section">
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <ProfileCard :experience="experience" />
      </el-col>

      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <TimelineCard :activities="growthActivities" />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ElCol, ElRow } from 'element-plus'
import HomeHeader from './components/HomeHeader.vue'
import ProfileCard from './components/ProfileCard.vue'
import TimelineCard from './components/TimelineCard.vue'
import { growthActivities } from './data'
import { useExperience } from './composables/useExperience'

const { experience } = useExperience('2021-03-10')
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 0 16px;
}

.content-section {
  position: relative;
}

.content-section::before {
  content: '';
  position: absolute;
  inset: -16px;
  z-index: -1;
  border-radius: 20px;
  background: radial-gradient(circle at 18% 8%, rgba(59, 130, 246, 0.07), transparent 42%);
}

@media (max-width: 768px) {
  .home-container {
    padding: 8px;
  }

  .content-section::before {
    inset: -8px;
    border-radius: 14px;
  }
}
</style>
