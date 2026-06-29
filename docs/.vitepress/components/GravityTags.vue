<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

const containerRef = ref<HTMLElement | null>(null)
let engine: any = null
let runner: any = null
let resizeObserver: any = null
let cleanupFns: Array<() => void> = []

const tags = [
  // AI 工具
  { id: 'tag-25', text: 'v0', color: '#000000', width: 44, height: 26, category: 'AI工具' },
  { id: 'tag-26', text: 'Claude', color: '#d97757', width: 64, height: 26, category: 'AI工具' },
  { id: 'tag-27', text: 'Gemini', color: '#1a73e8', width: 64, height: 26, category: 'AI工具' },

  // 前端框架
  { id: 'tag-1', text: 'Vue 3', color: '#42b883', width: 56, height: 26, category: '前端框架' },
  { id: 'tag-2', text: 'Naive UI', color: '#63e2b7', width: 72, height: 26, category: '前端框架' },
  { id: 'tag-3', text: 'Pinia', color: '#ffe251', width: 52, height: 26, category: '前端框架' },
  { id: 'tag-4', text: 'Nuxt.js', color: '#00dc82', width: 64, height: 26, category: '前端框架' },
  { id: 'tag-28', text: 'React', color: '#61dafb', width: 60, height: 26, category: '前端框架' },
  { id: 'tag-29', text: 'Node.js', color: '#339933', width: 72, height: 26, category: '前端框架' },
  { id: 'tag-6', text: 'Element-Plus', color: '#409eff', width: 94, height: 26, category: '前端框架' },
  { id: 'tag-11', text: 'TailwindCSS', color: '#0ea5e9', width: 88, height: 26, category: '前端框架' },

  // 开发工具
  { id: 'tag-12', text: 'TypeScript', color: '#3178c6', width: 84, height: 26, category: '开发工具' },
  { id: 'tag-13', text: 'CODELF', color: '#292b36', width: 64, height: 26, category: '开发工具' },
  { id: 'tag-14', text: 'Boot CDN', color: '#000000', width: 76, height: 26, category: '开发工具' },
  { id: 'tag-15', text: 'Can I use', color: '#e45625', width: 76, height: 26, category: '开发工具' },

  // 样式资源
  { id: 'tag-16', text: 'CSS Grid', color: '#8338ec', width: 72, height: 26, category: '样式资源' },
  { id: 'tag-19', text: 'ColorSpace', color: '#e6528d', width: 84, height: 26, category: '样式资源' },
  { id: 'tag-20', text: 'Animate.css', color: '#f36622', width: 88, height: 26, category: '样式资源' },

  // 动画引擎
  { id: 'tag-21', text: 'Three.JS', color: '#000000', width: 72, height: 26, category: '动画引擎' },
  { id: 'tag-22', text: 'GSAP', color: '#88ce02', width: 52, height: 26, category: '动画引擎' },
  { id: 'tag-23', text: 'Cocos', color: '#09a1ed', width: 56, height: 26, category: '动画引擎' },
  { id: 'tag-24', text: 'sketchfab', color: '#1caad9', width: 76, height: 26, category: '动画引擎' }
]

const tagElements = ref<{ [key: string]: HTMLElement }>({})
const setTagRef = (el: any, id: string) => { if (el) tagElements.value[id] = el }

onMounted(async () => {
  let MatterModule: any
  try {
    const m = await import('matter-js')
    MatterModule = m.default || m
  } catch (e) {
    console.error('Failed to load matter-js', e)
    return
  }

  const { Engine, Runner, World, Bodies, Body, Composite, Events } = MatterModule
  if (!containerRef.value) return

  const container = containerRef.value
  const height = 290

  const getWidth = () => container.clientWidth

  // --- 物理引擎 ---
  engine = Engine.create()
  const world = engine.world

  const mkWall = (x: number, y: number, w: number, h: number) =>
    Bodies.rectangle(x, y, w, h, { isStatic: true, render: { visible: false } })

  let ground    = mkWall(getWidth() / 2, height + 50, getWidth() + 100, 100)
  let leftWall  = mkWall(-50, height / 2, 100, height * 2)
  let rightWall = mkWall(getWidth() + 50, height / 2, 100, height * 2)
  World.add(world, [ground, leftWall, rightWall])

  // --- 标签刚体 ---
  const bodiesMap: { [id: string]: any } = {}
  tags.forEach(tag => {
    const x = Math.random() * (getWidth() - 100) + 50
    const y = -Math.random() * 300 - 40
    const body = Bodies.rectangle(x, y, tag.width, tag.height, {
      chamfer: { radius: tag.height / 2 },
      restitution: 0.5,
      friction: 0.1,
      frictionAir: 0.01,
      render: { visible: false },
    })
    bodiesMap[tag.id] = body
    World.add(world, body)
  })

  // --- 手动实现鼠标拖拽，完全绕开 Matter Mouse API ---
  let dragBody: any = null
  let dragOffset = { x: 0, y: 0 }
  let mousePos = { x: 0, y: 0 }
  // 弹簧体用于平滑拖拽
  let dragConstraint: any = null

  const getRelPos = (e: MouseEvent | Touch) => {
    const rect = container.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const findBodyAt = (pos: { x: number; y: number }) => {
    const allBodies = Composite.allBodies(world)
    for (const body of allBodies) {
      if (body.isStatic) continue
      if (MatterModule.Bounds.contains(body.bounds, pos) &&
          MatterModule.Vertices.contains(body.vertices, pos)) {
        return body
      }
    }
    return null
  }

  const startDrag = (pos: { x: number; y: number }) => {
    dragBody = findBodyAt(pos)
    if (!dragBody) return
    // 施加弹簧约束来拉动物体，避免直接设置位置造成穿墙
    dragConstraint = MatterModule.Constraint.create({
      pointA: pos,
      bodyB: dragBody,
      pointB: {
        x: pos.x - dragBody.position.x,
        y: pos.y - dragBody.position.y,
      },
      stiffness: 0.2,
      damping: 0,
      render: { visible: false },
    })
    World.add(world, dragConstraint)
    // 拖拽时增加阻尼，让拖拽感觉更顺滑
    Body.setAngularVelocity(dragBody, 0)
    mousePos = { ...pos }
  }

  const moveDrag = (pos: { x: number; y: number }) => {
    if (!dragConstraint) return
    dragConstraint.pointA = { ...pos }
    mousePos = { ...pos }
  }

  const endDrag = () => {
    if (dragConstraint) {
      World.remove(world, dragConstraint)
      dragConstraint = null
    }
    dragBody = null
  }

  let startX = 0
  let startY = 0
  let startTime = 0

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    startX = e.clientX
    startY = e.clientY
    startTime = Date.now()
    startDrag(getRelPos(e))
  }
  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    moveDrag(getRelPos(e))
  }
  const onMouseUp = (e: MouseEvent) => {
    endDrag()
    if (Date.now() - startTime < 200) {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (dx * dx + dy * dy < 25) {
        const pos = getRelPos(e)
        const hit = Query.point(Object.values(bodiesMap), pos)[0]
        if (hit) {
          const tagId = Object.keys(bodiesMap).find(id => bodiesMap[id] === hit)
          const tag = tags.find(t => t.id === tagId)
          if (tag && tag.category) {
            router.go(`/nav/#${tag.category}`)
          }
        }
      }
    }
  }

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
    startDrag(getRelPos(e.touches[0]))
  }
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    moveDrag(getRelPos(e.touches[0]))
  }
  const onTouchEnd = (e: TouchEvent) => { 
    endDrag()
    if (Date.now() - startTime < 200) {
      const touch = e.changedTouches[0]
      if (touch) {
        const dx = touch.clientX - startX
        const dy = touch.clientY - startY
        if (dx * dx + dy * dy < 100) {
          const rect = container.getBoundingClientRect()
          const pos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
          const hit = Query.point(Object.values(bodiesMap), pos)[0]
          if (hit) {
            const tagId = Object.keys(bodiesMap).find(id => bodiesMap[id] === hit)
            const tag = tags.find(t => t.id === tagId)
            if (tag && tag.category) {
              router.go(`/nav/#${tag.category}`)
            }
          }
        }
      }
    }
  }

  // mousedown 在 container，move/up 在 window（这是关键！）
  container.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  container.addEventListener('touchstart', onTouchStart, { passive: false })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)

  cleanupFns.push(() => {
    container.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    container.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
  })

  // --- 同步 DOM ---
  runner = Runner.create()
  Runner.run(runner, engine)

  Events.on(engine, 'afterUpdate', () => {
    tags.forEach(tag => {
      const body = bodiesMap[tag.id]
      const el = tagElements.value[tag.id]
      if (body && el) {
        const x = body.position.x - tag.width / 2
        const y = body.position.y - tag.height / 2
        el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${body.angle}rad)`
      }
    })
  })

  // --- Resize ---
  resizeObserver = new ResizeObserver(() => {
    const w = getWidth()
    Body.setPosition(ground,    { x: w / 2,      y: height + 50 })
    Body.setPosition(rightWall, { x: w + 50,     y: height / 2  })
    Body.setPosition(leftWall,  { x: -50,         y: height / 2  })
  })
  resizeObserver.observe(container)
})

onUnmounted(() => {
  cleanupFns.forEach(fn => fn())
  cleanupFns = []
  if (resizeObserver) resizeObserver.disconnect()
  if (runner) runner.enabled = false
  if (engine) engine.events = {}
})
</script>

<template>
  <div
    class="gravity-tags-container"
    ref="containerRef"
    @dragstart.prevent
    @contextmenu.prevent
    @selectstart.prevent
    @click.stop
  >
    <div class="bg-title">
      <h3>工具箱</h3>
      <p>我的效率与生产力工具合集</p>
    </div>

    <div
      v-for="tag in tags"
      :key="tag.id"
      :ref="(el) => setTagRef(el, tag.id)"
      class="gravity-tag"
      :style="{
        width: tag.width + 'px',
        height: tag.height + 'px',
        '--tag-color': tag.color,
        '--tag-color-shadow': tag.color + '40'
      }"
    >{{ tag.text }}</div>
  </div>
</template>

<style scoped>
.gravity-tags-container {
  position: relative;
  width: 100%;
  height: 290px;
  border-radius: 12px;
  overflow: hidden;
  margin: 0;
  touch-action: none;
  cursor: grab;
  user-select: none;
}
.gravity-tags-container:active { cursor: grabbing; }

.bg-title {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
}
.bg-title h3 {
  font-family: 'Georgia', serif;
  font-style: italic;
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
  letter-spacing: -1px;
  opacity: 0.8;
}
.bg-title p {
  font-family: monospace;
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  margin-top: 4px;
  letter-spacing: 1px;
  opacity: 0.6;
}

.gravity-tag {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  /* 极简玻璃拟物风：淡色底色，彩色发光边框 */
  background: var(--vp-c-bg);
  border: 1.5px solid var(--tag-color);
  color: var(--tag-color);
  border-radius: 9999px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
  will-change: transform;
  pointer-events: none; /* 让鼠标事件穿透到容器，由手动 listener 统一处理 */
  user-select: none;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s;
}

/* 因为有 pointer-events: none，所以我们只能通过外层容器悬停，或者取消 pointer-events: none */
/* 为了让物理拖拽正常工作，我们不能在标签上添加 hover，但可以通过添加特殊的交互类来处理 */
.gravity-tag.is-hovered {
  background: var(--tag-color);
  color: #ffffff;
  box-shadow: 0 6px 16px var(--tag-color-shadow);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
