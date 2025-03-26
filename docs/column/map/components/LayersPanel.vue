<template>
  <div class="controls-section">
    <div class="section-header">
      <h3 class="section-title">图层与视图</h3>
      <el-tooltip content="图层设置" placement="top">
        <el-button class="button" text :icon="Setting"></el-button>
      </el-tooltip>
    </div>
    <div class="section-content">
      <div class="layer-toggles">
        <div class="layer-toggle-item" @click="toggleLayer('traffic')">
          <div class="layer-toggle-icon" :class="{ 'active': mapLayers.traffic }">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="layer-toggle-info">
            <div class="layer-toggle-name">实时交通</div>
            <div class="layer-toggle-status">{{ mapLayers.traffic ? '已启用' : '已关闭' }}</div>
          </div>
          <el-switch v-model="mapLayers.traffic" />
        </div>

        <div class="layer-toggle-item" @click="toggleLayer('poi')">
          <div class="layer-toggle-icon" :class="{ 'active': mapLayers.poi }">
            <el-icon><Place /></el-icon>
          </div>
          <div class="layer-toggle-info">
            <div class="layer-toggle-name">兴趣点</div>
            <div class="layer-toggle-status">{{ mapLayers.poi ? '已启用' : '已关闭' }}</div>
          </div>
          <el-switch v-model="mapLayers.poi" />
        </div>

        <div class="layer-toggle-item" @click="toggleLayer('transit')">
          <div class="layer-toggle-icon" :class="{ 'active': mapLayers.transit }">
            <el-icon><Guide /></el-icon>
          </div>
          <div class="layer-toggle-info">
            <div class="layer-toggle-name">公共交通</div>
            <div class="layer-toggle-status">{{ mapLayers.transit ? '已启用' : '已关闭' }}</div>
          </div>
          <el-switch v-model="mapLayers.transit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Setting, Connection, Place, Guide } from '@element-plus/icons-vue'

// 定义组件属性
const props = defineProps({
  initialLayers: {
    type: Object,
    default: () => ({
      traffic: false,
      poi: true,
      transit: false
    })
  }
})

// 定义组件事件
const emit = defineEmits(['layersChange'])

// 地图图层状态
const mapLayers = reactive({
  traffic: props.initialLayers.traffic,
  poi: props.initialLayers.poi,
  transit: props.initialLayers.transit
})

// 图层切换方法
const toggleLayer = (layer: string) => {
  if (layer in mapLayers) {
    mapLayers[layer] = !mapLayers[layer]
  }
}

// 监听图层变化
watch(() => ({ ...mapLayers }), (newLayers) => {
  emit('layersChange', newLayers)
}, { deep: true })
</script>

<style scoped>
.controls-section {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.section-content {
  font-size: 14px;
}

.layer-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-toggle-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  background-color: var(--el-fill-color-lighter);
  cursor: pointer;
}

.layer-toggle-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color);
  border-radius: 6px;
  margin-right: 12px;
  color: var(--el-text-color-secondary);
}

.layer-toggle-icon.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.layer-toggle-info {
  flex: 1;
}

.layer-toggle-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.layer-toggle-status {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
