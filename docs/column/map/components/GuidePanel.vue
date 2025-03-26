<template>
  <div class="guide-container">
    <el-collapse accordion>
      <el-collapse-item v-for="(guide, index) in guides" :key="index" :title="guide.title" :name="index">
        <div class="guide-content">
          <p>{{ guide.content }}</p>
          <div v-if="guide.tips" class="guide-tips">
            <el-alert
              :title="guide.tips"
              type="info"
              :closable="false"
              show-icon
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 使用指南数据
const guides = ref([
  {
    title: '如何使用地图搜索？',
    content: '在顶部搜索框中输入关键词如地址、地标、商户名称等，点击搜索按钮或按回车键即可发起搜索，结果将在地图上标注并列表展示。',
    tips: '提示：您可以尝试模糊搜索或使用拼音首字母来快速定位目标。'
  },
  {
    title: '如何规划路线？',
    content: '点击地图上的起点标记，然后点击"路线规划"按钮，再选择或搜索终点位置，系统会自动为您规划最优路线。您可以切换驾车、公交、步行、骑行等不同出行方式。',
    tips: '提示：峰值时段会自动考虑实时路况，避开拥堵路段。'
  },
  {
    title: '如何下载离线地图？',
    content: '点击左下角菜单按钮，选择"离线地图"功能，在城市列表中选择需要下载的城市或区域，点击下载按钮即可。下载完成后，即使在无网络环境下也能使用基础地图功能。',
    tips: '提示：建议使用WiFi环境下载离线地图，以节省流量。'
  },
  {
    title: '如何使用全景街景？',
    content: '在地图上长按任意位置，或者搜索特定地点后，点击出现的信息窗口中的"街景"按钮，即可进入360°全景视图模式。在街景模式中，您可以通过拖拽、缩放来查看周围环境。',
    tips: '提示：并非所有地区都有街景覆盖，主要覆盖城市道路和热门景点。'
  }
])
</script>

<style scoped>
.guide-container {
  padding: 20px 0;
}

.guide-content {
  line-height: 1.6;
}

.guide-tips {
  margin-top: 16px;
}
</style>
