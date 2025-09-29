<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import ReadingPlayer from "./ReadingPlayer.vue";

const isPlaying = ref(false);
const progress = ref(0);
const currentTime = ref(0);
const duration = ref(0);
const audioRef = ref<HTMLAudioElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const audioContext = ref<AudioContext | null>(null);
const analyser = ref<AnalyserNode | null>(null);
const dataArray = ref<Uint8Array | null>(null);
const animationId = ref<number | null>(null);

// 音频播放列表
interface AudioTrack {
  id: number;
  title: string;
  artist: string;
  src: string;
}

const audioTracks = ref<AudioTrack[]>([
  {
    id: 1,
    title: "恋人",
    artist: "李荣浩 - 恋人 (伴奏)",
    src: "./assets/audio/李荣浩 - 恋人 (伴奏)_L.mp3"
  },
  {
    id: 2,
    title: "Count On Me",
    artist: "Connie Talbot",
    src: "./assets/audio/Connie Talbot - Count On Me_H.mp3"
  },

  {
    id: 3,
    title: "해리안 윤소안",
    artist: "해리안 윤소안 _ Andreas Carlsson",
    src: "./assets/audio/해리안 윤소안.mp3"
  },
  {
    id: 4,
    title: "Standing Egg - 오 잠깐",
    artist: "Standing Egg - 오 잠깐",
    src: "./assets/audio/Standing Egg - 오 잠깐_H.mp3"
  },
  {
    id: 5,
    title: "温柔",
    artist: "逗逗一米八 - 温柔 (吉他女声)",
    src: "./assets/audio/逗逗一米八 - 温柔 (吉他女声)_L.mp3"
  },
  {
    id: 6,
    title: "流沙",
    artist: "赵乃吉 - 流沙",
    src: "./assets/audio/赵乃吉 - 流沙_H.mp3"
  },
  {
    id: 7,
    title: "角虫王态度 - 신비로운 걸 (神秘的girl) (神秘的girl) (翻自 VROMANCE)",
    artist: "角虫王态度 - 신비로운 걸 (神秘的girl) (神秘的girl) (翻自 VROMANCE)",
    src: "./assets/audio/角虫王态度 - 신비로운 걸 (神秘的girl) (神秘的girl) (翻自 VROMANCE)_L.mp3"
  },
  {
    id: 8,
    title: "青花瓷",
    artist: "5音 - 青花瓷 (钢琴版)",
    src: "./assets/audio/5音 - 青花瓷 (钢琴版)_L.mp3"
  },
  {
    id: 9,
    title: "花海",
    artist: "柳轻颂 - 花海 (钢琴版_改编版原唱_ 周杰伦)",
    src: "./assets/audio/柳轻颂 - 花海 (钢琴版_改编版原唱_ 周杰伦)_L.mp3"
  }

  
  // 可以在这里添加更多音频文件
]);

const currentTrackIndex = ref(0);
const currentTrack = ref(audioTracks.value[0]);
const audioSrc = ref(currentTrack.value.src);
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref("");

// 阅读播放器状态管理
const readingPlayerPlaying = ref(false);

// 移动端滑动切换
const touchStartX = ref(0);
const touchEndX = ref(0);

// 跑马灯动画重置
const marqueeKey = ref(0);


onMounted(() => {
  initAudio();
  setupCanvas();
  drawDefaultVisualization();

  // 监听窗口大小变化（仅在客户端）
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
  if (audioContext.value) {
    audioContext.value.close();
  }

  // 移除事件监听器（仅在客户端）
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
});

// 处理窗口大小变化
function handleResize() {
  setupCanvas();
  drawDefaultVisualization();
}


// 设置Canvas分辨率
function setupCanvas() {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const container = canvas.parentElement;
  if (!container) return;

  // 获取容器的实际尺寸
  const rect = container.getBoundingClientRect();
  const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;

  // 设置Canvas的实际分辨率
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // 缩放Canvas上下文以匹配设备像素比
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  // 设置Canvas的显示尺寸
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}

function initAudio() {
  if (audioRef.value) {
    // 设置音频源
    audioRef.value.src = audioSrc.value;

    // 加载开始 - 对于本地音频文件，通常加载很快，不显示加载状态
    audioRef.value.addEventListener('loadstart', () => {
      hasError.value = false;
      // 移除 isLoading.value = true; 避免频繁显示加载状态
    });

    // 加载完成
    audioRef.value.addEventListener('loadedmetadata', () => {
      duration.value = audioRef.value?.duration || 0;
      isLoading.value = false; // 确保加载状态重置
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
      // 恢复默认可视化效果
      drawDefaultVisualization();
      // 自动播放下一首
      nextTrack(true); // 传递 true 表示自动播放
    });

    // 错误处理
    audioRef.value.addEventListener('error', (e) => {
      hasError.value = true;
      isLoading.value = false;
      isPlaying.value = false;
      errorMessage.value = "音频文件加载失败，请检查文件路径";
      console.error('音频加载错误:', e);
    });
  }
}

async function togglePlay() {
  if (!audioRef.value) return;

  try {
    if (isPlaying.value) {
      audioRef.value.pause();
      isPlaying.value = false;
      if (animationId.value) {
        cancelAnimationFrame(animationId.value);
      }
      // 暂停时恢复默认可视化效果
      drawDefaultVisualization();
    } else {
      // 如果阅读播放器正在播放，先暂停它
      if (readingPlayerPlaying.value) {
        readingPlayerPlaying.value = false;
      }

      await audioRef.value.play();
      isPlaying.value = true;
      if (!audioContext.value) {
        await initAudioContext();
      }
      startVisualization();
    }
  } catch (error) {
    console.error('播放音频时出错:', error);
  }
}

// 处理阅读播放器状态变化
function handleReadingPlayerStateChange(playing: boolean) {
  readingPlayerPlaying.value = playing;

  // 如果阅读播放器开始播放，暂停主播放器
  if (playing && isPlaying.value) {
    if (audioRef.value) {
      audioRef.value.pause();
      isPlaying.value = false;
      if (animationId.value) {
        cancelAnimationFrame(animationId.value);
      }
      drawDefaultVisualization();
    }
  }
}

async function initAudioContext() {
  if (!audioRef.value) return;

  try {
    if (typeof window !== 'undefined') {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const source = audioContext.value.createMediaElementSource(audioRef.value);
    analyser.value = audioContext.value.createAnalyser();

    analyser.value.fftSize = 256;
    const bufferLength = analyser.value.frequencyBinCount;
    dataArray.value = new Uint8Array(bufferLength);

    source.connect(analyser.value);
    analyser.value.connect(audioContext.value.destination);
  } catch (error) {
    console.error('初始化音频上下文时出错:', error);
  }
}

function startVisualization() {
  if (!canvasRef.value || !analyser.value || !dataArray.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const draw = () => {
    if (!isPlaying.value || !analyser.value || !dataArray.value) return;

    // 获取频率数据
    const frequencyData = new Uint8Array(analyser.value.frequencyBinCount);
    analyser.value.getByteFrequencyData(frequencyData);

    // 获取显示尺寸
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = rect.width / frequencyData.length * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      barHeight = (frequencyData[i] / 255) * rect.height;

      ctx.fillStyle = `rgb(0, 0, 0)`;
      ctx.fillRect(x, rect.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    animationId.value = requestAnimationFrame(draw);
  };

  draw();
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

// 绘制默认的静态可视化效果 - 显示音符和Ready状态
function drawDefaultVisualization() {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 获取显示尺寸（而不是Canvas的实际分辨率）
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制音符图案
  drawMusicNotes(ctx, centerX, centerY);

  // 绘制Ready状态文字
  drawReadyText(ctx, centerX, centerY);
}

// 绘制音符图案
function drawMusicNotes(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  // 绘制多个音符，创建更丰富的音乐氛围

  // 第一个音符 (♪) - 左侧
  drawSingleNote(ctx, centerX - 80, centerY - 8, 0.8, 'rgba(0, 0, 0, 0.25)');

  // 第二个音符 (♪) - 左中
  drawSingleNote(ctx, centerX - 50, centerY + 2, 1.0, 'rgba(0, 0, 0, 0.35)');

  // 第三个音符组 (♫) - 中央左
  drawDoubleNote(ctx, centerX - 20, centerY - 5, 1.1, 'rgba(0, 0, 0, 0.4)');

  // 第四个音符 (♪) - 中央右
  drawSingleNote(ctx, centerX + 15, centerY + 3, 0.9, 'rgba(0, 0, 0, 0.35)');

  // 第五个音符 (♪) - 右中
  drawSingleNote(ctx, centerX + 45, centerY - 6, 1.0, 'rgba(0, 0, 0, 0.3)');

  // 第六个音符 (♪) - 右侧
  drawSingleNote(ctx, centerX + 75, centerY + 1, 0.8, 'rgba(0, 0, 0, 0.25)');

  // 添加一些小装饰音符
  drawSmallNote(ctx, centerX - 100, centerY - 15, 0.6, 'rgba(0, 0, 0, 0.15)');
  drawSmallNote(ctx, centerX + 95, centerY - 12, 0.6, 'rgba(0, 0, 0, 0.15)');
  drawSmallNote(ctx, centerX - 35, centerY + 18, 0.5, 'rgba(0, 0, 0, 0.2)');
  drawSmallNote(ctx, centerX + 30, centerY + 20, 0.5, 'rgba(0, 0, 0, 0.2)');
}

// 绘制单个音符
function drawSingleNote(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;

  const size = scale;

  // 音符头部 (椭圆)
  ctx.beginPath();
  ctx.ellipse(x, y + 8 * size, 4 * size, 3 * size, Math.PI * 0.3, 0, 2 * Math.PI);
  ctx.fill();

  // 音符杆
  ctx.fillRect(x + 3 * size, y - 12 * size, 1.5 * size, 20 * size);

  // 音符旗帜
  ctx.beginPath();
  ctx.moveTo(x + 4.5 * size, y - 12 * size);
  ctx.quadraticCurveTo(x + 12 * size, y - 8 * size, x + 8 * size, y - 2 * size);
  ctx.quadraticCurveTo(x + 6 * size, y - 6 * size, x + 4.5 * size, y - 8 * size);
  ctx.fill();
}

// 绘制双音符
function drawDoubleNote(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;

  const size = scale;

  // 第一个音符头部
  ctx.beginPath();
  ctx.ellipse(x, y + 8 * size, 4 * size, 3 * size, Math.PI * 0.3, 0, 2 * Math.PI);
  ctx.fill();

  // 第二个音符头部
  ctx.beginPath();
  ctx.ellipse(x + 8 * size, y + 5 * size, 4 * size, 3 * size, Math.PI * 0.3, 0, 2 * Math.PI);
  ctx.fill();

  // 音符杆
  ctx.fillRect(x + 3 * size, y - 12 * size, 1.5 * size, 20 * size);
  ctx.fillRect(x + 11 * size, y - 9 * size, 1.5 * size, 14 * size);

  // 连接横梁
  ctx.fillRect(x + 3 * size, y - 12 * size, 10 * size, 2 * size);
  ctx.fillRect(x + 3 * size, y - 8 * size, 10 * size, 1.5 * size);
}

// 绘制小装饰音符
function drawSmallNote(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;

  const size = scale;

  // 简化的音符头部
  ctx.beginPath();
  ctx.ellipse(x, y, 3 * size, 2 * size, Math.PI * 0.3, 0, 2 * Math.PI);
  ctx.fill();

  // 简短的音符杆
  ctx.fillRect(x + 2 * size, y - 8 * size, 1 * size, 10 * size);
}

// 切换到指定曲目
function switchToTrack(index: number, autoPlay = false) {
  if (index < 0 || index >= audioTracks.value.length) return;

  const wasPlaying = isPlaying.value || autoPlay;

  // 停止当前播放
  if (audioRef.value) {
    audioRef.value.pause();
    isPlaying.value = false;
    if (animationId.value) {
      cancelAnimationFrame(animationId.value);
    }
  }

  // 更新当前曲目
  currentTrackIndex.value = index;
  currentTrack.value = audioTracks.value[index];
  audioSrc.value = currentTrack.value.src;
  
  // 重置跑马灯动画
  marqueeKey.value += 1;

  // 重置播放状态
  progress.value = 0;
  currentTime.value = 0;
  duration.value = 0;
  hasError.value = false;

  // 更新音频源
  if (audioRef.value) {
    audioRef.value.src = audioSrc.value;
    audioRef.value.load();
  }

  // 如果之前在播放，切换后继续播放
  if (wasPlaying) {
    // 延迟一下等待加载
    setTimeout(() => {
      togglePlay();
    }, 100);
  } else {
    drawDefaultVisualization();
  }

}

// 下一首
function nextTrack(autoPlay = false) {
  const nextIndex = (currentTrackIndex.value + 1) % audioTracks.value.length;
  switchToTrack(nextIndex, autoPlay);
}

// 上一首
function previousTrack() {
  const prevIndex = currentTrackIndex.value === 0
    ? audioTracks.value.length - 1
    : currentTrackIndex.value - 1;
  switchToTrack(prevIndex);
}

// 处理下拉框选择
function handleTrackChange(newIndex: number) {
  // Element Plus会直接传递新的值
  switchToTrack(newIndex);
}

// 处理触摸滑动切换歌曲
function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0].screenX;
}

function handleTouchEnd(event: TouchEvent) {
  touchEndX.value = event.changedTouches[0].screenX;
  handleSwipeGesture();
}

function handleSwipeGesture() {
  const swipeThreshold = 50; // 最小滑动距离
  const diff = touchStartX.value - touchEndX.value;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // 向左滑动 - 下一首
      nextTrack();
    } else {
      // 向右滑动 - 上一首  
      previousTrack();
    }
  }
}

// 绘制Ready状态文字
function drawReadyText(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  // 根据Canvas尺寸动态调整字体大小
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const fontSize = Math.max(12, Math.min(16, rect.width / 30)); // 动态字体大小

  // 设置文字样式
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 绘制Ready文字 - 位置调整到底部中央
  ctx.fillText('♪ Ready to Play ♪', centerX, centerY + 20);

  // 绘制装饰性的音乐线条
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;

  const lineWidth = Math.min(120, rect.width * 0.3);

  // 上方装饰线
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(centerX - lineWidth, centerY - 20);
  ctx.lineTo(centerX + lineWidth, centerY - 20);
  ctx.stroke();

  // 下方装饰线
  ctx.beginPath();
  ctx.moveTo(centerX - lineWidth, centerY + 30);
  ctx.lineTo(centerX + lineWidth, centerY + 30);
  ctx.stroke();

  ctx.setLineDash([]); // 重置虚线

  // 添加一些小装饰点
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  const dotSpacing = Math.min(30, lineWidth / 4);
  for (let i = 0; i < 5; i++) {
    const dotX = centerX - (dotSpacing * 2) + i * dotSpacing;
    ctx.beginPath();
    ctx.arc(dotX, centerY + 30, 1, 0, 2 * Math.PI);
    ctx.fill();
  }
}
</script>

<template>
  <div class="audio-player-container">
    <!-- 隐藏的音频元素 -->
    <audio ref="audioRef" :src="audioSrc" preload="metadata" crossorigin="anonymous"></audio>

    <!-- 音频播放器界面 -->
    <div class="audio-player" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <!-- 第一行：音频信息和时间 -->
      <div class="audio-info-row">
        <div class="audio-info">
          <!-- 音频标题 -->
          <div class="audio-title">
            <div v-if="!hasError" class="marquee-container">
              <div class="marquee-content" :key="marqueeKey" :class="{ 'playing': isPlaying }">
                {{ currentTrack.artist }} - {{ currentTrack.title }}
              </div>
            </div>
            <span v-else class="error-text">{{ errorMessage }}</span>
          </div>

          <!-- 进度条 -->
          <div class="progress-container" @click="seekTo">
            <div class="progress-bar" :class="{ 'error': hasError }" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <!-- 时间显示 -->
        <div class="time-display">
          <span v-if="!hasError">{{ formatTime(currentTime) }}</span>
          <span v-else>--:--</span>
          <span>/</span>
          <span v-if="!hasError">{{ formatTime(duration) }}</span>
          <span v-else>--:--</span>
        </div>
      </div>

      <!-- 第二行：播放控制按钮 -->
      <div class="control-row">
        <div class="play-controls">
          <!-- 上一首按钮 -->
          <button @click="previousTrack" class="control-button prev-button">
            <svg class="control-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <!-- 播放/暂停按钮 -->
          <button @click="togglePlay" class="play-button">
            <!-- 播放 -->
            <span v-if="!isPlaying" class="play-icon"></span>
            <!-- 暂停 -->
            <span v-else class="pause-icon">
              <span class="pause-bar"></span>
              <span class="pause-bar"></span>
            </span>
          </button>

          <!-- 下一首按钮 -->
          <button @click="nextTrack" class="control-button next-button">
            <svg class="control-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 18h2V6h-2v12zM6 6v12l8.5-6z" />
            </svg>
          </button>
        </div>

        <!-- 声波动画 -->
        <div class="wave-animation">
          <span v-for="i in 5" :key="i" class="wave-bar" :class="isPlaying ? `animate-wave-${i}` : ''"></span>
        </div>

        <!-- 滑动提示 -->
        <div class="swipe-hint">
          💡 左右滑动切换音乐
        </div>

         <!-- 移除加载状态显示，本地音频加载很快不需要显示 -->
      </div>
    </div>

    <!-- 音频可视化画布 -->
    <div class="visualization-container">
      <canvas ref="canvasRef" class="visualization-canvas"></canvas>
      <!-- 状态指示器 -->
      <div v-if="!isPlaying && !hasError" class="status-indicator">
        待播放
      </div>
    </div>

    <!-- 阅读文章悬浮播放器 -->
    <ReadingPlayer :main-player-playing="isPlaying" @playing-state-changed="handleReadingPlayerStateChange" />
  </div>
</template>

<style lang="scss" scoped>
// ========== 变量定义 ==========
$primary-black: #000000;
$white: #ffffff;
$gray-50: #f9fafb;
$gray-200: #e5e7eb;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$neutral-800: #262626;
$red-500: #ef4444;

// ========== 主容器 ==========
.audio-player-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

// ========== 音频播放器 ==========
.audio-player {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: $white;
  border: 1px solid $gray-200;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
}

// ========== 第一行：音频信息 ==========
.audio-info-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0; // 防止flex子元素溢出
}

.audio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0; // 允许缩小
  overflow: hidden; // 防止内容溢出
}

// ========== 第二行：控制按钮 ==========
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

// ========== 播放控制区域 ==========
.play-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// ========== 控制按钮样式 ==========
.control-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gray-200;
  color: $primary-black;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $gray-400;
    color: $white;
  }

  &:active {
    transform: scale(0.95);
  }
}

.control-icon {
  width: 1.25rem;
  height: 1.25rem;
}

// ========== 主播放按钮 ==========
.play-button {
  width: 2.25rem; // 从3rem缩小到2.25rem
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary-black;
  color: $white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0; // 防止被压缩

  &:hover {
    background: $neutral-800;
  }

  &:active {
    transform: scale(0.95);
  }
}

.play-icon {
  width: 0;
  height: 0;
  border-left: 8px solid $white; // 从12px缩小到8px
  border-top: 5px solid transparent; // 从7px缩小到5px
  border-bottom: 5px solid transparent;
  margin-left: 0.125rem; // 从0.25rem缩小到0.125rem
}

.pause-icon {
  display: flex;
  gap: 2px; // 从3px缩小到2px

  .pause-bar {
    width: 2px; // 从3px缩小到2px
    height: 0.875rem; // 从1.25rem缩小到0.875rem
    background: $white;
    border-radius: 0.125rem;
  }
}

// ========== 音频内容区域 ==========
.audio-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem; // 从0.5rem缩小到0.375rem
}

.audio-title {
  font-size: 0.875rem;
  color: $primary-black;
  font-weight: 500;
  width: 100%;

  .error-text {
    color: $red-500;
  }
}

// ========== 跑马灯效果 ==========
.marquee-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.marquee-content {
  display: inline-block;
  white-space: nowrap;
  transform: translateX(0%); // 默认位置在左侧
  
  // 只有播放时才启动动画
  &.playing {
    animation: marquee 15s linear infinite;
    
    &:hover {
      animation-play-state: paused; // 鼠标悬停时暂停
    }
  }
  
  // 暂停时停在当前位置，不动画
  &:not(.playing) {
    animation: none;
  }
}

@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}


// ========== 进度条 ==========
.progress-container {
  width: 100%;
  height: 0.25rem; // 恢复正常高度
  background: $gray-200;
  border-radius: 9999px;
  overflow: hidden;
  cursor: pointer;
}

.progress-bar {
  height: 0.25rem; // 恢复正常高度
  background: $primary-black;
  transition: all 0.3s ease;

  &.error {
    background: $red-500;
  }
}

// ========== 信息区域 ==========
.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

// ========== 歌曲选择器 ==========
.track-selector {
  display: flex;
  align-items: center;
  gap: 0.375rem; // 从0.5rem缩小到0.375rem
  font-size: 0.6875rem; // 从0.75rem缩小到0.6875rem
}

.selector-label {
  color: $gray-600;
  white-space: nowrap;
}

// Element Plus Select 自定义样式
.track-select {
  flex: 1;

  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    border: 1px solid $gray-200;
    border-radius: 0.375rem;
    box-shadow: none;
    background: $white;

    &:hover {
      border-color: $gray-400;
    }

    &.is-focus {
      border-color: $primary-black;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.el-input__inner) {
    color: $primary-black;
    font-size: 0.75rem;
    height: auto;
    line-height: 1.5;
  }

  :deep(.el-input__suffix) {
    color: $gray-500;
  }

  :deep(.el-select__caret) {
    color: $gray-500;

    &.is-reverse {
      transform: rotateZ(180deg);
    }
  }
}

// 下拉面板样式 - 使用更强的选择器优先级
.track-select {
  :deep(.el-select-dropdown) {
    background-color: $white !important;
    border: 1px solid $gray-200 !important;
    border-radius: 0.375rem !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  }

  :deep(.el-select-dropdown .el-scrollbar__view) {
    background-color: $white !important;
  }

  :deep(.el-select-dropdown__item) {
    font-size: 0.75rem !important;
    color: #000000 !important;
    background-color: #ffffff !important;
    padding: 8px 12px !important;
    line-height: 1.5 !important;

    &:hover,
    &.hover {
      background-color: #f9fafb !important;
      color: #000000 !important;
    }

    &.selected,
    &.is-selected {
      background-color: #000000 !important;
      color: #ffffff !important;
      font-weight: 500 !important;
    }

    // 确保所有内部元素的文字颜色
    * {
      color: inherit !important;
    }
  }
}

// 全局Element Plus下拉框样式强制覆盖
.el-select-dropdown {
  background: #ffffff !important;

  .el-select-dropdown__item {
    color: #000000 !important;
    background: #ffffff !important;

    &:hover {
      background: #f9fafb !important;
      color: #000000 !important;
    }

    &.selected {
      background: #000000 !important;
      color: #ffffff !important;
    }
  }
}

// ========== 时间显示 ==========
.time-display {
  font-size: 0.75rem; // 恢复正常大小
  color: $gray-600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums; // 等宽数字
  min-width: 5rem; // 给时间显示一个最小宽度
  text-align: right; // 右对齐
  flex-shrink: 0; // 防止被压缩
}

// ========== 滑动提示 ==========
.swipe-hint {
  font-size: 0.6875rem;
  color: $gray-400;
  text-align: center;
  padding: 0.25rem 0.5rem;
  background: rgba($gray-50, 0.8);
  border-radius: 0.375rem;
  border: 1px solid rgba($gray-200, 0.5);
  margin: 0.25rem 0;
  white-space: nowrap;
}

// ========== 加载状态样式已移除 ==========


// ========== 声波动画 ==========
.wave-animation {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 2rem;
  width: 2.5rem;
}

.wave-bar {
  width: 3px;
  background: $primary-black;
  border-radius: 0.125rem;
  height: 20%;
}

// ========== 可视化容器 ==========
.visualization-container {
  width: 100%;
  height: 4rem; // 从2.5rem增加到4rem，确保文字清晰可见
  background: linear-gradient(to right, $gray-50, $white, $gray-50);
  border-radius: 0.5rem; // 恢复到0.5rem
  border: 1px solid $gray-200;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  position: relative;
}

.visualization-canvas {
  width: 100%;
  height: 100%;
}

.status-indicator {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  font-size: 0.75rem;
  color: $gray-400;
  font-weight: 500;
}

// ========== 动画定义 ==========
@keyframes wave {

  0%,
  100% {
    height: 20%;
  }

  50% {
    height: 100%;
  }
}


.animate-wave-1 {
  animation: wave 1s ease-in-out infinite;
}

.animate-wave-2 {
  animation: wave 1s ease-in-out infinite 0.2s;
}

.animate-wave-3 {
  animation: wave 1s ease-in-out infinite 0.4s;
}

.animate-wave-4 {
  animation: wave 1s ease-in-out infinite 0.6s;
}

.animate-wave-5 {
  animation: wave 1s ease-in-out infinite 0.8s;
}

// ========== 移动端响应式设计 ==========
@media (max-width: 768px) {
  .audio-player {
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .audio-info-row {
    gap: 0.75rem;
  }

  .audio-info {
    gap: 0.25rem;
  }

  .control-row {
    gap: 0.75rem;
  }

  .play-controls {
    gap: 0.75rem;
  }

  .control-button {
    min-width: 44px;
    min-height: 44px;
  }

  .play-button {
    min-width: 44px;
    min-height: 44px;
  }

  .time-display {
    font-size: 0.6875rem;
  }

  .wave-animation {
    width: 2rem; // 移动端缩小声波动画
  }

  .visualization-container {
    height: 3.5rem; // 移动端也相应增加高度
  }

  .swipe-hint {
    font-size: 0.625rem;
    background: rgba($gray-50, 0.9);
    border: 1px solid rgba($gray-200, 0.8);
    margin: 0.375rem 0;
  }
}
</style>
