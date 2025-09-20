<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
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

// 音频文件路径 - 音频文件放在 public 文件夹中
const audioSrc = "/docs/audio/Connie Talbot - Count On Me_H.mp3"; // 背景音乐
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref("");

// 阅读播放器状态管理
const readingPlayerPlaying = ref(false);

onMounted(() => {
  initAudio();
  setupCanvas();
  drawDefaultVisualization();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
  if (audioContext.value) {
    audioContext.value.close();
  }

  // 移除事件监听器
  window.removeEventListener('resize', handleResize);
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
  const dpr = window.devicePixelRatio || 1;

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
      // 恢复默认可视化效果
      drawDefaultVisualization();
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
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
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
  <div class="flex flex-col gap-4 items-center">
    <!-- 隐藏的音频元素 -->
    <audio
      ref="audioRef"
      :src="audioSrc"
      preload="metadata"
      crossorigin="anonymous"
    ></audio>

    <!-- 音频播放器界面 -->
    <div class="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm w-full">
      <!-- 播放按钮 -->
      <button
        @click="togglePlay"
        class="w-12 h-12 rounded-full flex items-center justify-center bg-black text-white shadow-md hover:bg-neutral-800 active:scale-95 transition"
      >
        <!-- 播放 -->
        <span
          v-if="!isPlaying"
          class="w-0 h-0 border-l-[12px] border-l-white border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent ml-1"
        ></span>
        <!-- 暂停 -->
        <span v-else class="flex gap-[3px]">
          <span class="w-[3px] h-5 bg-white rounded-sm"></span>
          <span class="w-[3px] h-5 bg-white rounded-sm"></span>
        </span>
      </button>

      <!-- 中间内容 -->
      <div class="flex-1 flex flex-col gap-2">
        <!-- 音频标题 -->
        <div class="text-sm text-black ">
          <span v-if="!hasError">Connie Talbot - Count On Me_H</span>
          <span v-else class="text-red-500">{{ errorMessage }}</span>
        </div>

        <!-- 进度条 -->
        <div
          class="w-full h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          @click="seekTo"
        >
          <div
            class="h-1 transition-all"
            :class="hasError ? 'bg-red-500' : 'bg-black'"
            :style="{ width: progress + '%' }"
          ></div>
        </div>

        <!-- 时间 -->
        <div class="flex justify-between text-[11px] text-gray-600">
          <span v-if="!hasError">{{ formatTime(currentTime) }}</span>
          <span v-else>--:--</span>
          <span v-if="!hasError">{{ formatTime(duration) }}</span>
          <span v-else>--:--</span>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="text-xs text-gray-500">
          正在加载音频文件...
        </div>
      </div>

      <!-- 声波动画 -->
      <div class="flex items-end gap-[3px] h-8 w-10">
        <span
          v-for="i in 5"
          :key="i"
          class="w-[3px] bg-black rounded-sm"
          :class="isPlaying ? `animate-wave-${i}` : ''"
        ></span>
      </div>
    </div>

    <!-- 音频可视化画布 -->
    <div class="w-full h-20 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-inner relative">
      <canvas
        ref="canvasRef"
        class="w-full h-full"
      ></canvas>
      <!-- 状态指示器 -->
      <div
        v-if="!isPlaying && !hasError"
        class="absolute top-1 right-2 text-xs text-gray-400 font-medium"
      >
        {{ isLoading ? '加载中...' : '待播放' }}
      </div>
    </div>

    <!-- 阅读文章悬浮播放器 -->
    <ReadingPlayer
      :main-player-playing="isPlaying"
      @playing-state-changed="handleReadingPlayerStateChange"
    />
  </div>
</template>

<style scoped>
@keyframes wave {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}
.animate-wave-1 { animation: wave 1s ease-in-out infinite; }
.animate-wave-2 { animation: wave 1s ease-in-out infinite .2s; }
.animate-wave-3 { animation: wave 1s ease-in-out infinite .4s; }
.animate-wave-4 { animation: wave 1s ease-in-out infinite .6s; }
.animate-wave-5 { animation: wave 1s ease-in-out infinite .8s; }
</style>
