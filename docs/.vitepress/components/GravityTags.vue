<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

const containerRef = ref<HTMLElement | null>(null)
let engine: any = null
let runner: any = null
let resizeObserver: any = null
let cleanupFns: Array<() => void> = []

import { NAV_DATA } from '../../nav/data'

// 动态色彩：为不同分类注入专属灵魂色，用于边缘高光与微弱泛光
const categoryIconColors: Record<string, string> = {
  '前端框架': '#10B981', // Vue 绿
  '开发工具': '#3B82F6', // 经典蓝
  '样式资源': '#EC4899', // CSS 粉
  '动画引擎': '#F59E0B', // 活力橙
  '可视化工具': '#14B8A6', // 数据青
  '设计资源': '#8B5CF6', // 设计紫
  'AI工具': '#06B6D4', // 科技青
  '接口服务': '#6366F1', // 服务蓝
  'default': '#8B5CF6'
}

// 针对不同分类定义专属的精美 SVG 图标
const categoryIcons: Record<string, string> = {
  '前端框架': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`, // 图层
  '开发工具': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`, // 扳手
  '样式资源': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`, // 水滴
  '动画引擎': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`, // 播放按钮
  '可视化工具': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, // 柱状图
  '设计资源': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`, // 钢笔工具
  'AI工具': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`, // 芯片
  '接口服务': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`, // 服务器
  'default': `<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>` // 六边形模块
}

// 从真实导航数据中提取所有工具标签
const allTags = NAV_DATA.flatMap((category, catIndex) => {
  return category.items.map((item, itemIndex) => {
    const displayName = item.tag || item.title
    const charLen = displayName.split('').reduce((acc, c) => acc + (c.charCodeAt(0) > 255 ? 2.2 : 1), 0)
    let width = Math.max(charLen * 6.5 + (item.icon ? 34 : 24), 60) 
    const iconUrl = item.icon
    const baseColor = categoryIconColors[category.title] || categoryIconColors['default']
    
    return {
      id: `tag-${catIndex}-${itemIndex}`,
      text: displayName,
      iconUrl,
      color: baseColor,
      width,
      height: 28,
      category: category.title,
      link: item.link
    }
  })
})

const tags = ref<any[]>([])

const refreshTags = () => {
  let shuffled = [...allTags]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  tags.value = shuffled.slice(0, 28)
}
refreshTags()

const tagElements = ref<{ [key: string]: HTMLElement }>({})
const setTagRef = (el: any, id: string) => { if (el) tagElements.value[id] = el }

const hoveredTag = ref<string | null>(null)

onMounted(async () => {
  let MatterModule: any
  try {
    const m = await import('matter-js')
    MatterModule = m.default || m
  } catch (e) {
    console.error('Failed to load matter-js', e)
    return
  }

  const { Engine, Runner, World, Bodies, Body, Composite, Events, Query } = MatterModule
  if (!containerRef.value) return

  const container = containerRef.value
  
  const getWidth = () => container.clientWidth
  const getHeight = () => container.clientHeight

  // --- 物理引擎 ---
  // 开启休眠模式 (enableSleeping): 极其重要！
  // 否则物理引擎在堆叠时会产生微小的亚像素级碰撞抖动。
  // 配合前面的 Math.round，这种微小抖动会导致元素在相邻的两个像素点之间疯狂横跳，看起来就像“标签在自己动”。
  engine = Engine.create({ enableSleeping: true })
  const world = engine.world

  const mkWall = (x: number, y: number, w: number, h: number) =>
    Bodies.rectangle(x, y, w, h, { isStatic: true, render: { visible: false } })

  // 恢复物理墙壁坐标为绝对边缘。
  // 我们不再通过“内缩物理墙”来防裁切，而是通过外层的 clip-path 解决，这样就能让左右下的边距恢复正常！
  let ground    = mkWall(getWidth() / 2, getHeight() + 50, getWidth() + 100, 100)
  let leftWall  = mkWall(-50, getHeight() / 2, 100, getHeight() * 2)
  let rightWall = mkWall(getWidth() + 50, getHeight() / 2, 100, getHeight() * 2)
  World.add(world, [ground, leftWall, rightWall])

  // --- 标签刚体 ---
  let bodiesMap: { [id: string]: any } = {}
  
  const addBodies = () => {
    // 清理旧刚体
    Object.values(bodiesMap).forEach(b => World.remove(world, b))
    bodiesMap = {}
    
    tags.value.forEach(tag => {
      const x = Math.random() * (getWidth() - 100) + 50
      const y = -Math.random() * 300 - 40
      const body = Bodies.rectangle(x, y, tag.width, tag.height, {
        chamfer: { radius: tag.height / 2 },
        restitution: 0.2, // 降低弹性（原0.5），防止落地后无休止的微小反弹
        friction: 0.5,    // 增大表面摩擦力（原0.1），让堆叠更稳定
        frictionAir: 0.02,// 稍微增加空气阻力，加速静止过程
        sleepThreshold: 15, // 降低休眠阈值（加快强制休眠速度）
        render: { visible: false },
      })
      bodiesMap[tag.id] = body
      World.add(world, body)
    })
  }

  addBodies()

  const onRefresh = () => {
    refreshTags()
    setTimeout(() => {
      addBodies()
    }, 50)
  }
  
  window.addEventListener('refresh-gravity-tags', onRefresh)
  cleanupFns.push(() => window.removeEventListener('refresh-gravity-tags', onRefresh))

  // --- 添加动态波浪力场 ---
  // 让方块的位置能够受到“隐形波浪”的持续影响，呼应背景的流动线条
  Events.on(engine, 'beforeUpdate', () => {
    const time = engine.timing.timestamp
    const allBodies = Composite.allBodies(world)
    for (const body of allBodies) {
      if (body.isStatic || body === dragBody) continue
      
      // 基于时间和坐标的三维正弦函数，模拟海浪般的升降与推挤
      const waveForceY = Math.sin(body.position.x * 0.01 + time * 0.002) * 0.000045 * body.mass
      const waveForceX = Math.cos(body.position.y * 0.01 + time * 0.0015) * 0.000015 * body.mass
      
      Body.applyForce(body, body.position, { x: waveForceX, y: waveForceY })
    }
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
    if (dragConstraint) {
      e.preventDefault()
      moveDrag(getRelPos(e))
    }
    
    // 通过物理引擎检测鼠标悬停
    if (container) {
      const rect = container.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const pos = getRelPos(e)
        const hit = Query.point(Object.values(bodiesMap), pos)[0]
        if (hit) {
          hoveredTag.value = Object.keys(bodiesMap).find(id => bodiesMap[id] === hit) || null
        } else {
          hoveredTag.value = null
        }
      } else {
        hoveredTag.value = null
      }
    }
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
          const tag = tags.value.find(t => t.id === tagId)
          if (tag && tag.link) {
            window.open(tag.link, '_blank')
          }
        }
      }
    }
  }

  const onTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
    startDrag(getRelPos(e.touches[0]))
    if (dragBody) {
      e.preventDefault()
    }
  }
  const onTouchMove = (e: TouchEvent) => {
    if (dragBody) {
      e.preventDefault()
      moveDrag(getRelPos(e.touches[0]))
    }
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
            const tag = tags.value.find(t => t.id === tagId)
            if (tag && tag.link) {
              window.open(tag.link, '_blank')
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
    tags.value.forEach(tag => {
      const body = bodiesMap[tag.id]
      const el = tagElements.value[tag.id]
      if (body && el) {
        let x = body.position.x - tag.width / 2
        let y = body.position.y - tag.height / 2
        
        // 极致优化：
        // 仅在物体完全静止（休眠）时进行 Math.round 取整，确保静态文本绝对锐利不发糊。
        // 在物体运动（掉落/拖拽）时保留完整的浮点数坐标，恢复 60fps 的丝滑物理动画，消除卡顿感。
        if (body.isSleeping) {
          x = Math.round(x)
          y = Math.round(y)
        }
        
        el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`
      }
    })
  })

  // --- Resize ---
  resizeObserver = new ResizeObserver(() => {
    const w = getWidth()
    const h = getHeight()
    // 同步恢复无内缩的绝对边缘坐标
    Body.setPosition(ground,    { x: w / 2, y: h + 50 })
    Body.setPosition(rightWall, { x: w + 50, y: h / 2  })
    Body.setPosition(leftWall,  { x: -50,    y: h / 2  })
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
    <!-- 极光柔和渐变背景 (对应用户截图中绝美的紫晕) -->
    <div class="bg-gradient"></div>
    
    <!-- 设计工具画布衬底 (SaaS Dot Matrix / Blueprint Grid) -->
    <!-- 优化：摒弃过于活泼的手绘涂鸦，改用 Vercel / Figma 等顶级开发者工具最常用的“极简点阵与十字蓝图”，不仅科技感拉满，还能完美衬托极简的高级胶囊 -->
    <svg class="bg-sketch" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="blueprint-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <!-- 核心点阵 -->
          <circle cx="16" cy="16" r="1.2" fill="currentColor" opacity="0.2" />
          <!-- 画布十字定位标 -->
          <path d="M 31.5 32 L 32.5 32 M 32 31.5 L 32 32.5" stroke="currentColor" stroke-width="1" opacity="0.3" />
          <path d="M -0.5 0 L 0.5 0 M 0 -0.5 L 0 0.5" stroke="currentColor" stroke-width="1" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
    </svg>

    <div
      v-for="tag in tags"
      :key="tag.id"
      :ref="(el) => setTagRef(el, tag.id)"
      class="gravity-tag"
      :class="{ 'is-hovered': hoveredTag === tag.id }"
      :style="{ 
        width: tag.width + 'px',
        height: tag.height + 'px',
        '--tag-color': tag.color
      }"
    >
      <span class="icon-wrapper" v-if="tag.iconUrl">
        <img :src="tag.iconUrl" @error="$event.target.style.display='none'" alt="" class="tag-icon-img" />
      </span>
      <span class="text-wrapper">{{ tag.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.gravity-tags-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 220px;
  flex: 1;
  border-radius: 12px;
  /* 移除 overflow: hidden，改用 clip-path */
  /* clip-path 允许右、下、左侧的阴影溢出 40px 而不被裁切，但同时死死卡住顶部（0px） */
  /* 这样掉落的胶囊在进入盒子前依然是隐藏的，完美解决所有痛点！ */
  clip-path: inset(0 -40px -40px -40px);
  margin: 0;
  touch-action: none;
  cursor: grab;
  user-select: none;
}
.gravity-tags-container:active { cursor: grabbing; }

.bg-gradient {
  position: absolute;
  inset: 0;
  /* 日间模式：复刻截图中极度柔和的淡紫/灰紫极光光晕 */
  background: radial-gradient(circle at 50% 50%, rgba(216, 180, 254, 0.3) 0%, rgba(243, 232, 255, 0.05) 70%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}
html.dark .bg-gradient {
  /* 夜间模式：幽暗的高级暗紫光晕 */
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
}

.bg-sketch {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  /* 手绘网格继承主题色，并通过不透明度打造“铅笔底稿”质感 */
  color: var(--vp-c-brand-1);
  opacity: 0.15;
  mask-image: radial-gradient(circle at 50% 50%, black 20%, transparent 90%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 20%, transparent 90%);
}
html.dark .bg-sketch {
  opacity: 0.1;
}

.gravity-tag {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 0 10px 0 8px;
  gap: 5px;
  text-align: center;
  white-space: nowrap;
  
  /* 日间模式：极致清爽的高级 SaaS 卡片 */
  /* 背景：完全纯白（或纯黑），剔除所有杂色，凸显原生 Logo */
  background: var(--vp-c-bg);
  
  /* 文字：使用标准的正文高对比度颜色，彻底解决“脏色/发灰”问题 */
  color: var(--vp-c-text-1);
  font-weight: 500; /* 回归标准字重，更加轻盈 */
  
  /* 边框：极其精细的极简边框 */
  border: 1px solid rgba(128, 128, 128, 0.12);
  
  border-radius: 9999px;
  
  /* 阴影：提供清晰纯粹的物理悬浮感，无多余高光干扰 */
  box-shadow: 
    0 4px 12px -2px rgba(0, 0, 0, 0.05),
    0 1px 3px -1px rgba(0, 0, 0, 0.03);
    
  /* 强制开启灰度抗锯齿，修复 Windows/部分屏幕下由 transform 硬件加速引起的字体发虚问题 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  backface-visibility: hidden;
  transform-style: preserve-3d;
    
  will-change: transform;
  pointer-events: none;
  user-select: none;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s, color 0.2s;
}

/* 暗黑模式：赛博动态色彩 (Dynamic Neon Accent) */
html.dark .gravity-tag {
  /* 背景：深黑底，注入 6% 的类目专属色，形成微微发光的高级科技感 */
  background: color-mix(in srgb, var(--tag-color) 6%, #1a1a1a);
  
  /* 边框：描绘 25% 亮度的品牌色线圈 */
  border: 1px solid color-mix(in srgb, var(--tag-color) 25%, transparent);
  
  /* 文字：用 85% 高纯度品牌色提亮，在暗色下如同霓虹灯般锐利耀眼 */
  color: color-mix(in srgb, var(--tag-color) 85%, #ffffff);
  
  /* 阴影：底层散发类目专属的环境色光晕 */
  box-shadow: 
    0 4px 12px -2px color-mix(in srgb, var(--tag-color) 15%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper .tag-icon-img {
  width: 14px;
  height: 14px;
  object-fit: contain;
  border-radius: 2px;
}

/* 因为有 pointer-events: none，所以我们只能通过外层容器悬停，或者取消 pointer-events: none */
/* 为了让物理拖拽正常工作，我们不能在标签上添加 hover，但可以通过添加特殊的交互类来处理 */
.gravity-tag.is-hovered {
  /* 日间模式悬浮：仅点亮边框和投影，保持文字纯粹，避免亮色文字在白底上看不清 */
  border-color: var(--tag-color);
  color: var(--vp-c-text-1);
  box-shadow: 
    0 8px 24px -4px color-mix(in srgb, var(--tag-color) 20%, transparent);
  z-index: 10;
}
html.dark .gravity-tag.is-hovered {
  /* 暗黑模式悬浮：霓虹灯拉满，100% 品牌色激发 */
  background: color-mix(in srgb, var(--tag-color) 12%, #1a1a1a);
  border-color: color-mix(in srgb, var(--tag-color) 60%, transparent);
  box-shadow: 
    0 8px 20px -4px color-mix(in srgb, var(--tag-color) 45%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>
