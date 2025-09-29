<template>
  <div class="image-preview-container">
    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="imageList"
      :initial-index="currentIndex"
      :hide-on-click-modal="true"
      @close="closeViewer"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElImageViewer } from 'element-plus'

// 响应式数据
const showViewer = ref(false)
const imageList = ref<string[]>([])
const currentIndex = ref(0)

// 初始化图片预览功能
const initImagePreview = () => {
  nextTick(() => {
    // 查找所有在 markdown 内容中的图片
    const contentImages = document.querySelectorAll('.vp-doc img') as NodeListOf<HTMLImageElement>

    console.log('Found images:', contentImages.length)

    if (contentImages.length === 0) return

    // 清空之前的数据
    imageList.value = []

    // 处理每个图片
    contentImages.forEach((img, index) => {
      // 跳过已经处理过的图片
      if (img.dataset.previewEnabled) return

      // 标记为已处理
      img.dataset.previewEnabled = 'true'

      // 直接使用图片的 src 属性
      const imageSrc = img.src

      console.log(`Image ${index}:`, imageSrc)

      // 添加到数组
      imageList.value.push(imageSrc)

      // 添加点击样式
      img.style.cursor = 'pointer'

      // 添加点击事件
      img.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        console.log('Clicked image:', index, imageSrc)
        console.log('All images:', imageList.value)

        currentIndex.value = index
        showViewer.value = true
      })
    })
  })
}

// 关闭查看器
const closeViewer = () => {
  showViewer.value = false
}

onMounted(() => {
  // 初始化当前页面的图片
  initImagePreview()

  // 监听路由变化，重新初始化
  if (typeof window !== 'undefined') {
    const handleRouteChange = () => {
      setTimeout(() => {
        initImagePreview()
      }, 100)
    }

    window.addEventListener('popstate', handleRouteChange)
  }
})
</script>

<style lang="scss" scoped>
// 全局样式，为 markdown 图片添加预览效果
:global(.vp-doc img[data-preview-enabled="true"]) {
  cursor: pointer;
}
</style>
