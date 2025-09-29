# 图片预览组件 (ImagePreview)

## 功能介绍

这是一个基于 Element Plus 的通用图片预览组件，可以自动为 Markdown 文档中的所有图片添加点击预览功能。

## 特性

- ✅ **自动检测**: 自动检测页面中所有 `.vp-doc img` 图片
- ✅ **点击预览**: 点击图片即可打开全屏预览
- ✅ **多图浏览**: 支持在预览模式下切换查看同页面的其他图片
- ✅ **悬停效果**: 图片悬停时有缩放和阴影效果
- ✅ **路由感知**: 自动适配 VitePress 路由变化
- ✅ **响应式**: 完全响应式设计，支持移动端
- ✅ **Element Plus**: 使用 Element Plus 的 `el-image-viewer` 组件

## 使用方法

### 自动启用

组件已经全局注册并在 `MLayout.vue` 中引入，无需手动配置。所有 Markdown 文档中的图片都会自动获得预览功能。

### 在 Markdown 中使用

只需要正常插入图片即可：

```markdown
![图片描述](./images/example.png)

或者使用 HTML 标签：
<img src="./images/example.jpg" alt="图片描述" />
```

### 手动调用

如果需要手动初始化（比如动态加载的内容），可以获取组件实例：

```vue
<template>
  <ImagePreview ref="imagePreviewRef" />
</template>

<script setup>
import { ref } from 'vue'

const imagePreviewRef = ref()

// 手动初始化图片预览
const initPreview = () => {
  imagePreviewRef.value?.initImagePreview()
}
</script>
```

## 样式定制

组件提供了一些 CSS 变量可以自定义样式：

```scss
// 悬停时的缩放比例
--image-hover-scale: 1.02;

// 悬停时的阴影
--image-hover-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

// 图片圆角
--image-border-radius: 8px;

// 过渡动画时间
--image-transition: all 0.3s ease;
```

## 技术实现

- **Vue 3 Composition API**: 使用现代 Vue 3 语法
- **Element Plus**: 基于 Element Plus 的 `el-image-viewer` 组件
- **MutationObserver**: 监听 DOM 变化，自动处理动态内容
- **事件委托**: 高效的事件处理机制
- **防重复处理**: 使用 `data-preview-enabled` 标记避免重复处理

## 兼容性

- ✅ VitePress 1.0+
- ✅ Vue 3.0+
- ✅ Element Plus 2.0+
- ✅ 现代浏览器 (Chrome, Firefox, Safari, Edge)

## 注意事项

1. 图片必须在 `.vp-doc` 容器内才会被自动处理
2. 组件会自动处理路由变化，无需手动重新初始化
3. 支持相对路径和绝对路径的图片
4. 预览器会自动传送到 body 元素，避免 z-index 问题

## 示例效果

当您点击文档中的任何图片时，会看到：

1. 图片以全屏模式打开
2. 可以使用键盘方向键或鼠标切换图片
3. 点击遮罩层或按 ESC 键关闭预览
4. 支持缩放、旋转等操作（Element Plus 内置功能）

这个组件让您的文档图片浏览体验更加友好和专业！
