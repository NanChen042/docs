<script setup lang="ts">
import confetti from "canvas-confetti";
import { onMounted, onUnmounted } from "vue";

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
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

  timer = setInterval(() => {
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 20,
      origin: { x: Math.random(), y: 0 },
    });
  }, 100);

  setTimeout(() => {
    if (timer) clearInterval(timer);
  }, 5000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div />
</template>
