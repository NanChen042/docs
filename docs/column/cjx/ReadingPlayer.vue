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
  <div class="floating-container">
    <!-- 展开的控制面板 -->
    <Transition
      enter-active-class="panel-enter-active"
      enter-from-class="panel-enter-from"
      enter-to-class="panel-enter-to"
      leave-active-class="panel-leave-active"
      leave-from-class="panel-leave-from"
      leave-to-class="panel-leave-to"
    >
      <div v-if="isExpanded" class="control-panel">
        <!-- 标题 -->
        <div class="panel-header">
          <div class="title-section">
            <div class="status-dot"></div>
            <span class="title-text">听我朗读（这太抽象了）</span>
          </div>
          <button @click="isExpanded = false" class="close-button">
            <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- 播放控制 -->
        <div class="play-controls">
          <button
            @click="togglePlay"
            :disabled="isLoading || hasError"
            class="control-button"
          >
            <!-- 播放图标 -->
            <svg v-if="!isPlaying" class="play-svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <!-- 暂停图标 -->
            <svg v-else class="pause-svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <!-- 进度信息 -->
          <div class="progress-section">
            <div class="time-info">
              <span v-if="hasError" class="error-text">{{ errorMessage }}</span>
              <span v-else-if="isLoading">加载中...</span>
              <span v-else>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
            </div>

            <!-- 进度条 -->
            <div class="progress-track" @click="seekTo">
              <div
                class="progress-fill"
                :class="{ 'error': hasError }"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 状态提示 -->
        <div class="status-text">
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
      class="main-button"
      :class="{ 'expanded': isExpanded }"
    >
      <!-- 阅读图标 -->
      <svg v-if="!isExpanded" class="read-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
      <!-- 关闭图标 -->
      <svg v-else class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>

      <!-- 播放状态指示器 -->
      <div v-if="isPlaying" class="playing-indicator">
        <div class="pulse-dot"></div>
      </div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
// ========== 变量定义 ==========
$blue-500: #3b82f6;
$blue-600: #2563eb;
$green-500: #10b981;
$white: #ffffff;
$gray-200: #e5e7eb;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$red-500: #ef4444;

// ========== 悬浮容器 ==========
.floating-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

// ========== 过渡动画 ==========
.panel-enter-active {
  transition: all 0.3s ease-out;
}

.panel-enter-from {
  opacity: 0;
  transform: translateY(1rem) scale(0.95);
}

.panel-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.panel-leave-active {
  transition: all 0.2s ease-in;
}

.panel-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.panel-leave-to {
  opacity: 0;
  transform: translateY(1rem) scale(0.95);
}

// ========== 控制面板 ==========
.control-panel {
  background: $white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid $gray-200;
  padding: 1rem;
  width: 20rem;

  @media (min-width: 640px) {
    width: 24rem;
  }
}

// ========== 面板头部 ==========
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: $green-500;
}

.title-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: $gray-700;
}

.close-button {
  color: $gray-400;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: $gray-600;
  }
}

.close-icon {
  width: 1rem;
  height: 1rem;
}

// ========== 播放控制 ==========
.play-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.control-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $blue-500;
  color: $white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $blue-600;
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.play-svg {
  width: 1rem;
  height: 1rem;
  margin-left: 0.125rem;
}

.pause-svg {
  width: 1rem;
  height: 1rem;
}

// ========== 进度区域 ==========
.progress-section {
  flex: 1;
}

.time-info {
  font-size: 0.75rem;
  color: $gray-600;
  margin-bottom: 0.25rem;

  .error-text {
    color: $red-500;
  }
}

.progress-track {
  width: 100%;
  height: 0.25rem;
  background: $gray-200;
  border-radius: 9999px;
  overflow: hidden;
  cursor: pointer;
}

.progress-fill {
  height: 0.25rem;
  background: $blue-500;
  transition: all 0.3s ease;

  &.error {
    background: $red-500;
  }
}

// ========== 状态文本 ==========
.status-text {
  font-size: 0.75rem;
  color: $gray-500;
}

// ========== 主按钮 ==========
.main-button {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: $blue-500;
  color: $white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background: $blue-600;
  }

  &:active {
    transform: scale(0.95);
  }

  &.expanded {
    background: $blue-600;
  }
}

.read-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.collapse-icon {
  width: 1.25rem;
  height: 1.25rem;
}

// ========== 播放指示器 ==========
.playing-indicator {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1rem;
  height: 1rem;
  background: $green-500;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: $white;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// ========== 响应式设计 ==========
@media (max-width: 640px) {
  .floating-container {
    bottom: 1rem;
    right: 1rem;
  }

  .control-panel {
    width: calc(100vw - 3rem);
    max-width: 20rem;
  }
}
</style>
