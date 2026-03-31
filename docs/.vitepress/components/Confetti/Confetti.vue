<script setup lang="ts">
import confetti from "canvas-confetti";
const duration = 3000;
const end = Date.now() + duration;

(function frame() {
  confetti({
    particleCount: 5,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
  });
  confetti({
    particleCount: 5,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
  });

  if (Date.now() < end) {
    requestAnimationFrame(frame);
  }
})();

const timer = setInterval(() => {
  confetti({
    particleCount: 2,
    angle: 90,
    spread: 20,
    origin: { x: Math.random(), y: 0 },
  });
}, 100);

// 例如 5 秒后停止
setTimeout(() => {
  clearInterval(timer);
}, 5000);
</script>

<template>
  <div>

  </div>
</template>

<style scoped>
</style>
