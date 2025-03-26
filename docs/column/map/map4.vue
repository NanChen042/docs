<template>
  <div class="container" ref="containerRef">
    <div class="fixed-text">Southern Wind</div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ref, onMounted, onBeforeUnmount } from "vue";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const containerRef = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationFrameId: number;

function init() {
  if (!containerRef.value) return;

  const { clientWidth, clientHeight } = containerRef.value;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    60,
    clientWidth / clientHeight,
    0.1,
    1000
  );
  camera.position.set(200, 200, 200);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(clientWidth, clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  containerRef.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 加载字体并创建3D文字
  const fontLoader = new FontLoader();
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const textGeometry = new TextGeometry("BLOG", {
        font: font,
        size: 30,
        height: 10,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
      });

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // 居中文字
      textGeometry.computeBoundingBox();
      const centerOffset = [
        -(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) / 2,
        -(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y) / 2,
        -(textGeometry.boundingBox.max.z - textGeometry.boundingBox.min.z) / 2,
      ];
      textMesh.position.set(...centerOffset);

      scene.add(textMesh);
    }
  );

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function handleResize() {
  if (!containerRef.value) return;

  const { clientWidth, clientHeight } = containerRef.value;

  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(clientWidth, clientHeight);
}

function cleanup() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  if (renderer) {
    renderer.dispose();
  }

  if (controls) {
    controls.dispose();
  }

  window.removeEventListener("resize", handleResize);
}

onMounted(() => {
  init();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.fixed-text {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffd700;
  font-size: 36px;
  font-weight: bold;
  font-family: Arial, sans-serif;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  user-select: none;
  background: transparent;
}
</style>
