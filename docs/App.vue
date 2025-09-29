<template>
  <div class="app-container">
    <header class="app-header">
      <h1>地图应用</h1>
    </header>
    <main class="app-content">
      <MainMap />
    </main>
    <footer class="app-footer">
      <p>© 2023 地图应用 | 基于Vue3和Element Plus</p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
// 应用根组件
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, sans-serif;
}

#app {
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  padding: 10px 20px;
  background-color: #409EFF;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-content {
  flex: 1;
  overflow: hidden;
}

.app-footer {
  padding: 10px 20px;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 0.8rem;
  text-align: center;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .app-header {
    padding: 8px 15px;
  }

  .app-header h1 {
    font-size: 1.2rem;
  }

  .app-footer {
    padding: 8px 15px;
    font-size: 0.7rem;
  }
}
</style>
