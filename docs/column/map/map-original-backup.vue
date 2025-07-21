<template>
  <div class="map-explorer-wrapper">
    <!-- 使用重构后的地图探索器组件 -->
    <MapExplorer :api-key="apiKey" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MapExplorer from './MapExplorer.vue'

// API密钥
const apiKey = ref('XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS')
</script>

<style scoped>
.map-explorer-wrapper {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
