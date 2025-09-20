# 📦 项目拆分说明

## 🎯 拆分原因

由于项目包含大量媒体文件（音频、视频、图片），总大小较大，为了避免单次提交过大的问题，将项目拆分为两次提交：

## 📋 第一次提交内容（当前状态）

### ✅ 包含的文件：
- **配置文件**: `package.json`, `pnpm-lock.yaml`, `.gitignore`
- **VitePress 配置**: `docs/.vitepress/config.mts`, 主题文件
- **Vue 组件**: 
  - `docs/column/cjx/Cjx.vue` (音频播放器页面)
  - `docs/column/cjx/ReadingPlayer.vue` (拖拽悬浮播放器)
- **Markdown 文档**: `docs/column/cjx/index.md`
- **样式文件**: CSS, TypeScript 配置
- **脚本文件**: `scripts/manage-media.js`
- **文档**: `DEPLOYMENT.md`, `QUICK_START.md`, `PROJECT_SPLIT.md`
- **小图标**: `docs/public/icon/`, `.ico` 文件

### ❌ 排除的文件：
- **视频文件**: `*.mp4`, `*.avi`, `*.mov` 等
- **音频文件**: `*.mp3`, `*.m4a`, `*.wav` 等  
- **大图片**: `docs/column/cjx/assets/**/*.jpg`, `*.png` 等
- **构建输出**: `node_modules/`, `dist/`

## 📁 第二次提交内容

### 媒体文件列表：
```
docs/column/cjx/assets/致陈佳欣的一封信/
├── Connie Talbot - Count On Me_H.mp3      # 背景音乐
├── 男生给女生的深情信件.m4a                # 朗读音频
├── 1aa0a2e85ecdd69e26808d75bc210404.jpg   # 手环图片
├── 27b0b6a40b1fc741512494cb22e95995.jpg   # 玩偶图片
├── 522566fb4a80a30643636e152b49b2a8.jpg   # 花束图片
├── 872028ec1a1074431f9f5de907dc5563.jpg   # 信件图片
├── 874f4cfbdd2d82d19c7109d16c66b28c.jpg   # 拉力带图片
└── bbef6365a2b8736a6e866cf71dfa967a.jpg   # 杯子图片

docs/column/cjx/assets/index/
├── 10f747a075d1b16c9602e313127c638a.mp4  # 魔术表演视频
├── 049bf7ec858bf4f6a685e4b456e1799d.jpg  # 照片1
├── 2892d8692485ad1c2f60cd922ba75b76.jpg  # 照片2
├── f6aa9607a4e8f1916e6cc9f714f3dd97.jpg  # 照片3
└── image.png                              # 照片4

docs/public/videos/
└── 10f747a075d1b16c9602e313127c638a.mp4  # 视频副本
```

## 🚀 执行步骤

### 第一次提交（现在）：
```bash
# 1. 确保媒体文件被排除
pnpm run media:exclude

# 2. 添加所有文件
git add .

# 3. 提交代码结构
git commit -m "feat: 初始化项目结构和代码

- 添加 VitePress 文档站点配置
- 实现音频播放器组件 (Cjx.vue)
- 添加拖拽悬浮播放器功能 (ReadingPlayer.vue)
- 配置自定义主题和样式
- 添加项目管理脚本
- 修复 Canvas 文字渲染问题
- 优化构建配置和部署流程"

# 4. 推送到远程
git push origin main
```

### 第二次提交（稍后）：
```bash
# 1. 包含媒体文件
pnpm run media:include

# 2. 添加媒体文件
git add .

# 3. 提交媒体文件
git commit -m "feat: 添加项目媒体文件

- 添加音频文件 (mp3, m4a)
- 添加视频文件 (mp4)
- 添加图片资源 (jpg, png)
- 完善项目资源文件"

# 4. 推送到远程
git push origin main
```

## 📊 文件大小统计

### 第一次提交（估算）：
- 代码文件: ~500KB
- 配置文件: ~100KB
- 小图标: ~50KB
- **总计**: ~650KB

### 第二次提交（估算）：
- 音频文件: ~15MB
- 视频文件: ~560KB
- 图片文件: ~5MB
- **总计**: ~20MB

## 🎯 优势

1. **避免大文件问题**: 单次提交大小合理
2. **快速部署**: 第一次提交后即可部署基础功能
3. **渐进式加载**: 媒体文件可以后续添加
4. **版本控制**: 代码和资源分离，便于管理

## ⚠️ 注意事项

1. 第一次提交后，网站可以正常访问，但媒体文件会显示加载失败
2. 第二次提交后，所有功能完整可用
3. 如需修改媒体文件包含规则，编辑 `scripts/manage-media.js`
