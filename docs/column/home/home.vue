<template>
  <div class="minimal-home-wrapper">
    <!-- Three.js Canvas Container (Fixed Background) -->
    <div class="three-container">
      <canvas ref="threeCanvas" class="three-canvas"></canvas>
      
      <!-- Non-intrusive Model Loading Badge -->
      <transition name="fade">
        <div v-if="isLoadingModel" class="model-loading-badge">
          <div class="mini-planet-spinner"></div>
          <span class="badge-text">Deploying Voyager...</span>
        </div>
      </transition>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="word-mask"><span class="hero-word">Journey</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word">of</span></span>
          <br/>
          <span class="word-mask"><span class="hero-word highlight">Southern</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word highlight">Wind</span></span>
        </h1>
        <p class="hero-subtitle">
          <span class="word-mask"><span class="hero-word">Frontend</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word">Developer</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word">/</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word">{{ expText }}</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word">Experience</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word">/</span></span>
          <span class="space">&nbsp;</span>
          <span class="word-mask"><span class="hero-word">Explorer</span></span>
        </p>
      </div>
    </section>

    <!-- Milestones GSAP Track (In-Place Switching) -->
    <section class="milestones-track">
      <div class="milestones-container">
        <div 
          v-for="(activity, index) in growthActivities" 
          :key="index"
          class="typo-group"
          :class="`milestone-${index}`"
        >
          <div class="typo-content">
            <div class="typo-header-row">
              <span class="typo-index">0{{ index + 1 }}</span>
              <div class="typo-tag">{{ activity.timestamp }}</div>
              <div class="typo-line"></div>
            </div>
            <h3 class="typo-title">{{ activity.title }}</h3>
            <div class="typo-desc-wrapper">
              <div class="typo-desc-accent"></div>
              <p class="typo-desc">{{ activity.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { growthActivities } from './data'
import { useExperience } from './composables/useExperience'

const expText = ref('4 Years+') // Server-side default fallback
const { experience } = useExperience('2021-03-10')
const threeCanvas = ref<HTMLCanvasElement | null>(null)
const isLoadingModel = ref(true) // Track 3D model loading state
let cleanupThreeJS: (() => void) | null = null

onMounted(async () => {
  expText.value = experience.value // Client-side hydration
  
  if (typeof window !== 'undefined') {
    try {
      // 1. Load GSAP
      const gsapModule = await import('gsap')
      const ScrollTriggerModule = await import('gsap/ScrollTrigger')
      
      const gsap = gsapModule.default || gsapModule.gsap || gsapModule
      const ScrollTrigger = ScrollTriggerModule.default || ScrollTriggerModule.ScrollTrigger || ScrollTriggerModule
      
      gsap.registerPlugin(ScrollTrigger)
      
      await nextTick()

      // 1. Hero Initial Reveal (Vertical Cut Reveal - Word Level)
      gsap.to('.hero-word', {
        y: 0,
        duration: 1.0,
        stagger: 0.08,
        ease: 'back.out(1.4)', // Spring-like reveal matching the React component's physics
        delay: 0.1
      })

      // 2. Hero Tumble & Fade (On Scroll)
      gsap.to('.hero-content', {
        scrollTrigger: {
          trigger: '.minimal-home-wrapper',
          start: 'top top',
          end: '1000px top',
          scrub: 1
        },
        y: -100,
        rotationX: -45,
        scale: 0.8,
        opacity: 0,
        ease: 'power2.inOut'
      })

      // 3. Advanced Modern Typography In-Place Switching (No Glassmorphism)
      const groups = gsap.utils.toArray('.typo-group')
      groups.forEach((group: any, index: number) => {
        const headerRow = group.querySelector('.typo-header-row')
        const title = group.querySelector('.typo-title')
        const descWrapper = group.querySelector('.typo-desc-wrapper')
        const line = group.querySelector('.typo-line')

        // Initial state
        gsap.set(group, { display: 'none', filter: 'blur(10px)' })
        gsap.set([headerRow, title, descWrapper], { opacity: 0, y: 30 })
        gsap.set(line, { scaleX: 0 })

        // Exclusive interval logic so they NEVER overlap
        ScrollTrigger.create({
          trigger: '.minimal-home-wrapper',
          start: `${800 + index * 800}px top`,
          end: `${1600 + index * 800}px top`,
          
          onEnter: () => {
            gsap.set(group, { display: 'flex' })
            gsap.to(group, { filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', overwrite: true })
            
            // Stagger elements from bottom up
            gsap.fromTo([headerRow, title, descWrapper],
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: true }
            )
            // Stretch the glowing line
            gsap.fromTo(line,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, delay: 0.2, ease: 'power3.inOut', overwrite: true }
            )
          },
          onLeave: () => {
            gsap.to(group, { filter: 'blur(10px)', duration: 0.4, ease: 'power2.in', overwrite: true })
            gsap.to([headerRow, title, descWrapper], {
              opacity: 0, y: -30, duration: 0.4, stagger: 0.05, ease: 'power2.in', overwrite: true
            })
            setTimeout(() => gsap.set(group, { display: 'none' }), 400)
          },
          onEnterBack: () => {
            gsap.set(group, { display: 'flex' })
            gsap.to(group, { filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', overwrite: true })
            
            // Stagger elements from top down
            gsap.fromTo([descWrapper, title, headerRow],
              { opacity: 0, y: -30 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: true }
            )
            gsap.fromTo(line,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, delay: 0.2, ease: 'power3.inOut', overwrite: true }
            )
          },
          onLeaveBack: () => {
            gsap.to(group, { filter: 'blur(10px)', duration: 0.4, ease: 'power2.in', overwrite: true })
            gsap.to([descWrapper, title, headerRow], {
              opacity: 0, y: 30, duration: 0.4, stagger: 0.05, ease: 'power2.in', overwrite: true
            })
            setTimeout(() => gsap.set(group, { display: 'none' }), 400)
          }
        })
      })

      // 2. Load and Init Three.js
      if (threeCanvas.value) {
        const THREE = await import('three')
        cleanupThreeJS = initThreeJS(threeCanvas.value, THREE, gsap)
      }
      
    } catch (e) {
      console.error('Animation/Three.js initialization failed', e)
    }
  }
})

onBeforeUnmount(() => {
  if (cleanupThreeJS) {
    cleanupThreeJS()
  }
})

// Three.js Premium 2.5D Side-Scroller Diorama (Astro-Bot Explorer)
function initThreeJS(canvas: HTMLCanvasElement, THREE: any, gsap: any) {
  const container = canvas.parentElement!
// Force prevent any overflow from wrapper to avoid double scrollbars
  container.style.overflow = 'hidden' 
  
  const scene = new THREE.Scene()
  
  // 1. Orthographic Camera (Perfect 2.5D side-scrolling view)
  const frustumSize = 18 
  let aspect = container.clientWidth / container.clientHeight
  const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2,
    frustumSize / 2, frustumSize / -2,
    1, 1000
  )
  
  // Pure frontal view for that classic platformer / Monument Valley precision
  camera.position.set(0, 5, 20)
  camera.lookAt(0, 0, 0)
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  // 2. Cinematic Studio Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7)
  scene.add(hemiLight)

  const sunLight = new THREE.DirectionalLight(0xfff0dd, 1.2)
  sunLight.position.set(10, 20, 15) 
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 1024
  sunLight.shadow.mapSize.height = 1024
  sunLight.shadow.camera.left = -10
  sunLight.shadow.camera.right = 10
  sunLight.shadow.camera.top = 10
  sunLight.shadow.camera.bottom = -10
  sunLight.shadow.bias = -0.0005 
  scene.add(sunLight)

  const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.6) 
  fillLight.position.set(-10, 0, 10)
  scene.add(fillLight)

  // --- Master Group ---
  const dioramaGroup = new THREE.Group()
  scene.add(dioramaGroup)

  // 3. The Smooth Planet (Treadmill setup + Drag support)
  const planetRadius = 4.5
  const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64)
  const planetMat = new THREE.MeshStandardMaterial({ 
    color: 0x34d399,
    roughness: 0.8, // Rougher grass to contrast with the glassy river
    metalness: 0.0,
  })

  const planet = new THREE.Mesh(planetGeo, planetMat)
  planet.receiveShadow = true
  planet.castShadow = true
  
  // Create a master drag group so the user can spin the entire planet system freely!
  const planetDragGroup = new THREE.Group()
  dioramaGroup.add(planetDragGroup)
  
  // Planet Group tipped 90 degrees! This turns the local Y-axis into the global Z-axis.
  // When we rotate this group on its local Y-axis, it will spin perfectly like a 2D Ferris Wheel facing us!
  const planetScrollGroup = new THREE.Group()
  planetScrollGroup.rotation.x = Math.PI / 2 
  planetDragGroup.add(planetScrollGroup)

  const planetAutoSpinGroup = new THREE.Group()
  planetScrollGroup.add(planetAutoSpinGroup)
  planetAutoSpinGroup.add(planet)

  // 3.1 The Equator Highway (For the character to walk on)
  const roadWidth = 0.8
  const roadMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, // slate-700 asphalt
    roughness: 0.9, 
    metalness: 0.1 
  })
  
  // 核心黑客：精确计算公路缺口，使其与前后门的台阶无缝衔接！
  // 台阶伸出到 Z = 0.75，缩放后为 1.2，跨度为 2.4，对应弧度约为 0.53。
  // 我们将缺口设为 0.5，让公路稍微塞进台阶底下一丁点，做到绝对无缝！
  const gapStart = Math.PI / 2 + 0.25
  const gapLen = Math.PI * 2 - 0.5
  
  const roadMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(planetRadius + 0.005, planetRadius + 0.005, roadWidth, 128, 1, true, gapStart, gapLen),
    roadMat
  )
  roadMesh.receiveShadow = true
  planetAutoSpinGroup.add(roadMesh)

  // 3.2 Highway Edge Lines (Solid White)
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
  const leftLine = new THREE.Mesh(
    new THREE.CylinderGeometry(planetRadius + 0.015, planetRadius + 0.015, 0.04, 128, 1, true, gapStart, gapLen),
    lineMat
  )
  leftLine.position.y = 0.35
  leftLine.receiveShadow = true
  planetAutoSpinGroup.add(leftLine)

  const rightLine = new THREE.Mesh(
    new THREE.CylinderGeometry(planetRadius + 0.015, planetRadius + 0.015, 0.04, 128, 1, true, gapStart, gapLen),
    lineMat
  )
  rightLine.position.y = -0.35
  rightLine.receiveShadow = true
  planetAutoSpinGroup.add(rightLine)

  // 3.3 Highway Dashed Center Line
  const dashCount = 36
  for (let i = 0; i < dashCount; i++) {
    const angle = (i / dashCount) * Math.PI * 2
    // 避开房子缺口区域 (0.25 弧度)
    if (angle < 0.25 || angle > Math.PI * 2 - 0.25) continue;
    
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.01), lineMat)
    dash.position.set(
      (planetRadius + 0.015) * Math.cos(angle), 
      0, 
      (planetRadius + 0.015) * Math.sin(angle)
    )
    dash.lookAt(0, 0, 0) // Point local -Z towards the center, aligning the box perfectly with the surface!
    dash.receiveShadow = true
    planetAutoSpinGroup.add(dash)
  }

  // 3.5 The Physical Glass River (Extremely Premium)
  // 将河流从跨越极点改为“平行于赤道公路”的环形河，避免与公路产生任何物理交叉
  class RiverCurve extends THREE.Curve {
    radius: number;
    yOffset: number;
    constructor(radius: number, yOffset: number) {
      super();
      // 核心物理黑客：把河流的基准曲线半径“往下沉” 0.35！
      // 配合下面 0.4 的管道粗细，这就意味着整个水管的大部分体积都会埋在草地下面，
      // 只有最顶部的一点点圆弧会露出地表，完美形成一条【平坦、宽阔且与地面齐平】的真实河流！
      this.radius = radius - 0.35; 
      this.yOffset = yOffset; // 改为 Y 轴偏移，让河流所在的平面与公路 (XZ平面) 绝对平行
    }
    getPoint(t: number, optionalTarget = new THREE.Vector3()) {
      const angle = t * Math.PI * 2;
      // 蜿蜒的有机噪声，让河流有自然的曲折感
      const meander = Math.sin(angle * 5) * 0.4 + Math.sin(angle * 12) * 0.15;
      const y = this.yOffset + meander;
      // 勾股定理：确保河流始终紧紧贴合在星球的球面上
      const r_circle = Math.sqrt(Math.max(0.1, this.radius * this.radius - y * y));
      optionalTarget.set(Math.cos(angle) * r_circle, y, Math.sin(angle) * r_circle);
      return optionalTarget;
    }
  }
  
  // yOffset = 1.8 意味着河流会在公路的“前方”（靠近屏幕/相机的一侧）流淌
  const riverPath = new RiverCurve(planetRadius, 1.8)
  const riverGeo = new THREE.TubeGeometry(riverPath, 256, 0.4, 16, true) 
  
  // 泥土河床 (Muddy Riverbed)
  // 通过略微加大半径并下沉，制造包裹着河流的泥土河道
  // 泥土河床 (Muddy Riverbed) - Low Poly
  const riverBedGeo = new THREE.TubeGeometry(riverPath, 256, 0.46, 8, true)
  const riverBedMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    roughness: 1.0,
    flatShading: true // 回归扁平化多边形风格
  })
  const riverBedMesh = new THREE.Mesh(riverBedGeo, riverBedMat)
  riverBedMesh.position.y -= 0.05
  riverBedMesh.receiveShadow = true
  planetAutoSpinGroup.add(riverBedMesh)
  
  // 极简透射水面 - Low Poly
  const riverMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.8,
    ior: 1.33,
    transparent: true,
    flatShading: true // 钻石切面般的清澈反光
  })
  
  // 注入轻量级顶点动画，让 Low Poly 水面产生物理起伏
  riverMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uTime;`
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       // 利用正弦函数制造缓慢、大面积的低频起伏
       float wave1 = sin(transformed.x * 15.0 + uTime * 2.0);
       float wave2 = cos(transformed.z * 15.0 + uTime * 1.5);
       float wave3 = sin((transformed.x + transformed.z) * 10.0 - uTime * 1.0);
       
       // 让顶点在 Y 轴（上下）产生物理位移，幅度微小但足以改变切面反光
       transformed.y += (wave1 + wave2 + wave3) * 0.005;
      `
    )
  }
  const riverMesh = new THREE.Mesh(riverGeo, riverMat)
  riverMesh.receiveShadow = true
  planetAutoSpinGroup.add(riverMesh) // The river spins with the planet!

  // 极度硬核：程序化生态系统 (Rocks & Reeds)
  // 利用曲线的 getPoint 沿途生成青苔石头和岸边植物
  const mossRockGeo = new THREE.DodecahedronGeometry(1, 0) // 零细节十二面体，最纯正的 Low Poly 块状石头
  const mossRockMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // 简洁的岩石灰
    roughness: 0.9,
    flatShading: true // 扁平化棱角
  })

  const grassGeo = new THREE.ConeGeometry(0.04, 0.15, 3) // 3个面，底宽顶尖的三棱锥，最正宗的 Low Poly 草丛形状
  grassGeo.translate(0, 0.075, 0) // 将原点移到草的根部
  const grassMat = new THREE.MeshStandardMaterial({ 
    color: 0x22c55e, // 更加苍翠纯正的绿色，比偏黄的绿色更生机盎然
    roughness: 0.8,
    flatShading: true // 扁平化光影

  })

  // 沿河道随机放置 80 块石头和 300 棵水草
  for (let i = 0; i < 80; i++) {
    const t = Math.random()
    const pt = riverPath.getPoint(t)
    // 随机偏移 (横向铺开)
    const angle = Math.random() * Math.PI * 2
    const offset = Math.random() * 0.35 // 散布在河流宽度内
    const rock = new THREE.Mesh(mossRockGeo, mossRockMat)
    rock.position.set(pt.x, pt.y - 0.2, pt.z) // 默认沉在水底
    rock.position.x += Math.cos(angle) * offset
    rock.position.z += Math.sin(angle) * offset
    rock.scale.setScalar(0.08 + Math.random() * 0.15)
    rock.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3)
    rock.castShadow = true
    planetAutoSpinGroup.add(rock)
  }

  for (let i = 0; i < 200; i++) {
    const t = Math.random()
    const pt = riverPath.getPoint(t)
    const angle = Math.random() * Math.PI * 2
    // 散布在岸边 (0.35 到 0.55 之间)
    const offset = 0.35 + Math.random() * 0.2
    
    // 生成聚簇草丛 (每处生成 2-3 根向四周炸开的小草)
    const clumpSize = 2 + Math.floor(Math.random() * 2)
    for(let j=0; j<clumpSize; j++) {
      const grass = new THREE.Mesh(grassGeo, grassMat)
      grass.position.set(pt.x, pt.y - 0.05, pt.z)
      grass.position.x += Math.cos(angle) * offset + (Math.random() - 0.5) * 0.06
      grass.position.z += Math.sin(angle) * offset + (Math.random() - 0.5) * 0.06
      
      // 使水草根部朝向星球法线向外生长
      grass.lookAt(0,0,0)
      grass.rotateX(-Math.PI/2)
      
      // 随机向四周歪斜，形成生机勃勃的草丛簇
      grass.rotateX((Math.random() - 0.5) * 0.8)
      grass.rotateZ((Math.random() - 0.5) * 0.8)
      
      // 随机大小
      grass.scale.setScalar(0.4 + Math.random() * 0.8)
      grass.castShadow = true
      planetAutoSpinGroup.add(grass)
    }
  }

  // Helper to place elements on this tipped sphere
  // Lat (latitude) now controls Depth (Foreground/Background).
  // Lon (longitude) controls position around the wheel.
  const placeOnSphere = (obj: any, lat: number, lon: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    obj.position.x = planetRadius * Math.sin(phi) * Math.cos(theta)
    obj.position.y = planetRadius * Math.cos(phi)
    obj.position.z = planetRadius * Math.sin(phi) * Math.sin(theta)
    obj.lookAt(0,0,0)
    obj.rotateX(-Math.PI / 2) 
    planetAutoSpinGroup.add(obj) // Add to the spinning wheel
  }

  // 4. Premium Smooth Rocks (Trees are loaded via .3ds below)
  // 复用之前预定义好的全局材质，这样它们就能自动响应下方暗黑模式的色彩切换！
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7, side: THREE.DoubleSide })
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, flatShading: true })
  const createRock = (lat: number, lon: number, scale: number) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), rockMat)
    rock.scale.set(scale, scale * 0.6, scale)
    rock.castShadow = true
    placeOnSphere(rock, lat, lon)
  }

  // 并行加载两种树木模型 (3DS 和 OBJ) 并统一标准化处理
  Promise.all([
    import('three/examples/jsm/loaders/TDSLoader.js'),
    import('three/examples/jsm/loaders/OBJLoader.js')
  ]).then(([ { TDSLoader }, { OBJLoader } ]) => {
    
    // 1. 加载第一种树 (Tree1.3ds)
    const loadTDS = () => new Promise(resolve => {
       const loader = new TDSLoader()
       loader.setResourcePath('/three/tree1_3ds/')
       loader.load('/three/tree1_3ds/Tree1.3ds', (object) => {
         object.rotation.x = -Math.PI / 2 // 3DS Models are Z-up
         resolve(object)
       })
    })

    // 2. 加载第二种树 (Low_poly_tree.obj)
    const loadOBJ = () => new Promise(resolve => {
       import('three/examples/jsm/loaders/MTLLoader.js').then(({ MTLLoader }) => {
         const mtlLoader = new MTLLoader()
         mtlLoader.setPath('/three/low_poly_tree/')
         mtlLoader.load('Lowpoly_tree_sample.mtl', (materials) => {
           materials.preload()
           const loader = new OBJLoader()
           loader.setMaterials(materials)
           loader.load('/three/low_poly_tree/Lowpoly_tree_sample.obj', resolve)
         })
       })
    })

    // 当所有树木加载完毕后，统一进行规格化和上色处理
    Promise.all([loadTDS(), loadOBJ()]).then((objects) => {
      const treeModels = objects.map((object) => {
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            
            // 核心修复：很多高级模型（特别是 OBJ）为了优化性能，会把整棵树合并成【一个网格】，但使用【多材质数组】（MultiMaterial）
            // 之前由于没有判断数组，导致 child.material.name 为 undefined，直接把整个树强行染成了纯绿！
            const getPremiumMaterial = (mat) => {
              if (!mat) return treeMat
              const matName = (mat.name || '').toLowerCase()
              let isBark = false
              
              // 1. 通过材质名称精准判断 (MTL 提供)
              if (matName.includes('bark') || matName.includes('wood') || matName.includes('trunk') || matName.includes('stamm')) {
                isBark = true
              }
              
              // 2. 通过网格名称辅助判断（针对单材质拆分网格模型）
              if (!isBark && child.name) {
                const meshName = child.name.toLowerCase()
                if (meshName.includes('bark') || meshName.includes('trunk')) {
                  isBark = true
                }
              }
              
              return isBark ? trunkMat : treeMat
            }

            if (Array.isArray(child.material)) {
              // 针对多材质数组：分别将它们替换为我们高级响应式日夜联动材质
              child.material = child.material.map(mat => getPremiumMaterial(mat))
            } else {
              // 针对单材质
              child.material = getPremiumMaterial(child.material)
            }
          }
        })

        const wrapper = new THREE.Group()
        wrapper.add(object)

        // 无论原始模型尺寸多大，全部强制归一化缩放到 1.2 高度
        const box = new THREE.Box3().setFromObject(wrapper)
        const size = new THREE.Vector3()
        box.getSize(size)

        const targetScale = 1.2 / size.y
        wrapper.scale.set(targetScale, targetScale, targetScale)

        // 将原点强制校准到底面中心，确保所有树木都能完美种在地上
        const box2 = new THREE.Box3().setFromObject(wrapper)
        const center = new THREE.Vector3()
        box2.getCenter(center)
        
        wrapper.position.x -= center.x
        wrapper.position.z -= center.z
        wrapper.position.y -= box2.min.y

        const normalizedTree = new THREE.Group()
        normalizedTree.add(wrapper)
        return normalizedTree
      })

      const createTree = (lat, lon, scale) => {
        // 核心：每次创建树时，从模型库中随机抓取一种模型！
        const template = treeModels[Math.floor(Math.random() * treeModels.length)]
        const tree = template.clone()
        tree.scale.set(scale, scale, scale)
        placeOnSphere(tree, lat, lon)
      }

      // Layered Ecosystem (Parallax effect)
      // Background Trees (lat < -10)
      createTree(-20, 0, 1.2)
      createTree(-30, 45, 0.8)
      createTree(-15, 90, 1.0)
      createTree(-25, 135, 1.1)
      createTree(-40, 180, 0.9)
      createTree(-20, 225, 1.2)
      createTree(-35, 270, 0.7)
      createTree(-15, 315, 1.0)

      // Foreground Trees (lat > 40, in front of the river)
      createTree(45, 20, 1.0)
      createTree(50, 80, 0.8)
      createTree(40, 150, 1.1)
      createTree(60, 210, 0.9)
      createTree(45, 290, 1.2)
    })
  }).catch(e => {
    console.error('Failed to load Tree models', e)
  })

  // Rocks along the riverbanks (lat around 15 and 40)
  createRock(15, 30, 0.8)
  createRock(38, 70, 1.2)
  createRock(48, 10, 1.2)
  createRock(55, 150, 0.8)
  createRock(42, 250, 1.5)
  createRock(52, 330, 0.9)

  // 4.5 🏡 High-Aesthetic Crystal Greenhouse Villa (Fixed on sphere surface)
  const houseGroup = new THREE.Group()

  // Materials
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xa5f3fc, transparent: true, opacity: 0.45,
    roughness: 0.1, metalness: 0.1, clearcoat: 1.0, side: THREE.DoubleSide
  })
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
  const roofWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })
  const warmGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a })

  // Inner container to allow local rotation while preserving spherical alignment
  const innerContent = new THREE.Group()
  houseGroup.add(innerContent)

  // 1. Beautiful Wooden Deck / Base (还原精巧的实心地基)
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 })
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), deckMat) 
  deck.position.y = -0.24 
  deck.castShadow = true
  innerContent.add(deck)

  // 还原前门台阶，精巧优雅，正好压在公路上！
  const stepsFront = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.2), deckMat)
  stepsFront.position.set(0, -0.16, -0.65) 
  innerContent.add(stepsFront)

  // 还原后门台阶
  const stepsBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.2), deckMat)
  stepsBack.position.set(0, -0.16, 0.65)
  innerContent.add(stepsBack)

  // 2. Cozy Plaster / White Walls (还原温馨紧凑的过道)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfdfbf7, roughness: 0.9 })
  
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.8), wallMat)
  wallL.position.set(-0.3, 0.31, 0)
  innerContent.add(wallL)

  const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.8), wallMat)
  wallR.position.set(0.3, 0.31, 0)
  innerContent.add(wallR)

  const wallTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.8), wallMat)
  wallTop.position.set(0, 0.51, 0)
  innerContent.add(wallTop)

  // 3. Prominent A-Frame Roof (Classic Red/Dark Wood)
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.65 }) // Deep Nordic Red
  const roofGroup = new THREE.Group()
  roofGroup.position.set(0, 0.56, 0)
  
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.65, 0.4, 4), roofMat)
  roof.rotation.y = Math.PI / 4 // Align flat sides with house walls
  roof.position.y = 0.2 // Shift up half height
  roof.scale.set(1.0, 1.0, 0.85) // 还原屋顶正常比例
  roof.castShadow = true
  roofGroup.add(roof)
  innerContent.add(roofGroup)

  // 4. Entrance Doors
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.8 })
  const knobMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 })
  
  // -- Front Door --
  const doorHingeFront = new THREE.Group()
  doorHingeFront.position.set(-0.15, 0.26, -0.4) 
  doorHingeFront.rotation.y = 0 // 恢复为初始关闭，交给渲染循环动态开门
  
  const doorFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.04), doorMat)
  doorFront.position.set(0.15, 0, 0)
  doorHingeFront.add(doorFront)

  const knobFront = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), knobMat)
  knobFront.position.set(0.24, 0, -0.03)
  doorHingeFront.add(knobFront)
  innerContent.add(doorHingeFront)

  // -- Back Door --
  const doorHingeBack = new THREE.Group()
  doorHingeBack.position.set(-0.15, 0.26, 0.4) 
  doorHingeBack.rotation.y = 0 // 恢复为初始关闭，交给渲染循环动态开门
  
  const doorBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.04), doorMat)
  doorBack.position.set(0.15, 0, 0)
  doorHingeBack.add(doorBack)

  const knobBack = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), knobMat)
  knobBack.position.set(0.24, 0, 0.03)
  doorHingeBack.add(knobBack)
  innerContent.add(doorHingeBack)

  // 5. Classic Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), new THREE.MeshStandardMaterial({ color: 0x4a4a4a }))
  chimney.position.set(0.3, 0.7, -0.2)
  innerContent.add(chimney)

  const cabinSmokeGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 16)
  const cabinSmokeMat = new THREE.MeshBasicMaterial({ color: 0xf3f4f6, transparent: true, opacity: 0.45 })
  const smoke = new THREE.Mesh(cabinSmokeGeo, cabinSmokeMat)
  smoke.rotation.x = Math.PI / 2
  smoke.position.set(0.3, 0.95, -0.2)
  innerContent.add(smoke)

  // 6. 侧窗
  const windowGeo = new THREE.BoxGeometry(0.32, 0.2, 0.3)
  
  const windowL = new THREE.Mesh(windowGeo, warmGlowMat)
  windowL.position.set(-0.3, 0.35, 0) 
  innerContent.add(windowL)
  
  const windowR = new THREE.Mesh(windowGeo, warmGlowMat)
  windowR.position.set(0.3, 0.35, 0) 
  innerContent.add(windowR)

  // 【核心修复】：必须旋转 90 度，让房子的 Z 轴（前后门）对准赤道公路！否则房子是侧对着公路的！
  innerContent.rotation.y = -Math.PI / 2
  
  // 尺寸保持 1.6
  houseGroup.scale.set(1.6, 1.6, 1.6)
  
  // 【最核心】：将房子重新放回纬度 0，也就是人物行走的赤道公路上！
  // 现在的它，是公路上一道宏伟的风景线门楼！
  placeOnSphere(houseGroup, 0, 180)

  // State control for Journey Engine (Cycling ⇄ Walking) & Umbrella system
  let transitionWeight = 1.0
  let umbrellaWeight = 0.0
  let isTravelerCycling = true
  let housePassTriggered = false

  const houseWorldPos = new THREE.Vector3()
  const robotWorldPos = new THREE.Vector3()
  const stormWorldPos = new THREE.Vector3()

  // 4.6 Biomes & Natural Disasters (Premium Stylized Particles)
  const particlesToUpdate: { mesh: THREE.Mesh | THREE.Object3D, velocity: THREE.Vector3, type: string, origin: THREE.Vector3, life?: number, maxLife?: number }[] = []
  
  // ═══════════════════════════════════════════
  // 🌋 VOLCANO BIOME (lat=20, lon=240)
  // ═══════════════════════════════════════════
  const volcanoGroup = new THREE.Group()
  
  // Layered volcano body: dark rock base + red-hot rim
  const volcanoCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.65, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.95, flatShading: true })
  )
  volcanoCone.position.y = 0.45
  volcanoCone.castShadow = true
  volcanoGroup.add(volcanoCone)
  
  // Glowing magma rim ring
  const rimGeo = new THREE.TorusGeometry(0.16, 0.03, 8, 16)
  const rimMat = new THREE.MeshBasicMaterial({ color: 0xff4400 })
  const rim = new THREE.Mesh(rimGeo, rimMat)
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.9
  volcanoGroup.add(rim)
  
  // Magma pool inside crater
  const magmaPool = new THREE.Mesh(
    new THREE.CircleGeometry(0.14, 16),
    new THREE.MeshBasicMaterial({ color: 0xff2200 })
  )
  magmaPool.rotation.x = -Math.PI / 2
  magmaPool.position.y = 0.88
  volcanoGroup.add(magmaPool)
  
  // Volcano glow light
  const volcanoGlow = new THREE.PointLight(0xff4400, 1.5, 3)
  volcanoGlow.position.y = 1.0
  volcanoGroup.add(volcanoGlow)
  
  placeOnSphere(volcanoGroup, 20, 240)
  
  // Lava particles: glowing spheres with emissive material (not ugly boxes!)
  const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff6622 })
  const lavaGeo = new THREE.SphereGeometry(0.025, 8, 8)
  for (let i = 0; i < 15; i++) {
    const p = new THREE.Mesh(lavaGeo, lavaMat)
    volcanoGroup.add(p)
    const life = Math.random() // stagger the start
    p.position.set(0, 0.9, 0)
    particlesToUpdate.push({
      mesh: p,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.025,
        Math.random() * 0.04 + 0.025,
        (Math.random() - 0.5) * 0.025
      ),
      type: 'volcano',
      origin: new THREE.Vector3(0, 0.9, 0),
      life: life * 60,
      maxLife: 60 + Math.random() * 30
    })
  }
  
  // Smoke puffs above volcano (semi-transparent dark spheres)
  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0x555555, transparent: true, opacity: 0.3, roughness: 1.0
  })
  const smokeGeo = new THREE.SphereGeometry(0.08, 8, 8)
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(smokeGeo, smokeMat.clone())
    volcanoGroup.add(s)
    s.position.set(0, 1.0, 0)
    particlesToUpdate.push({
      mesh: s,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        0.008 + Math.random() * 0.005,
        (Math.random() - 0.5) * 0.004
      ),
      type: 'smoke',
      origin: new THREE.Vector3(0, 1.0, 0),
      life: Math.random() * 80,
      maxLife: 80 + Math.random() * 40
    })
  }

  // ═══════════════════════════════════════════
  // 5. Stylized Clouds
  // ═══════════════════════════════════════════
  const cloudMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, roughness: 1.0, metalness: 0.0,
    transparent: true, opacity: 0.95 
  })
  
  const createCloud = (x: number, y: number, z: number, scale: number, mat?: any) => {
    const cloud = new THREE.Group()
    const useMat = mat || cloudMat
    const geo = new THREE.SphereGeometry(0.5, 32, 32)
    const c1 = new THREE.Mesh(geo, useMat)
    const c2 = new THREE.Mesh(geo, useMat)
    c2.position.set(0.5, -0.1, 0)
    c2.scale.set(0.8, 0.8, 0.8)
    const c3 = new THREE.Mesh(geo, useMat)
    c3.position.set(-0.4, -0.1, 0)
    c3.scale.set(0.6, 0.6, 0.6)
    
    cloud.add(c1, c2, c3)
    cloud.position.set(x, y, z)
    cloud.scale.set(scale, scale * 0.7, scale) 
    cloud.castShadow = true
    dioramaGroup.add(cloud) 
    return cloud
  }
  
  const cloud1 = createCloud(5, 5, -2, 1.2)
  const cloud3 = createCloud(2, 6, -5, 0.8)
  
  // Storm cloud attached to the planet's surface so rain lands on the planet!
  // Place it above the equator at lat=15, lon=120 (left side of planet when viewed front)
  const stormCloudGroup = new THREE.Group()
  const stormMat = new THREE.MeshStandardMaterial({
    color: 0x374151, roughness: 1.0, metalness: 0.0,
    transparent: true, opacity: 0.9
  })
  const stormGeo = new THREE.SphereGeometry(0.5, 32, 32)
  // Multiple overlapping spheres to form a massive voluminous storm cloud mountain
  const stormPositions = [
    [0, 0, 0, 1.1], [-0.5, 0.1, 0.2, 0.85], [0.6, 0.05, -0.2, 0.9],
    [-1.1, -0.1, 0, 0.75], [1.1, -0.08, 0, 0.8], [0.3, 0.25, 0.3, 0.7],
    [-0.4, 0.2, -0.2, 0.65], [-1.6, -0.2, 0.1, 0.6], [1.6, -0.15, -0.1, 0.65]
  ]
  stormPositions.forEach(([x, y, z, s]) => {
    const m = new THREE.Mesh(stormGeo, stormMat)
    m.position.set(x as number, y as number, z as number)
    m.scale.setScalar(s as number)
    stormCloudGroup.add(m)
  })
  stormCloudGroup.scale.set(1.3, 1.3, 1.3) // Perfectly uniform volumetric 3D cloud mountain!
  stormCloudGroup.position.set(0, 2.6, 0)
  
  // Storm cloud attached to planet equator line so it passes directly over the rider's head!
  const stormAnchor = new THREE.Group()
  placeOnSphere(stormAnchor, 0, 115) // lon=115 starts AHEAD of the rider (lon=90), placing rider BEHIND the clouds!
  stormAnchor.add(stormCloudGroup)
  
  // Independent uniform rain group to ensure raindrops are never stretched or distorted!
  const rainGroup = new THREE.Group()
  rainGroup.position.set(0, 2.6, 0)
  stormAnchor.add(rainGroup)

  // Use cloud2 variable name for lightning reference
  const cloud2 = stormAnchor
  
  // Lightning flash light
  const lightningLight = new THREE.PointLight(0xc4b5fd, 0, 10)
  lightningLight.position.set(0, 0, 0)
  stormCloudGroup.add(lightningLight)
  let lightningTimer = 60
  
  // Rain: ultra-fine, perfectly vertical streaks falling directly toward planet surface
  const rainGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.5, 3)
  const rainMat = new THREE.MeshBasicMaterial({
    color: 0x93c5fd, transparent: true, opacity: 0.6
  })
  for (let i = 0; i < 60; i++) {
    const drop = new THREE.Mesh(rainGeo, rainMat)
    rainGroup.add(drop)
    const ox = (Math.random() - 0.5) * 3.8
    const oz = (Math.random() - 0.5) * 1.8
    const oy = -0.3 - Math.random() * 3.5
    drop.position.set(ox, oy, oz)
    particlesToUpdate.push({
      mesh: drop,
      velocity: new THREE.Vector3(0, -0.055 - Math.random() * 0.02, 0),
      type: 'rain',
      origin: new THREE.Vector3(ox, -0.3, oz),
      life: 0,
      maxLife: 75
    })
  }

  // 6. The Explorer — a traveller with a backpack, always moving forward
  // Theme: represents the blogger's journey, forever exploring the world.
  const robotScrollPivot = new THREE.Group()
  planetDragGroup.add(robotScrollPivot)
  const robotGroup = new THREE.Group()

  // --- Materials ---
  const skinMat    = new THREE.MeshStandardMaterial({ color: 0xf4c2a1, roughness: 0.8 })
  const jacketMat  = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.65 })
  const pantsMat   = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
  const packMat    = new THREE.MeshStandardMaterial({ color: 0x7c4f2a, roughness: 0.75 })
  const bootMat    = new THREE.MeshStandardMaterial({ color: 0x0f0a00, roughness: 0.9 })
  const hairMat    = new THREE.MeshStandardMaterial({ color: 0x1a0f00, roughness: 1.0 })
  const hatMat     = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })

  // --- BICYCLE MATERIALS & GROUP ---
  const bikeFrameMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3, metalness: 0.8 }) // Crimson red
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.15, metalness: 0.95 }) // Chrome silver
  const bikeTireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 }) // Dark rubber
  const bikeWhiteWallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 }) // Creamy vintage whitewall
  const bikeRimMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.1, metalness: 0.9 }) // High-gloss rim
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })

  const bikeGroup = new THREE.Group()

  // Helper function to create a high-aesthetic vintage wheel assembly
  let wheelFSpinner: THREE.Group
  let wheelBSpinner: THREE.Group

  const createAdvancedWheel = (isFront: boolean) => {
    const wheelGroup = new THREE.Group()
    const spinner = new THREE.Group()
    wheelGroup.add(spinner)

    if (isFront) wheelFSpinner = spinner
    else wheelBSpinner = spinner
    
    // 1. Outer Black Rubber Tire
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.022, 14, 28), bikeTireMat)
    spinner.add(tire)

    // 2. Vintage Creamy White-Wall Accent Ring
    const whiteWall = new THREE.Mesh(new THREE.TorusGeometry(0.178, 0.008, 12, 24), bikeWhiteWallMat)
    spinner.add(whiteWall)

    // 3. Metallic Chrome Inner Rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.162, 0.007, 12, 24), bikeRimMat)
    spinner.add(rim)

    // 4. Multi-Spoke Array (8 delicate cross spokes)
    const spokeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.32, 6)
    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(spokeGeo, metalMat)
      spoke.rotation.z = (Math.PI / 4) * i
      spinner.add(spoke)
    }

    // 5. Center Axle Hub Cylinder (Stays fixed relative to axle)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 12), metalMat)
    hub.rotation.z = Math.PI / 2
    wheelGroup.add(hub)

    return wheelGroup
  }

  // Front Wheel
  const wheelF = createAdvancedWheel(true)
  wheelF.rotation.y = Math.PI / 2
  wheelF.position.set(0, 0.20, -0.32)
  bikeGroup.add(wheelF)

  // Back Wheel
  const wheelB = createAdvancedWheel(false)
  wheelB.rotation.y = Math.PI / 2
  wheelB.position.set(0, 0.20, 0.32)
  bikeGroup.add(wheelB)

  // 2. Realistic Bike Frame Tubes
  // Seat Tube (Vertical from bottom bracket at Z=0 to seat at Z=0.06, Y=0.44)
  const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), bikeFrameMat)
  seatTube.position.set(0, 0.32, 0.03)
  seatTube.rotation.x = -0.24
  bikeGroup.add(seatTube)

  // Down Tube & Top Tube (slanted to head tube)
  const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 8), bikeFrameMat)
  topTube.position.set(0, 0.41, -0.09)
  topTube.rotation.x = 0.08
  bikeGroup.add(topTube)

  const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8), bikeFrameMat)
  downTube.position.set(0, 0.31, -0.11)
  downTube.rotation.x = 0.78
  bikeGroup.add(downTube)

  // Front Fork (connecting head tube at Z=-0.24 to front axle at Z=-0.32)
  const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.26, 8), metalMat)
  forkL.position.set(-0.035, 0.31, -0.28)
  forkL.rotation.x = 0.36
  bikeGroup.add(forkL)

  const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.26, 8), metalMat)
  forkR.position.set(0.035, 0.31, -0.28)
  forkR.rotation.x = 0.36
  bikeGroup.add(forkR)

  // Rear Stays (connecting seat/BB to rear axle)
  const rearStayL = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.34, 8), bikeFrameMat)
  rearStayL.position.set(-0.035, 0.31, 0.17)
  rearStayL.rotation.x = -0.62
  bikeGroup.add(rearStayL)

  const rearStayR = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.34, 8), bikeFrameMat)
  rearStayR.position.set(0.035, 0.31, 0.17)
  rearStayR.rotation.x = -0.62
  bikeGroup.add(rearStayR)

  // Handlebar post & bars (Horizontal bar spanning X axis)
  const handlePost = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.10, 8), metalMat)
  handlePost.position.set(0, 0.41, -0.26)
  handlePost.rotation.x = -0.15
  bikeGroup.add(handlePost)

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 8), metalMat)
  handlebar.position.set(0, 0.46, -0.26)
  handlebar.rotation.z = Math.PI / 2 // Spans left-right along X
  bikeGroup.add(handlebar)

  // Seat / Saddle
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.16), seatMat)
  seat.position.set(0, 0.44, 0.06)
  bikeGroup.add(seat)

  // Pedals crank
  const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 8), metalMat)
  crank.position.set(0, 0.20, 0.0)
  crank.rotation.z = Math.PI / 2
  bikeGroup.add(crank)

  robotGroup.add(bikeGroup)

  // --- RIDER GROUP (Seated on saddle / standing upright) ---
  const riderGroup = new THREE.Group()
  riderGroup.position.set(0, 0.44, 0.06)
  robotGroup.add(riderGroup)

  // Seamless Pelvis / Hips & Belt (Bridges torso jacket and leg joints smoothly!)
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.11), pantsMat)
  pelvis.position.set(0, 0.0, 0.0)
  pelvis.castShadow = true
  riderGroup.add(pelvis)

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.025, 0.115), seatMat)
  belt.position.set(0, 0.04, 0.0)
  riderGroup.add(belt)

  // --- TORSO (gentle natural posture) ---
  const torsoGroup = new THREE.Group()
  torsoGroup.position.set(0, 0.04, 0)
  torsoGroup.rotation.x = -0.15
  riderGroup.add(torsoGroup)

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.22, 12), jacketMat)
  torso.position.y = 0.11
  torso.castShadow = true
  torsoGroup.add(torso)

  // --- BACKPACK ---
  const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, 0.07), packMat)
  packBody.position.set(0, 0.11, 0.11)
  packBody.castShadow = true
  torsoGroup.add(packBody)

  const packFlap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 0.065), packMat)
  packFlap.position.set(0, 0.19, 0.10)
  torsoGroup.add(packFlap)

  // --- HEAD & FACE ---
  const headGroup = new THREE.Group()
  headGroup.position.set(0, 0.25, 0)
  headGroup.rotation.x = 0.1
  torsoGroup.add(headGroup)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), skinMat)
  head.castShadow = true
  headGroup.add(head)

  // Hair
  const hairMain = new THREE.Mesh(new THREE.SphereGeometry(0.118, 14, 12), hairMat)
  hairMain.position.set(0, 0.03, 0.02)
  hairMain.scale.set(1.1, 0.75, 1.0)
  headGroup.add(hairMain)

  const hairFront = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), hairMat)
  hairFront.position.set(0, 0.08, -0.07)
  headGroup.add(hairFront)

  const hairSpike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 8), hairMat)
  hairSpike.position.set(0, 0.12, 0)
  hairSpike.rotation.z = 0.3
  headGroup.add(hairSpike)

  // Glasses
  const glassesFrameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.8 })
  const lensMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.3 })

  const frameL = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.007, 8, 16), glassesFrameMat)
  frameL.position.set(-0.005, -0.01, -0.07)
  headGroup.add(frameL)

  const frameR = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.007, 8, 16), glassesFrameMat)
  frameR.position.set(-0.005, -0.01, 0.07)
  headGroup.add(frameR)

  const lensL = new THREE.Mesh(new THREE.CircleGeometry(0.030, 16), lensMat)
  lensL.position.set(-0.003, -0.01, -0.07)
  headGroup.add(lensL)

  const lensR = new THREE.Mesh(new THREE.CircleGeometry(0.030, 16), lensMat)
  lensR.position.set(-0.003, -0.01, 0.07)
  headGroup.add(lensR)

  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.075, 6), glassesFrameMat)
  bridge.rotation.x = Math.PI / 2
  bridge.position.set(-0.003, -0.01, 0)
  headGroup.add(bridge)

  // --- ARMS (reaching FORWARD & DOWN to grip handlebar at Z=-0.26, Y=0.46) ---
  const handMat = new THREE.MeshStandardMaterial({ color: 0xf4c2a1, roughness: 0.8 })
  
  const armL = new THREE.Group()
  armL.position.set(-0.12, 0.18, -0.01)
  armL.rotation.x = 0.88 // Angle reaching precisely to handlebar
  armL.rotation.z = -0.10
  const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.02, 0.38, 8), jacketMat)
  armLMesh.position.y = -0.19
  armLMesh.castShadow = true
  armL.add(armLMesh)
  // Hand palm gripping bar
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), handMat)
  handL.position.y = -0.38
  armL.add(handL)
  torsoGroup.add(armL)

  const armR = new THREE.Group()
  armR.position.set(0.12, 0.18, -0.01)
  armR.rotation.x = 0.88
  armR.rotation.z = 0.10
  const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.02, 0.38, 8), jacketMat)
  armRMesh.position.y = -0.19
  armRMesh.castShadow = true
  armR.add(armRMesh)
  // Hand palm gripping bar / umbrella
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), handMat)
  handR.position.y = -0.38
  armR.add(handR)

  // ☂️ Stylized Low-Poly Umbrella Assembly (Firmly gripped inside Right Hand palm!)
  const umbrellaGroup = new THREE.Group()
  umbrellaGroup.position.set(0, 0, 0)
  
  const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3, side: THREE.DoubleSide }) // Ocean blue canopy
  const umbrellaStickMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, metalness: 0.9, roughness: 0.2 })

  const umbrellaStick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.50, 8), umbrellaStickMat)
  umbrellaStick.position.y = 0.22 // Lowered stick down closer to hand
  umbrellaGroup.add(umbrellaStick)

  const umbrellaCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.22, 8), umbrellaMat)
  umbrellaCanopy.position.y = 0.44 // Lowered canopy to hover naturally over head
  umbrellaCanopy.castShadow = true
  umbrellaGroup.add(umbrellaCanopy)

  // Initially folded and hidden
  umbrellaGroup.scale.set(0.001, 0.001, 0.001)
  handR.add(umbrellaGroup)

  torsoGroup.add(armR)

  // --- LEGS (seated on saddle, pedaling down to crank at Y=0.20, Z=0.0) ---
  const legL = new THREE.Group()
  legL.position.set(-0.07, 0.0, 0.0)
  const legLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.25, 10), pantsMat)
  legLMesh.position.y = -0.12
  legLMesh.rotation.x = 0.28 // Natural seating angle
  legL.add(legLMesh)
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.08), bootMat)
  bootL.position.set(0, -0.22, -0.03)
  legL.add(bootL)
  riderGroup.add(legL)

  const legR = new THREE.Group()
  legR.position.set(0.07, 0.0, 0.0)
  const legRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.25, 10), pantsMat)
  legRMesh.position.y = -0.13
  legRMesh.rotation.x = 0.28
  legR.add(legRMesh)
  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.08), bootMat)
  bootR.position.set(0, -0.22, -0.03)
  legR.add(bootR)
  riderGroup.add(legR)

  // Character faces forward (+X direction = right on screen = direction of travel)
  robotGroup.rotation.y = -Math.PI / 2
  // Position robotGroup on planet surface
  robotGroup.position.set(0, planetRadius + 0.02, 0)
  robotScrollPivot.add(robotGroup)


  // 7. The Voyager (Real Airplane loaded from OBJ)
  const paperPlane = new THREE.Group()
  paperPlane.scale.set(0.4, 0.4, 0.4) // 保留原本外部的整体缩放比例

  // 异步加载真实飞机模型 (OBJ + MTL 保留原始贴图)
  Promise.all([
    import('three/examples/jsm/loaders/OBJLoader.js'),
    import('three/examples/jsm/loaders/MTLLoader.js')
  ]).then(([ { OBJLoader }, { MTLLoader } ]) => {
    const mtlLoader = new MTLLoader()
    mtlLoader.setPath('/three/airplane_v2/')
    mtlLoader.load('11805_airplane_v2_L2.mtl', (materials) => {
      materials.preload()
      
      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.setPath('/three/airplane_v2/')
      objLoader.load('11805_airplane_v2_L2.obj', (object) => {
        
        // 自动归一化缩放：将其最大长度强制缩放为 3.0 单位
        const box = new THREE.Box3().setFromObject(object)
        const size = new THREE.Vector3()
        box.getSize(size)
        
        const maxDim = Math.max(size.x, size.y, size.z)
        const targetScale = 3.0 / maxDim // 增大飞机尺寸
        object.scale.setScalar(targetScale)
        
        // 将原点居中对齐
        const box2 = new THREE.Box3().setFromObject(object)
        const center = new THREE.Vector3()
        box2.getCenter(center)
        object.position.sub(center)
        
        const wrapper = new THREE.Group()
        
        // 修正飞机朝向：先压平 (X轴)，然后围绕局部机背水平调头
        wrapper.rotateX(-Math.PI / 2)
        wrapper.rotateZ(Math.PI)
        
        wrapper.add(object)

        // 修复材质阴影，让它能接收场景光照
        object.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            // 确保如果有贴图，它能被正确渲染
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => { m.roughness = 0.5 })
              } else {
                child.material.roughness = 0.5
              }
            }
          }
        })
        
        // 将加载完成的真实飞机插入到轨道飞行组里！
        paperPlane.add(wrapper)
        
        // 模型加载完毕，关闭 loading 动画
        isLoadingModel.value = false
      }, undefined, (e) => {
        console.error('Failed to load airplane OBJ model', e)
        isLoadingModel.value = false
      })
    }, undefined, (e) => {
      console.error('Failed to load airplane MTL', e)
      isLoadingModel.value = false
    })
  }).catch(e => {
    console.error('Failed to import OBJ/MTL Loader', e)
    isLoadingModel.value = false
  })
  
  // Separation of Scroll rotation and Auto rotation to prevent animation fighting!
  const orbitScrollGroup = new THREE.Group() 
  // Add to planetDragGroup so the orbit tilts together with the planet!
  planetDragGroup.add(orbitScrollGroup)
  
  const orbitAutoSpinGroup = new THREE.Group()
  orbitScrollGroup.add(orbitAutoSpinGroup)
  
  paperPlane.position.set(planetRadius + 4.2, 0, -2.5) // 抬高并推入背景深处，避开赤道前方的乌云
  // Ensure the plane's 'up' points away from the planet (+X)
  paperPlane.up.set(1, 0, 0) 
  // Point the nose along the tangent (-Y) so it circles perfectly
  paperPlane.lookAt(planetRadius + 4.2, -1, -2.5) 
  // Bank (roll) slightly into the turn
  paperPlane.rotateZ(-Math.PI / 6) 
  orbitAutoSpinGroup.add(paperPlane)

  // 8. Realistic Starfield
  const starsGeom = new THREE.BufferGeometry()
  const starsCount = 800
  const starsPos = new Float32Array(starsCount * 3)
  for(let i = 0; i < starsCount * 3; i++) {
    const r = 40 + Math.random() * 40 
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    starsPos[i] = r * Math.sin(phi) * Math.cos(theta)
    starsPos[i+1] = r * Math.sin(phi) * Math.sin(theta)
    starsPos[i+2] = r * Math.cos(phi)
  }
  starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPos, 3))
  const starsMat = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  })
  starsMat.onBeforeCompile = (shader: any) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        if (dot(center, center) > 0.25) discard;
      `
    )
  }
  const stars = new THREE.Points(starsGeom, starsMat)
  scene.add(stars)

  // --- Dynamic Positioning ---
  const updateDioramaPosition = () => {
    const currentAspect = container.clientWidth / container.clientHeight
    camera.left = frustumSize * currentAspect / -2
    camera.right = frustumSize * currentAspect / 2
    camera.top = frustumSize / 2
    camera.bottom = frustumSize / -2
    camera.updateProjectionMatrix()
    
    if (currentAspect < 1) { 
      dioramaGroup.position.set(0, -(frustumSize / 2) + 5, 0)
    } else { 
      dioramaGroup.position.set((frustumSize * currentAspect / 2) - 6, -(frustumSize / 2) + 4.5, 0)
    }
  }
  updateDioramaPosition()

  // --- GSAP Scroll Interaction ---
  // The Planet speeds up its roll when scrolling
  gsap.to(planetScrollGroup.rotation, {
    scrollTrigger: {
      trigger: '.minimal-home-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5 
    },
    y: Math.PI * 0.7, // Reduced rotation for a smoother, more gentle scroll
    ease: 'none'
  })
  
  // The Paper Plane speeds up its orbit
  gsap.to(orbitScrollGroup.rotation, {
    scrollTrigger: {
      trigger: '.minimal-home-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2 
    },
    z: -(Math.PI * 2), // Gentler orbit speed
    ease: 'none'
  })
  
  // The Robot physically moves forward along the planet curvature when scrolling down! (Forward & Backward)
  gsap.to(robotScrollPivot.rotation, {
    scrollTrigger: {
      trigger: '.minimal-home-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5 
    },
    z: -0.5, // Moves significantly forward
    ease: 'power1.inOut'
  })
  
  // The Robot leans deeper into the flight when moving fast
  gsap.to(robotGroup.rotation, {
    scrollTrigger: {
      trigger: '.minimal-home-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5 
    },
    z: -0.4, 
    ease: 'power1.inOut'
  })

  // --- Mouse Drag Interaction ---
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }
  let targetRotation = { x: 0, y: 0 }
  
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return // Only left click
    isDragging = true
    previousMousePosition.x = e.clientX
    previousMousePosition.y = e.clientY
    canvas.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none' // Prevent text selection cursor ('|')
  }
  
  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - previousMousePosition.x
    const deltaY = e.clientY - previousMousePosition.y
    
    targetRotation.y += deltaX * 0.005
    targetRotation.x += deltaY * 0.005
    
    previousMousePosition.x = e.clientX
    previousMousePosition.y = e.clientY
  }
  
  const onPointerUp = () => {
    isDragging = false
    canvas.style.cursor = 'grab'
    document.body.style.userSelect = '' // Restore text selection
  }
  
  canvas.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  canvas.style.cursor = 'grab'

  const timer = new THREE.Timer()
  timer.connect(document)
  let animationFrameId: number
  
  // 全局着色器变量 (Uniforms)
  const customUniforms = {
    uTime: { value: 0 }
  }
  
  const animate = (timestamp: number) => {
    animationFrameId = requestAnimationFrame(animate)
    timer.update(timestamp)
    const elapsedTime = timer.getElapsed()
    customUniforms.uTime.value = elapsedTime // 更新全局时钟
    
    if (!isDragging) {
      // Auto snap back to center slowly for that perfect premium tactile feel
      targetRotation.x += (0 - targetRotation.x) * 0.05
      targetRotation.y += (0 - targetRotation.y) * 0.05
    }
    
    const dragDeltaY = (targetRotation.y - planetDragGroup.rotation.y) * 0.1
    
    // Smooth elastic drag rotation applied to the master group!
    planetDragGroup.rotation.x += (targetRotation.x - planetDragGroup.rotation.x) * 0.1
    planetDragGroup.rotation.y += dragDeltaY

    // Constant Treadmill spin (Independent of GSAP scroll and Drag!)
    planetAutoSpinGroup.rotateY(0.003)
    
    // Exact mathematical surface linear velocity tracking for bike wheels! (Planet R=4.8, Wheel R=0.24) -> 20x ratio
    const planetDeltaY = 0.003 + dragDeltaY
    
    // Constant Paper Plane flight (adjust altitude to 4.2 and keep it pushed into the background)
    orbitAutoSpinGroup.rotation.z -= 0.005
    paperPlane.position.x = (planetRadius + 4.2) + Math.sin(elapsedTime * 4) * 0.2
    
    // --- 1. 🏡 HOUSE PASSING ENGINE: Cycle through house to flip mode for the next full lap! ---
    houseGroup.getWorldPosition(houseWorldPos)
    robotGroup.getWorldPosition(robotWorldPos)
    const distToHouse = houseWorldPos.distanceTo(robotWorldPos)

    // 🚪 Dynamic Entrance Doors! 
    const localRobotPos = innerContent.worldToLocal(robotWorldPos.clone())
    
    // Automatic welcoming doors: open both when the robot is near!
    // This perfectly replaces the brittle local-coordinate bounding box logic.
    const targetFrontDoor = (distToHouse < 1.8) ? Math.PI / 2 : 0
    const targetBackDoor = (distToHouse < 1.8) ? -Math.PI / 2 : 0
    
    doorHingeFront.rotation.y += (targetFrontDoor - doorHingeFront.rotation.y) * 0.08
    doorHingeBack.rotation.y += (targetBackDoor - doorHingeBack.rotation.y) * 0.08

    // 🏆 Dynamic Robot Height: Smoothly step up onto the wooden deck!
    // The wooden deck in local space spans roughly from x = -0.6 to +0.6.
    let targetYOffset = 0;
    if (localRobotPos.x > -0.8 && localRobotPos.x < 0.8) {
       // Calculate a smooth hump curve using polynomial easing
       const ease = 1 - Math.pow(Math.min(1, Math.abs(localRobotPos.x) / 0.7), 4);
       targetYOffset = ease * 0.08; // height offset to smoothly reach the wooden deck
    }
    
    // Smoothly interpolate the robot's Y position to climb the steps
    robotGroup.position.y += ((planetRadius + 0.02 + targetYOffset) - robotGroup.position.y) * 0.15;

    // Trigger mode strictly based on absolute distance to the house
    // Fixes the parallax scrolling bug where scrubbing back and forth caused the toggle to desync!
    if (distToHouse < 1.8) {
      isTravelerCycling = false // 靠近房子绝对是走路
    } else {
      isTravelerCycling = true  // 远离房子绝对是骑车
    }

    // Smooth lerp for mode transition weight (1.0 = Cycling, 0.0 = Walking)
    transitionWeight += ((isTravelerCycling ? 1.0 : 0.0) - transitionWeight) * 0.05

    // Dynamically unfold bicycle with mech transformation scale & rotational assembly!
    const bikeScale = THREE.MathUtils.lerp(0.001, 1.0, transitionWeight)
    bikeGroup.scale.set(bikeScale, bikeScale, bikeScale)
    bikeGroup.rotation.y = THREE.MathUtils.lerp(Math.PI, 0, transitionWeight) // Mech unfold spinning!
    bikeGroup.visible = transitionWeight > 0.01

    torsoGroup.rotation.x = THREE.MathUtils.lerp(0.0, -0.15, transitionWeight)

    // --- 2. 👟 REALISTIC GROUND CLEARANCE: Boot soles flush with grass surface perfectly! ---
    // Walking hips at Y=0.24 perfectly offsets the -0.24 drop of the boot soles, keeping them exactly on ground (Y=0.0)!
    riderGroup.position.y = THREE.MathUtils.lerp(0.24, 0.44, transitionWeight)
    riderGroup.position.z = THREE.MathUtils.lerp(0.0, 0.06, transitionWeight)

    // --- 3. ☔ RAINSTORM DETECTION & UMBRELLA OPEN/CLOSE ENGINE ---
    stormCloudGroup.getWorldPosition(stormWorldPos)
    const distToStorm = stormWorldPos.distanceTo(robotWorldPos)
    const isUnderRain = distToStorm < 3.8

    // Smooth umbrella open/fold transition weight
    umbrellaWeight += ((isUnderRain ? 1.0 : 0.0) - umbrellaWeight) * 0.08
    
    // Scale umbrella (smooth unfold animation)
    const currentUmbrellaScale = THREE.MathUtils.lerp(0.001, 1.0, umbrellaWeight)
    umbrellaGroup.scale.set(currentUmbrellaScale, currentUmbrellaScale, currentUmbrellaScale)
    
    // Counter-rotate umbrella so shaft stays perfectly vertical overhead in 3D space!
    // Since armR rotates to X=2.2 (forward-up), we reverse this and add -0.25 to tilt nicely BACK over the head
    umbrellaGroup.rotation.x = THREE.MathUtils.lerp(0, -2.2 - torsoGroup.rotation.x - 0.25, umbrellaWeight)
    umbrellaGroup.rotation.z = THREE.MathUtils.lerp(0, -0.15, umbrellaWeight) + Math.sin(elapsedTime * 3) * 0.05

    // Kinematic posture animation
    if (transitionWeight < 0.5) {
      // 🚶‍♂️ WALKING MODE
      const walkCycle = elapsedTime * 5.5
      armL.rotation.x = Math.sin(walkCycle) * 0.45
      armL.rotation.z = -0.05

      // Right arm raises upward and slightly forward (X=2.2) to hold umbrella handle closely!
      if (umbrellaWeight > 0.1) {
        armR.rotation.x = THREE.MathUtils.lerp(-Math.sin(walkCycle) * 0.45, 2.2, umbrellaWeight)
        armR.rotation.z = THREE.MathUtils.lerp(0.05, 0.1, umbrellaWeight)
      } else {
        armR.rotation.x = -Math.sin(walkCycle) * 0.45
        armR.rotation.z = 0.05
      }

      legL.rotation.x = -Math.sin(walkCycle) * 0.50
      legR.rotation.x = Math.sin(walkCycle) * 0.50

      robotGroup.position.y = (planetRadius + 0.005) + Math.abs(Math.sin(walkCycle * 2)) * 0.012
      robotGroup.rotation.z = Math.sin(walkCycle) * 0.02
    } else {
      // 🚴‍♂️ CYCLING MODE
      armL.rotation.x = 0.88
      armL.rotation.z = -0.10

      // Right arm holds umbrella closely overhead while cycling in rain!
      if (umbrellaWeight > 0.1) {
        armR.rotation.x = THREE.MathUtils.lerp(0.88, 2.2, umbrellaWeight)
        armR.rotation.z = THREE.MathUtils.lerp(0.10, 0.1, umbrellaWeight)
      } else {
        armR.rotation.x = 0.88
        armR.rotation.z = 0.10
      }

      const pedalCycle = elapsedTime * 4.5
      legL.rotation.x = Math.sin(pedalCycle) * 0.15 + 0.20
      legR.rotation.x = -Math.sin(pedalCycle) * 0.15 + 0.20

      // Physically accurate wheel spin matching planet rotation EXACTLY (deltaY * 20)
      if (wheelFSpinner) wheelFSpinner.rotation.z += planetDeltaY * 20
      if (wheelBSpinner) wheelBSpinner.rotation.z += planetDeltaY * 20

      robotGroup.position.y = (planetRadius + 0.02) + Math.sin(elapsedTime * 9) * 0.004
      robotGroup.rotation.z = -0.04 + Math.sin(elapsedTime * 3) * 0.005
    }
    
    cloud1.position.y = 5 + Math.sin(elapsedTime * 0.5) * 0.3
    cloud3.position.y = 6 + Math.sin(elapsedTime * 0.6) * 0.3
    
    stars.rotation.y = elapsedTime * 0.005
    stars.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05
    
    // --- Natural Disasters Particle Physics ---
    particlesToUpdate.forEach(p => {
      p.mesh.position.add(p.velocity)
      if (p.life !== undefined) p.life++
      
      if (p.type === 'volcano') {
        p.velocity.y -= 0.0015 // gentle gravity
        // Fade out near end of life
        if (p.life! > p.maxLife!) {
          p.mesh.position.copy(p.origin)
          p.velocity.set(
            (Math.random() - 0.5) * 0.025,
            Math.random() * 0.04 + 0.025,
            (Math.random() - 0.5) * 0.025
          )
          p.life = 0
        }
      } else if (p.type === 'smoke') {
        // Smoke rises and expands, fading out
        const progress = p.life! / p.maxLife!
        p.mesh.scale.setScalar(1 + progress * 3)
        const mat = (p.mesh as THREE.Mesh).material as THREE.MeshStandardMaterial
        mat.opacity = 0.3 * (1 - progress)
        if (p.life! > p.maxLife!) {
          p.mesh.position.copy(p.origin)
          p.mesh.scale.setScalar(1)
          mat.opacity = 0.3
          p.life = 0
        }
      } else if (p.type === 'rain') {
        if (p.mesh.position.y < -4.0) {
          p.mesh.position.copy(p.origin)
        }
      }
    })
    
    // Lightning flash (random dramatic flash)
    lightningTimer--
    if (lightningTimer <= 0) {
      lightningLight.intensity = 8
      setTimeout(() => { lightningLight.intensity = 0 }, 80)
      setTimeout(() => { lightningLight.intensity = 4 }, 150)
      setTimeout(() => { lightningLight.intensity = 0 }, 200)
      lightningTimer = 120 + Math.floor(Math.random() * 300) // Flash every 2-8 seconds
    }
    
    renderer.render(scene, camera)
  }
  
  requestAnimationFrame(animate)

  const handleResize = () => {
    if (!container) return
    renderer.setSize(container.clientWidth, container.clientHeight)
    updateDioramaPosition()
  }
  
  window.addEventListener('resize', handleResize)
  
  // Dynamic Theme
  const getResolvedColor = (varName: string, fallback: string) => {
    const el = document.createElement('div')
    el.style.color = `var(${varName}, ${fallback})`
    el.style.display = 'none'
    document.body.appendChild(el)
    const color = getComputedStyle(el).color
    document.body.removeChild(el)
    return color
  }

  const updateTheme = () => {
    const isDark = document.documentElement.classList.contains('dark')
    const brandColorStr = getResolvedColor('--vp-c-brand-1', '#3b82f6')
    const bgColorStr = getResolvedColor('--vp-c-bg', isDark ? '#1b1b1f' : '#ffffff')
    
    planetMat.color.setHex(isDark ? 0x0f766e : 0x34d399) 
    treeMat.color.setHex(isDark ? 0x2dd4bf : 0x059669) // 恢复树木色彩的日夜间交替
    rockMat.color.setHex(isDark ? 0x475569 : 0x94a3b8)
    cloudMat.opacity = isDark ? 0.7 : 0.95
    starsMat.opacity = isDark ? 0.9 : 0.1
    
    hemiLight.intensity = isDark ? 0.4 : 0.7
    sunLight.intensity = isDark ? 0.6 : 1.2
    fillLight.intensity = isDark ? 0.8 : 0.6
    
    fillLight.color.set(new THREE.Color(brandColorStr))
    scene.fog = new THREE.FogExp2(new THREE.Color(bgColorStr), 0.018)
  }
  
  const observer = new MutationObserver(updateTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  setTimeout(updateTheme, 50) 

  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointerdown', onPointerDown)
    observer.disconnect()
    cancelAnimationFrame(animationFrameId)
    planetGeo.dispose()
    planetMat.dispose()
    starsGeom.dispose()
    starsMat.dispose()
    renderer.dispose()
  }
}
</script>

<style scoped>
/* --- Non-intrusive Loading Badge --- */
.model-loading-badge {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(128, 128, 128, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.mini-planet-spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px dashed var(--vp-c-brand);
  animation: spin 3s linear infinite;
  position: relative;
}

.mini-planet-spinner::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: var(--vp-c-brand);
  border-radius: 50%;
  box-shadow: 0 0 4px var(--vp-c-brand);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.badge-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.minimal-home-wrapper {
  position: relative;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base);
  min-height: calc(100vh + 5000px); /* Guarantee enough scroll track height for all GSAP triggers, regardless of viewport height */
}

/* --- Fixed Three.js Canvas Container --- */
.three-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Keep it behind content */
  pointer-events: auto; /* ALLOW INTERACTION (Dragging the planet) */
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Let clicks pass through empty space in these sections so user can drag the canvas */
.hero-section, .milestones-track {
  position: relative;
  z-index: 1;
  pointer-events: none; 
}

/* Re-enable pointer events for actual content */
.hero-section > *, .geom-card {
  pointer-events: auto;
}

/* --- Hero Section (Sticky to allow Tumble & Fade) --- */
.hero-section {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 8%;
  perspective: 1200px;
}

.hero-content {
  max-width: 1000px;
  transform-style: preserve-3d;
  transform-origin: left center;
  margin-top: -20vh; /* Push the hero title upwards as requested */
}

.word-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  padding-bottom: 0.1em; /* Prevent descenders from clipping */
  margin-bottom: -0.1em;
}

.hero-word {
  display: inline-block;
  transform: translateY(110%);
}

.space {
  display: inline-block;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin: 0 0 24px;
}

.highlight {
  background: linear-gradient(120deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin: 0;
  letter-spacing: 0.05em;
}

/* --- Milestones GSAP Track (Elegant Typography In-Place Switching) --- */
.milestones-track {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start; /* Changed from center to flex-start */
  padding-top: 30vh; /* Precisely control the vertical position (upper middle) */
  padding-left: 12%; /* Keep it to the left to balance the 3D globe on the right */
  pointer-events: none;
  z-index: 10;
  perspective: 2000px;
}

.milestones-container {
  position: relative;
  width: 500px;
  height: 400px;
  transform-style: preserve-3d;
  pointer-events: auto;
}

.typo-group {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: none; /* GSAP */
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.typo-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.typo-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
}

.typo-index {
  font-family: var(--vp-font-family-base);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  letter-spacing: 0.1em;
}

.typo-tag {
  font-family: var(--vp-font-family-base);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: linear-gradient(120deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.typo-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--vp-c-brand-1) 0%, transparent 100%);
  opacity: 0.5;
  transform-origin: left center;
}

.typo-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  margin: 0 0 24px;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.05); /* Very subtle premium shadow */
}

.typo-desc-wrapper {
  display: flex;
  align-items: stretch;
  gap: 20px;
}

.typo-desc-accent {
  width: 3px;
  background: linear-gradient(180deg, var(--vp-c-brand-1), transparent);
  border-radius: 2px;
}

.typo-desc {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--vp-c-text-2);
  margin: 0;
  font-weight: 400;
  max-width: 450px;
}

/* ==========================================
   Mobile Responsiveness
========================================== */
@media (max-width: 768px) {
  /* Hero Section Mobile Adjustments */
  .hero-section {
    padding: 0 5%;
  }

  /* Disable Three.js Interaction on Mobile to prevent scroll conflicts */
  .three-container {
    pointer-events: none;
  }

  .hero-content {
    margin-top: -10vh; /* Don't pull up as much on short mobile screens */
  }

  .hero-title {
    font-size: clamp(2.5rem, 12vw, 4rem);
  }

  .hero-subtitle {
    font-size: 1rem;
    line-height: 1.5;
  }

  /* Milestones Track Mobile Adjustments */
  .milestones-track {
    padding-left: 5%;
    padding-top: 15vh; /* Higher up to give text more vertical space */
  }

  .milestones-container {
    width: 90vw; /* Use percentage width instead of hard 500px */
    height: auto;
    min-height: 350px;
  }

  /* Typography Mobile Adjustments */
  .typo-title {
    font-size: clamp(2rem, 8vw, 2.5rem);
    margin-bottom: 16px;
  }

  .typo-desc {
    font-size: 1rem;
    line-height: 1.6;
    max-width: 100%;
  }
  
  .typo-header-row {
    margin-bottom: 12px;
  }
}
</style>
