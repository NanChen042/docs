<template>
  <div class="lottie-showcase">
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <div class="header-content">
          <div class="header-left">
            <h1 class="title">
              Lottie Showcase
            </h1>
            <p class="subtitle">现代化动画展示库</p>
          </div>
          <div class="header-right">
            <div class="search-container">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="searchTerm" placeholder="搜索动画..." class="search-input" />
            </div>
            <div class="view-controls">
              <button :class="['view-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">
                <svg class="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button :class="['view-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">
                <svg class="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="main-container">
      <!-- Filters -->
      <div class="filters-section">
        <div class="filters-header">
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          <span class="filter-label">分类</span>
        </div>
        <div class="category-buttons">
          <button v-for="category in categories" :key="category" :class="['category-btn', { active: selectedCategory === category }]" @click="selectedCategory = category">
            {{ category }}
          </button>
        </div>
      </div>

      <!-- Animation Grid -->
      <div :class="['animations-grid', { 'grid-view': viewMode === 'grid', 'list-view': viewMode === 'list' }]">
        <div v-for="animation in filteredAnimations" :key="animation.id" class="animation-card" @click="selectedAnimation = animation" @mouseenter="playAnimation(animation.id)" @mouseleave="pauseAnimation(animation.id)">
          <div class="animation-preview">
            <div class="animation-container">
              <DotLottieVue :ref="el => setAnimationRef(el, animation.id)" :src="animation.src" :autoplay="false" :loop="animation.loop" class="animation-player" />
            </div>
            <div class="animation-overlay">
              <div class="animation-controls">
                <button class="control-btn reset-btn" @click.stop="resetAnimation(animation.id)" title="重置动画">
                  <svg class="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
                <div class="control-tip">
                  悬停播放
                </div>
              </div>
            </div>
          </div>
          <div class="animation-info">
            <div class="info-header">
              <h3 class="animation-title">{{ animation.title }}</h3>
              <span class="animation-category">
                {{ animation.category }}
              </span>
            </div>
            <p class="animation-description">{{ animation.description }}</p>
            <div class="animation-tags">
              <span v-for="tag in animation.tags.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            <div class="animation-meta">
              <span class="author">{{ animation.author }}</span>
              <span class="downloads">{{ animation.downloads.toLocaleString() }} 下载</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredAnimations.length === 0" class="no-results">
        <div class="no-results-content">
          <svg class="no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="no-results-title">未找到动画</p>
          <p class="no-results-subtitle">请尝试调整搜索条件</p>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedAnimation" class="modal-overlay" @click="selectedAnimation = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedAnimation.title }}</h2>
          <button class="modal-close" @click="selectedAnimation = null">
            <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-left">
            <div class="modal-animation">
              <DotLottieVue :src="selectedAnimation.src" :autoplay="true" :loop="true" class="modal-player" />
            </div>
            <div class="modal-actions">
              <button class="action-btn primary">
                下载
              </button>
              <button class="action-btn secondary">
                收藏
              </button>
            </div>
          </div>
          <div class="modal-right">
            <div class="modal-section">
              <h4 class="section-title">描述</h4>
              <p class="section-content">{{ selectedAnimation.description }}</p>
            </div>
            <div class="modal-section">
              <h4 class="section-title">详细信息</h4>
              <div class="detail-list">
                <div class="detail-item">
                  <span class="detail-label">作者:</span>
                  <span class="detail-value">{{ selectedAnimation.author }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">时长:</span>
                  <span class="detail-value">{{ selectedAnimation.duration }}秒</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">下载数:</span>
                  <span class="detail-value">{{ selectedAnimation.downloads.toLocaleString() }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">分类:</span>
                  <span class="detail-category">{{ selectedAnimation.category }}</span>
                </div>
              </div>
            </div>
            <div class="modal-section">
              <h4 class="section-title">标签</h4>
              <div class="modal-tags">
                <span v-for="tag in selectedAnimation.tags" :key="tag" class="modal-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

// 动画数据配置（修正版）
const animations = reactive([
  {
    id: 'confetti',
    title: '🎊 彩带庆祝',
    description: '节日庆祝必备动画效果',
    category: 'UI要素',
    src: 'https://assets-v2.lottiefiles.com/a/b48a863e-1150-11ee-8fb8-9fe971b7941f/VM0SBaYaJU.lottie',
    loop: true,
    duration: 2.5,
    tags: ['庆祝', '节日', '彩带'],
    author: '设计师A',
    downloads: 1250
  },
  {
    id: 'loading',
    title: '⏳ 加载动画',
    description: '优雅的页面加载指示器',
    category: 'UI要素',
    src: 'https://assets-v2.lottiefiles.com/a/85fcf3b8-1470-11f0-b47e-6bff142303bc/7tiFC8pqsc.lottie',
    loop: true,
    duration: 1.8,
    tags: ['加载', '等待', '进度'],
    author: '设计师B',
    downloads: 890
  },
  {
    id: 'girl-flag',
    title: '🚩 女孩挥旗',
    description: '生动的人物动画展示',
    category: '人物',
    src: 'https://assets-v2.lottiefiles.com/a/0d10d4f2-904a-11ee-bc21-5353b556d566/zudjS9awWf.lottie',
    loop: true,
    duration: 4.2,
    tags: ['人物', '旗帜', '动作'],
    author: '设计师C',
    downloads: 2100
  },
  {
    id: 'coin',
    title: '🪙 3D金币',
    description: '炫酷的3D金币旋转效果',
    category: '图标',
    src: 'https://assets-v2.lottiefiles.com/a/87edfc14-1169-11ee-a24d-2b3376e52a30/UCMZxYidF1.lottie',
    loop: true,
    duration: 1.5,
    tags: ['金币', '3D', '旋转'],
    author: '设计师D',
    downloads: 1680
  },
  {
    id: 'cool-text',
    title: '😎 酷炫文字',
    description: '动态文字特效展示',
    category: '文字',
    src: 'https://assets-v2.lottiefiles.com/a/e4c39d10-0225-11ef-ac9f-c7a83621d906/4cyJfJzbvT.lottie',
    loop: true,
    duration: 3.0,
    tags: ['文字', '特效', '酷炫'],
    author: '设计师E',
    downloads: 950
  },
  {
    id: 'euphoria',
    title: '✨ 欢欣鼓舞',
    description: '表达愉悦心情的动画',
    category: '情感',
    src: 'https://assets-v2.lottiefiles.com/a/d0ed1bc4-fbfc-11ee-8b47-37ba63b57f9d/8da233lrRu.lottie',
    loop: true,
    duration: 2.8,
    tags: ['情感', '快乐', '心情'],
    author: '设计师F',
    downloads: 1420
  },
  {
    id: 'loading-3d',
    title: '🔄 3D加载文字',
    description: '立体感十足的加载动画',
    category: 'UI要素',
    src: 'https://assets-v2.lottiefiles.com/a/edf688b6-1176-11ee-b4c6-ef4f4d7d8427/aQS8MaN8TA.lottie',
    loop: true,
    duration: 2.2,
    tags: ['3D', '加载', '文字'],
    author: '设计师G',
    downloads: 1850
  },
  {
    id: 'scooter',
    title: '🛵 摩托车骑行',
    description: '有趣的交通工具动画',
    category: '交通',
    src: 'https://assets-v2.lottiefiles.com/a/21294abe-116f-11ee-b8a4-4761e6ba97bd/Ruwto6sR6D.lottie',
    loop: true,
    duration: 3.5,
    tags: ['交通', '骑行', '人物'],
    author: '设计师H',
    downloads: 1120
  },
  {
    id: 'thumbs-up',
    title: '👍 点赞动画',
    description: '社交媒体点赞效果',
    category: '社交',
    src: 'https://assets1.lottiefiles.com/packages/lf20_puciaact.json',
    loop: false,
    duration: 1.5,
    tags: ['点赞', '社交', '互动'],
    author: '设计师V',
    downloads: 2800
  },
  {
    id: 'shopping-cart',
    title: '🛒 购物车动画',
    description: '电商购物车添加动画',
    category: '电商',
    src: 'https://assets5.lottiefiles.com/packages/lf20_qmfs6c3i.json',
    loop: false,
    duration: 2.2,
    tags: ['购物', '电商', '购物车'],
    author: '设计师N',
    downloads: 2650
  },
  {
    id: 'email-send',
    title: '✉️ 邮件发送',
    description: '邮件发送成功动画',
    category: '通讯',
    src: 'https://assets2.lottiefiles.com/packages/lf20_8wREpI.json',
    loop: false,
    duration: 2.5,
    tags: ['邮件', '发送', '通讯'],
    author: '设计师W',
    downloads: 2100
  },
  {
    id: 'download-file',
    title: '📥 文件下载',
    description: '文件下载进度动画',
    category: 'UI要素',
    src: 'https://assets3.lottiefiles.com/packages/lf20_khzniaya.json',
    loop: false,
    duration: 3.0,
    tags: ['下载', '文件', '进度'],
    author: '设计师X',
    downloads: 1750
  },
  {
    id: 'spaceman',
    title: '👩🚀 小太空人',
    description: '可爱的小太空人动画',
    category: '人物',
    src: 'https://assets3.lottiefiles.com/packages/lf20_ydo1amjm.json',
    loop: true,
    duration: 3.5,
    tags: ['人物', '太空人', '动画'],
    author: '设计师M',
    downloads: 1780
  },
  {
    id: 'music-wave',
    title: '🎵 音乐波形',
    description: '音乐播放时的波形动画',
    category: '娱乐',
    src: 'https://assets8.lottiefiles.com/packages/lf20_9wpyhdzo.json',
    loop: true,
    duration: 2.0,
    tags: ['音乐', '波形', '播放器'],
    author: '设计师Q',
    downloads: 1480
  }
]);

const categories = ['全部', 'UI要素', '图标', '人物', '文字', '情感', '交通', '社交', '电商', '通讯', '天气', '娱乐'];


// 状态管理
const selectedCategory = ref('全部');
const searchTerm = ref('');
const viewMode = ref<'grid' | 'list'>('grid');
const selectedAnimation = ref<any>(null);
const isPlaying = ref<{ [key: string]: boolean }>({});
const animationRefs = ref<{ [key: string]: any }>({});

// 计算属性
const filteredAnimations = computed(() => {
  return animations.filter((animation) => {
    const matchesCategory = selectedCategory.value === '全部' || animation.category === selectedCategory.value;
    const matchesSearch =
      animation.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      animation.tags.some((tag) => tag.toLowerCase().includes(searchTerm.value.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
});

// 方法
const setAnimationRef = (el: any, id: string) => {
  if (el) {
    animationRefs.value[id] = el;
    // 确保动画初始状态为停止
    const dotLottie = el.getDotLottieInstance();
    if (dotLottie) {
      dotLottie.stop();
      isPlaying.value[id] = false;
    }
  }
};



const resetAnimation = (id: string) => {
  const animationRef = animationRefs.value[id];
  if (!animationRef) return;

  const dotLottie = animationRef.getDotLottieInstance();
  dotLottie.stop();
  isPlaying.value[id] = false;
};

// 鼠标悬停播放动画
const playAnimation = (id: string) => {
  const animationRef = animationRefs.value[id];
  if (!animationRef) return;

  const dotLottie = animationRef.getDotLottieInstance();
  dotLottie.play();
  isPlaying.value[id] = true;
};

// 鼠标移出暂停动画
const pauseAnimation = (id: string) => {
  const animationRef = animationRefs.value[id];
  if (!animationRef) return;

  const dotLottie = animationRef.getDotLottieInstance();
  dotLottie.pause();
  isPlaying.value[id] = false;
};
</script>
<style lang="scss" scoped>
// ========== 变量定义 ==========
$primary-blue: #2563eb;
$primary-blue-hover: #1d4ed8;
$primary-blue-light: #3b82f6;
$slate-50: #f8fafc;
$slate-100: #f1f5f9;
$slate-200: #e2e8f0;
$slate-300: #cbd5e1;
$slate-400: #94a3b8;
$slate-500: #64748b;
$slate-600: #475569;
$slate-700: #334155;
$slate-800: #1e293b;
$blue-50: #eff6ff;
$blue-100: #dbeafe;
$blue-200: #bfdbfe;
$blue-600: #2563eb;
$blue-700: #1d4ed8;
$purple-50: #faf5ff;
$purple-600: #9333ea;

$glass-bg: rgba(255, 255, 255, 0.8);
$glass-border: rgba(255, 255, 255, 0.2);
$glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 16px rgba(0, 0, 0, 0.05);

// ========== 主容器 ==========
.lottie-showcase {
  min-height: 100vh;
  background: linear-gradient(135deg, $slate-50 0%, $blue-50 50%, $purple-50 100%);
}

// ========== 头部样式 ==========
.header {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid $glass-border;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid rgba($slate-200, 0.5);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: $glass-shadow;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  .title {
    font-size: 1.875rem;
    font-weight: 700;
    background: linear-gradient(to right, $blue-600, $purple-600);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    margin: 0;
  }

  .subtitle {
    color: $slate-600;
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

// ========== 搜索框 ==========
.search-container {
  position: relative;

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
    color: $slate-400;
    z-index: 10;
  }

  .search-input {
    padding-left: 2.5rem;
    width: 16rem;
    background: $glass-bg;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba($slate-200, 0.5);
    border-radius: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-right: 0.75rem;
    font-size: 0.875rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba($primary-blue, 0.2);
      border-color: $primary-blue;
    }

    &::placeholder {
      color: $slate-400;
    }
  }
}

// ========== 视图控制按钮 ==========
.view-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-btn {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba($slate-200, 0.5);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: $slate-600;
  cursor: pointer;
  transition: all 0.3s ease;

  .view-icon {
    width: 1rem;
    height: 1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background: $primary-blue;
    color: white;
    border-color: $primary-blue;
  }
}

// ========== 主内容区域 ==========
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
}

// ========== 过滤器区域 ==========
.filters-section {
  margin-bottom: 2rem;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  .filter-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: $slate-500;
  }

  .filter-label {
    font-weight: 500;
    color: $slate-700;
  }
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-btn {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba($slate-200, 0.5);
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: $slate-600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background: $primary-blue;
    color: white;
    box-shadow: 0 10px 15px -3px rgba($primary-blue, 0.25);
  }
}

// ========== 动画网格 ==========
.animations-grid {
  display: grid;
  gap: 1.5rem;

  &.grid-view {
    grid-template-columns: repeat(1, minmax(0, 1fr));

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (min-width: 1280px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  &.list-view {
    grid-template-columns: 1fr;
  }
}

// ========== 动画卡片 ==========
.animation-card {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid $glass-border;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: $glass-shadow;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

    .animation-overlay {
      opacity: 1;
    }
  }
}

// ========== 动画预览区域 ==========
.animation-preview {
  position: relative;
  height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.animation-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.animation-player {
  width: 8rem;
  height: 8rem;
}

.animation-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.animation-controls {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid $glass-border;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: $slate-600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .control-icon {
    width: 1rem;
    height: 1rem;
  }
}

.control-tip {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid $glass-border;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: $slate-600;
  font-size: 0.75rem;
}

// ========== 动画信息区域 ==========
.animation-info {
  padding: 1rem;
  position: relative;
  z-index: 10;
}

.info-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.animation-title {
  font-weight: 600;
  font-size: 1.125rem;
  color: $slate-800;
  margin: 0;
}

.animation-category {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 1.25rem;
  border-radius: 0.75rem;
  background: $slate-100;
  color: $slate-700;
  border: 1px solid $slate-300;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: $slate-200;
  }
}

.animation-description {
  color: $slate-600;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.animation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(to right, $blue-50, $blue-100);
  color: $blue-700;
  border: 1px solid $blue-200;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: default;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(to right, $blue-100, $blue-200);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.animation-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: $slate-500;

  .author, .downloads {
    margin: 0;
  }
}

// ========== 无结果状态 ==========
.no-results {
  text-align: center;
  padding: 3rem 0;
}

.no-results-content {
  color: $slate-400;
  margin-bottom: 1rem;
}

.no-results-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.no-results-title {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.no-results-subtitle {
  font-size: 0.875rem;
  margin: 0;
}

// ========== 模态框样式 ==========
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid $glass-border;
  max-width: 64rem;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba($slate-200, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: $slate-800;
  margin: 0;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: $slate-100;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $slate-200;
  }

  .close-icon {
    width: 1rem;
    height: 1rem;
  }
}

.modal-body {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.modal-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-animation {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($slate-100, 0.5);
}

.modal-player {
  width: 16rem;
  height: 16rem;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &.primary {
    background: $primary-blue;
    color: white;

    &:hover {
      background: $primary-blue-hover;
    }
  }

  &.secondary {
    background: transparent;
    color: $slate-700;
    border: 1px solid $slate-200;

    &:hover {
      background: $slate-50;
    }
  }
}

.modal-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-section {
  .section-title {
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: $slate-800;
  }

  .section-content {
    color: $slate-600;
    margin: 0;
    line-height: 1.5;
  }
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: $slate-500;
}

.detail-value {
  color: $slate-700;
}

.detail-category {
  font-size: 0.75rem;
  background: $slate-100;
  color: $slate-600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.modal-tag {
  font-size: 0.75rem;
  background: $blue-50;
  color: $blue-600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid $blue-200;
}
</style>
