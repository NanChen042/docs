<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <!-- Header -->
    <header class="glass-card border-0 border-b border-slate-200 border-opacity-50 sticky top-0 z-1">
      <div class="max-w-1400 mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lottie Showcase
            </h1>
            <p class="text-slate-600 mt-1">现代化动画展示库</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <svg class="text-slate-400 w-4 h-4 absolute  left-3 top-1/2 -translate-y-1/2  z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input v-model="searchTerm" placeholder="搜索动画..." class="pl-10 w-64 glass-card border-slate-200 border-opacity-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20" />
            </div>
            <div class="flex items-center gap-2">
              <button :class="['glass-hover px-3 py-2 rounded-lg text-sm font-medium transition-all', viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white bg-opacity-50 text-slate-600 border border-slate-200 border-opacity-50']" @click="viewMode = 'grid'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button :class="['glass-hover px-3 py-2 rounded-lg text-sm font-medium transition-all', viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white bg-opacity-50 text-slate-600 border border-slate-200 border-opacity-50']" @click="viewMode = 'list'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-1400 mx-auto px-6 py-8">
      <!-- Filters -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          <span class="font-medium text-slate-700">分类</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="category in categories" :key="category" :class="['glass-hover rounded-full px-4 py-2 text-sm font-medium transition-all', selectedCategory === category ? 'bg-blue-600 text-white shadow-lg shadow-blue-600 shadow-opacity-25' : 'bg-white bg-opacity-50 text-slate-600 border border-slate-200 border-opacity-50']" @click="selectedCategory = category">
            {{ category }}
          </button>
        </div>
      </div>

      <!-- Animation Grid -->
      <div :class="[
        'grid gap-6',
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
      ]">
        <div v-for="animation in filteredAnimations" :key="animation.id" class="glass-card glass-hover border-slate-200 border-opacity-50 overflow-hidden cursor-pointer group rounded-xl" @click="selectedAnimation = animation" @mouseenter="playAnimation(animation.id)" @mouseleave="pauseAnimation(animation.id)">
          <div class="relative">
            <div class="w-full h-48 flex items-center justify-center relative z-10">
              <DotLottieVue :ref="el => setAnimationRef(el, animation.id)" :src="animation.src" :autoplay="false" :loop="animation.loop" class="w-32 h-32" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent);" />
            <div class="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="flex items-center gap-2">
                <button class="glass-card px-3 py-2 rounded-lg text-slate-600 hover:bg-white hover:bg-opacity-20 transition-all" @click.stop="resetAnimation(animation.id)" title="重置动画">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
                <div class="glass-card px-3 py-2 rounded-lg text-slate-600 text-xs">
                  悬停播放
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 relative z-10">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-lg text-slate-800">{{ animation.title }}</h3>
              <span class="text-xs font-medium flex items-center justify-center px-[20px] py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-200 transition-colors duration-200">
                {{ animation.category }}
              </span>


            </div>
            <p class="text-slate-600 text-sm mb-3">{{ animation.description }}</p>
            <div class="flex flex-wrap gap-2 mb-3">
              <span v-for="tag in animation.tags.slice(0, 3)" :key="tag" class="text-xs font-medium  py-1 rounded-full
           bg-gradient-to-r from-blue-50 to-blue-100
           text-blue-700 border border-blue-200 shadow-sm
           hover:from-blue-100 hover:to-blue-200 hover:shadow-md
           transition-all duration-200 cursor-default px-2">
                {{ tag }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>{{ animation.author }}</span>
              <span>{{ animation.downloads.toLocaleString() }} 下载</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredAnimations.length === 0" class="text-center py-12">
        <div class="text-slate-400 mb-4">
          <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-lg">未找到动画</p>
          <p class="text-sm">请尝试调整搜索条件</p>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedAnimation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="selectedAnimation = null">
      <div class="glass-card border-slate-200 border-opacity-50 max-w-4xl w-full rounded-2xl overflow-hidden" @click.stop>
        <div class="p-6 border-b border-slate-200 border-opacity-50">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-slate-800">{{ selectedAnimation.title }}</h2>
            <button class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" @click="selectedAnimation = null">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-6 p-6">
          <div class="space-y-4">
            <div class="relative rounded-lg overflow-hidden aspect-square flex items-center justify-center">
              <DotLottieVue :src="selectedAnimation.src" :autoplay="true" :loop="true" class="w-64 h-64" />
            </div>
            <div class="flex items-center gap-2">
              <button class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                下载
              </button>
              <button class="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                收藏
              </button>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold mb-2 text-slate-800">描述</h4>
              <p class="text-slate-600">{{ selectedAnimation.description }}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-2 text-slate-800">详细信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-500">作者:</span>
                  <span class="text-slate-700">{{ selectedAnimation.author }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">时长:</span>
                  <span class="text-slate-700">{{ selectedAnimation.duration }}秒</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">下载数:</span>
                  <span class="text-slate-700">{{ selectedAnimation.downloads.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">分类:</span>
                  <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{{ selectedAnimation.category }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-2 text-slate-800">标签</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in selectedAnimation.tags" :key="tag" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-200">
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
<style scoped>
/* 自定义玻璃效果 - 保留特殊的玻璃卡片效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.1) 100%);
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
}

.glass-hover:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.glass-hover:hover::before {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.2) 100%);
}



</style>
