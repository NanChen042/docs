<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

// 音频播放状态
const isPlaying = ref(false);
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref("");
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);

// 音频元素引用
const audioRef = ref<HTMLAudioElement | null>(null);

// 悬浮按钮展开状态
const isExpanded = ref(false);

// 音频文件路径 - 阅读文章的录音
const readingAudioSrc = "/docs/audio/男生给女生的深情信件.m4a"; // 阅读录音文件

// 定义事件，用于与主播放器通信
const emit = defineEmits<{
  playingStateChanged: [isPlaying: boolean]
}>();

// 接收来自父组件的播放状态变化
const props = defineProps<{
  mainPlayerPlaying?: boolean;
}>();

// 监听主播放器状态变化
watch(() => props.mainPlayerPlaying, (newVal) => {
  if (newVal && isPlaying.value) {
    // 主播放器开始播放，暂停阅读播放器
    pauseReading();
  }
});

onMounted(() => {
  initAudio();
});

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause();
  }
});

function initAudio() {
  if (audioRef.value) {
    // 加载开始
    audioRef.value.addEventListener('loadstart', () => {
      isLoading.value = true;
      hasError.value = false;
    });
    
    // 加载完成
    audioRef.value.addEventListener('loadedmetadata', () => {
      duration.value = audioRef.value?.duration || 0;
      isLoading.value = false;
    });
    
    // 时间更新
    audioRef.value.addEventListener('timeupdate', () => {
      if (audioRef.value) {
        currentTime.value = audioRef.value.currentTime;
        progress.value = (currentTime.value / duration.value) * 100;
      }
    });
    
    // 播放结束
    audioRef.value.addEventListener('ended', () => {
      isPlaying.value = false;
      progress.value = 0;
      currentTime.value = 0;
      emit('playingStateChanged', false);
    });
    
    // 错误处理
    audioRef.value.addEventListener('error', (e) => {
      hasError.value = true;
      isLoading.value = false;
      isPlaying.value = false;
      errorMessage.value = "阅读音频文件加载失败";
      console.error('阅读音频加载错误:', e);
    });
  }
}

async function togglePlay() {
  if (!audioRef.value) return;
  
  try {
    if (isPlaying.value) {
      pauseReading();
    } else {
      // 通知主播放器暂停
      emit('playingStateChanged', true);
      await audioRef.value.play();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error('播放阅读音频时出错:', error);
    hasError.value = true;
    errorMessage.value = "播放失败";
  }
}

function pauseReading() {
  if (audioRef.value) {
    audioRef.value.pause();
    isPlaying.value = false;
    emit('playingStateChanged', false);
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function seekTo(event: MouseEvent) {
  if (!audioRef.value || !duration.value) return;
  
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const seekTime = (clickX / width) * duration.value;
  
  audioRef.value.currentTime = seekTime;
}
</script>

<template>
  <!-- 隐藏的音频元素 -->
  <audio 
    ref="audioRef" 
    :src="readingAudioSrc" 
    preload="metadata"
    crossorigin="anonymous"
  ></audio>

  <!-- 悬浮按钮容器 -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <!-- 展开的控制面板 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-y-4 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform translate-y-4 scale-95"
    >
      <div 
        v-if="isExpanded" 
        class="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-80 sm:w-96"
      >
        <!-- 标题 -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span class="text-sm font-medium text-gray-700">听我朗读（这太抽象了）</span>
          </div>
          <button 
            @click="isExpanded = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- 播放控制 -->
        <div class="flex items-center gap-3 mb-3">
          <button
            @click="togglePlay"
            :disabled="isLoading || hasError"
            class="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white shadow-md hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <!-- 播放图标 -->
            <svg v-if="!isPlaying" class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <!-- 暂停图标 -->
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <!-- 进度信息 -->
          <div class="flex-1">
            <div class="text-xs text-gray-600 mb-1">
              <span v-if="hasError" class="text-red-500">{{ errorMessage }}</span>
              <span v-else-if="isLoading">加载中...</span>
              <span v-else>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
            </div>
            
            <!-- 进度条 -->
            <div 
              class="w-full h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
              @click="seekTo"
            >
              <div
                class="h-1 transition-all"
                :class="hasError ? 'bg-red-500' : 'bg-blue-500'"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 状态提示 -->
        <div class="text-xs text-gray-500">
          <span v-if="isPlaying">正在播放阅读内容</span>
          <span v-else-if="hasError">播放出错</span>
          <span v-else-if="isLoading">准备中...</span>
          <span v-else>点击播放按钮开始阅读</span>
        </div>
      </div>
    </Transition>

    <!-- 主悬浮按钮 -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center group"
      :class="{ 'bg-blue-600': isExpanded }"
    >
      <!-- 阅读图标 -->
      <svg v-if="!isExpanded" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
      <!-- 关闭图标 -->
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
      
      <!-- 播放状态指示器 -->
      <div 
        v-if="isPlaying" 
        class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
      >
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    </button>
  </div>
</template>

<style scoped>
/* 手机端适配 */
@media (max-width: 640px) {
  .fixed {
    bottom: 1rem;
    right: 1rem;
  }
  
  .w-80 {
    width: calc(100vw - 3rem);
    max-width: 20rem;
  }
}
</style>
