# 📦 项目部署指南

由于项目包含大量媒体文件，建议分两次提交以避免单次提交文件过大的问题。

## 🚀 第一次提交：项目结构和代码

### 包含内容：
- ✅ 所有源代码文件 (`.vue`, `.ts`, `.js`, `.md`)
- ✅ 配置文件 (`package.json`, `vite.config.ts`, `.vitepress/config.mts`)
- ✅ 小图标文件 (`docs/public/icon/`, `.ico`, 小的 `.png`)
- ✅ 项目文档和说明文件

### 排除内容：
- ❌ 大型媒体文件 (`.mp4`, `.mp3`, `.m4a`)
- ❌ 大型图片文件 (`.jpg`, `.jpeg`, 大的 `.png`)
- ❌ `node_modules/` 和构建输出

### 提交命令：
```bash
git add .
git commit -m "feat: 初始化项目结构和代码

- 添加 VitePress 文档站点配置
- 实现音频播放器组件
- 添加拖拽悬浮播放器功能
- 配置主题和样式
- 添加项目基础结构"

git push origin main
```

## 📁 第二次提交：媒体文件

### 准备工作：
1. 编辑 `.gitignore` 文件，注释掉或删除媒体文件的排除规则：

```gitignore
# 注释掉这些行，允许媒体文件被提交
# *.mp4
# *.mp3
# *.m4a
# docs/column/cjx/assets/**/*.jpg
# docs/column/cjx/assets/**/*.jpeg
# docs/column/cjx/assets/**/*.png
```

2. 添加媒体文件：

```bash
# 添加音频文件
git add docs/column/cjx/assets/致陈佳欣的一封信/*.mp3
git add docs/column/cjx/assets/致陈佳欣的一封信/*.m4a

# 添加视频文件
git add docs/column/cjx/assets/index/*.mp4
git add docs/public/videos/*.mp4

# 添加图片文件
git add docs/column/cjx/assets/**/*.jpg
git add docs/column/cjx/assets/**/*.jpeg
git add docs/column/cjx/assets/**/*.png
```

3. 提交媒体文件：

```bash
git commit -m "feat: 添加项目媒体文件

- 添加音频文件 (mp3, m4a)
- 添加视频文件 (mp4)
- 添加图片资源 (jpg, png)
- 完善项目资源文件"

git push origin main
```

## 🔧 构建和部署

### 本地开发：
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run docs:dev
```

### 构建生产版本：
```bash
# 构建项目
pnpm run docs:build

# 预览构建结果
pnpm run docs:preview
```

### 部署到 GitHub Pages：
```bash
# 部署到 GitHub Pages
pnpm run deploy
```

## 📝 注意事项

1. **文件大小限制**：
   - GitHub 单个文件限制 100MB
   - 建议单个媒体文件不超过 50MB

2. **Git LFS**（可选）：
   如果媒体文件很大，可以考虑使用 Git LFS：
   ```bash
   git lfs track "*.mp4"
   git lfs track "*.mp3"
   git lfs track "*.m4a"
   ```

3. **CDN 优化**：
   生产环境建议将媒体文件上传到 CDN，然后更新文件路径。

## 🎯 项目特性

- 🎵 音频播放器组件
- 🎬 视频播放支持
- 📱 响应式设计
- 🖱️ 拖拽悬浮播放器
- 🎨 自定义主题
- 📖 VitePress 文档站点

## 🛠️ 技术栈

- **框架**: VitePress
- **前端**: Vue 3 + TypeScript
- **样式**: Tailwind CSS
- **构建**: Vite
- **包管理**: pnpm
