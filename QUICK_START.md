# 🚀 快速开始指南

## 📦 分两次提交的简化流程

### 第一次提交：代码结构
```bash
# 1. 排除媒体文件
pnpm run commit:code

# 2. 提交代码
git add .
git commit -m "feat: 初始化项目结构和代码

- 添加 VitePress 文档站点配置
- 实现音频播放器组件 
- 添加拖拽悬浮播放器功能
- 配置主题和样式
- 添加项目基础结构"

# 3. 推送到远程
git push origin main
```

### 第二次提交：媒体文件
```bash
# 1. 包含媒体文件
pnpm run commit:media

# 2. 提交媒体文件
git add .
git commit -m "feat: 添加项目媒体文件

- 添加音频文件 (mp3, m4a)
- 添加视频文件 (mp4) 
- 添加图片资源 (jpg, png)
- 完善项目资源文件"

# 3. 推送到远程
git push origin main
```

## 🛠️ 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run docs:dev

# 构建项目
pnpm run docs:build

# 部署到 GitHub Pages
pnpm run deploy
```

## 📁 项目结构

```
docs/
├── .vitepress/           # VitePress 配置
│   ├── config.mts        # 站点配置
│   └── theme/            # 自定义主题
├── column/
│   └── cjx/              # 陈佳欣专栏
│       ├── index.md      # 主页面
│       ├── Cjx.vue       # 音频播放器页面
│       ├── ReadingPlayer.vue  # 拖拽悬浮播放器
│       └── assets/       # 媒体资源
└── public/               # 静态资源
```

## 🎯 主要功能

- 🎵 **音频播放器**: 支持音频播放、进度控制、频谱可视化
- 🎬 **视频播放**: 支持视频文件播放
- 📱 **拖拽播放器**: 可拖拽的悬浮音频播放器
- 🎨 **响应式设计**: 适配桌面和移动端
- 📖 **文档站点**: 基于 VitePress 的文档系统

## ⚠️ 注意事项

1. **媒体文件**: 第一次提交会排除所有媒体文件
2. **构建时间**: 包含媒体文件后构建时间会增加
3. **文件大小**: 确保单个文件不超过 100MB
4. **网络**: 媒体文件较大，上传可能需要较长时间
