`<template>
  <div class="puzzle-container">
    <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
      @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"></canvas>
    <div class="controls">
      <button class="difficulty-btn" :class="{ active: currentLevel === 'easy' }" @click="changeDifficulty('easy')"
        data-level="easy">简单</button>
      <button class="difficulty-btn" :class="{ active: currentLevel === 'medium' }" @click="changeDifficulty('medium')"
        data-level="medium">中等</button>
      <button class="difficulty-btn" :class="{ active: currentLevel === 'hard' }" @click="changeDifficulty('hard')"
        data-level="hard">困难</button>
      <button id="hintButton" @click="showHint">提示</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// 类型定义
interface Point {
  x: number
  y: number
}

interface Piece {
  id: number
  shape: Point[]
  correctX: number
  correctY: number
  width: number
  height: number
  row: number
  col: number
  x: number
  y: number
  fixed: boolean
}

interface GameConfig {
  piecesPerSide: number
}

interface GameConfigs {
  [key: string]: GameConfig
}

// 游戏配置
const config: GameConfigs = {
  easy: { piecesPerSide: 3 },
  medium: { piecesPerSide: 4 },
  hard: { piecesPerSide: 5 }
}

// 区域定义
const puzzleArea = {
  x: 0,
  y: 0,
  width: 300,
  height: 300
}

const operationArea = {
  x: 300,
  y: 0,
  width: 300,
  height: 300
}

// 响应式状态
const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentLevel = ref('easy')
const pieces = ref<Piece[]>([])
const draggingPiece = ref<Piece | null>(null)
const hintPiece = ref<Piece | null>(null)
const offsetX = ref(0)
const offsetY = ref(0)
const gameStarted = ref(false)

// 创建图片对象
const img = new Image()
img.crossOrigin = "Anonymous"
img.src = "https://picsum.photos/300"

// 随机生成操作区内的位置
const randomPosition = (): Point => {
  return {
    x: operationArea.x + Math.random() * (operationArea.width - 100),
    y: Math.random() * (operationArea.height - 100)
  }
}

// 生成拼图碎片的拼合点
const generateJigsaw = (row: number, col: number, width: number, height: number, piecesPerSide: number): Point[] => {
  const jigSize = Math.min(width, height) * 0.15

  const baseRect = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ]

  const result: Point[] = []

  for (let i = 0; i < 4; i++) {
    const p1 = baseRect[i]
    const p2 = baseRect[(i + 1) % 4]

    result.push({ x: p1.x, y: p1.y })

    if ((i === 0 && row > 0) ||
        (i === 1 && col < piecesPerSide - 1) ||
        (i === 2 && row < piecesPerSide - 1) ||
        (i === 3 && col > 0)) {

      const midX = (p1.x + p2.x) / 2
      const midY = (p1.y + p2.y) / 2

      let perpX = 0, perpY = 0

      if (i === 0 || i === 2) {
        perpY = i === 0 ? -jigSize : jigSize
        if ((row + col) % 2 === 0) perpY = -perpY
      } else {
        perpX = i === 3 ? -jigSize : jigSize
        if ((row + col) % 2 === 1) perpX = -perpX
      }

      const ctrlDist = Math.min(width, height) * 0.1
      result.push({ x: (p1.x + midX) / 2 + perpX * 0.3, y: (p1.y + midY) / 2 + perpY * 0.3 })
      result.push({ x: midX + perpX, y: midY + perpY })
      result.push({ x: (midX + p2.x) / 2 + perpX * 0.3, y: (midY + p2.y) / 2 + perpY * 0.3 })
    }
  }

  return result
}

// 判断点是否在多边形内
const isPointInPolygon = (x: number, y: number, polygon: Point[], offsetX: number, offsetY: number): boolean => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x + offsetX, yi = polygon[i].y + offsetY
    let xj = polygon[j].x + offsetX, yj = polygon[j].y + offsetY

    let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

// 生成拼图碎片
const generatePieces = () => {
  pieces.value = []
  const piecesPerSide = config[currentLevel.value].piecesPerSide
  const pieceWidth = puzzleArea.width / piecesPerSide
  const pieceHeight = puzzleArea.height / piecesPerSide

  for (let row = 0; row < piecesPerSide; row++) {
    for (let col = 0; col < piecesPerSide; col++) {
      const x = col * pieceWidth
      const y = row * pieceHeight

      const shape = generateJigsaw(row, col, pieceWidth, pieceHeight, piecesPerSide)

      const piece: Piece = {
        id: row * piecesPerSide + col,
        shape,
        correctX: x,
        correctY: y,
        width: pieceWidth,
        height: pieceHeight,
        row,
        col,
        x: randomPosition().x,
        y: randomPosition().y,
        fixed: false
      }

      pieces.value.push(piece)
    }
  }

  pieces.value.sort(() => Math.random() - 0.5)
  drawPuzzle()
}

// 绘制拼图
const drawPuzzle = () => {
  const canvas = canvasRef.value
  if (!canvas || !img.complete) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制背景和区域
  ctx.drawImage(img, puzzleArea.x, puzzleArea.y, puzzleArea.width, puzzleArea.height)
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
  ctx.fillRect(puzzleArea.x, puzzleArea.y, puzzleArea.width, puzzleArea.height)

  // 绘制区域轮廓
  ctx.strokeStyle = "#aaa"
  ctx.lineWidth = 1
  ctx.strokeRect(puzzleArea.x, puzzleArea.y, puzzleArea.width, puzzleArea.height)
  ctx.strokeRect(operationArea.x, operationArea.y, operationArea.width, operationArea.height)

  // 绘制已固定的碎片
  pieces.value.forEach(piece => {
    if (piece.fixed) {
      drawFixedPiece(piece, ctx)
    }
  })

  // 绘制未固定的碎片
  pieces.value.forEach(piece => {
    if (!piece.fixed) {
      drawFloatingPiece(piece, ctx)
    }
  })
}

// 绘制浮动碎片
const drawFloatingPiece = (piece: Piece, ctx: CanvasRenderingContext2D) => {
  ctx.save()

  if (draggingPiece.value === piece) {
    const distanceThreshold = 60
    const targetX = puzzleArea.x + piece.correctX
    const targetY = puzzleArea.y + piece.correctY

    if (Math.abs(piece.x - targetX) < distanceThreshold &&
        Math.abs(piece.y - targetY) < distanceThreshold) {
      ctx.save()
      ctx.strokeStyle = "rgba(46, 125, 50, 0.6)"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])

      ctx.beginPath()
      piece.shape.forEach((point, i) => {
        if (i === 0) ctx.moveTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y)
        else ctx.lineTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y)
      })
      ctx.closePath()
      ctx.stroke()

      ctx.restore()
    }
  }

  // 绘制碎片
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  ctx.beginPath()
  piece.shape.forEach((point, i) => {
    if (i === 0) ctx.moveTo(piece.x + point.x, piece.y + point.y)
    else ctx.lineTo(piece.x + point.x, piece.y + point.y)
  })
  ctx.closePath()

  ctx.save()
  ctx.clip()

  const scaleX = img.width / puzzleArea.width
  const scaleY = img.height / puzzleArea.height

  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity

  piece.shape.forEach(point => {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  })

  const margin = 2
  minX -= margin
  minY -= margin
  maxX += margin
  maxY += margin

  const rectWidth = maxX - minX
  const rectHeight = maxY - minY

  const correctXWithOffset = piece.correctX + minX
  const correctYWithOffset = piece.correctY + minY

  const sourceX = correctXWithOffset * scaleX
  const sourceY = correctYWithOffset * scaleY
  const sourceWidth = rectWidth * scaleX
  const sourceHeight = rectHeight * scaleY

  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    piece.x + minX, piece.y + minY, rectWidth, rectHeight
  )

  ctx.restore()

  ctx.strokeStyle = "#666"
  ctx.lineWidth = 1
  ctx.stroke()

  if (hintPiece.value === piece) {
    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.globalAlpha = 0.3
    ctx.fillStyle = "lime"

    ctx.beginPath()
    piece.shape.forEach((point, i) => {
      if (i === 0) ctx.moveTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y)
      else ctx.lineTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y)
    })
    ctx.closePath()
    ctx.fill()

    ctx.globalAlpha = 1.0
  }

  ctx.restore()
}

// 绘制固定碎片
const drawFixedPiece = (piece: Piece, ctx: CanvasRenderingContext2D) => {
  ctx.save()

  const pieceX = puzzleArea.x + piece.correctX
  const pieceY = puzzleArea.y + piece.correctY

  ctx.beginPath()
  piece.shape.forEach((point, i) => {
    if (i === 0) ctx.moveTo(pieceX + point.x, pieceY + point.y)
    else ctx.lineTo(pieceX + point.x, pieceY + point.y)
  })
  ctx.closePath()

  ctx.clip()

  const scaleX = img.width / puzzleArea.width
  const scaleY = img.height / puzzleArea.height

  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity

  piece.shape.forEach(point => {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  })

  const margin = 2
  minX -= margin
  minY -= margin
  maxX += margin
  maxY += margin

  const rectWidth = maxX - minX
  const rectHeight = maxY - minY

  const sourceX = (piece.correctX + minX) * scaleX
  const sourceY = (piece.correctY + minY) * scaleY
  const sourceWidth = rectWidth * scaleX
  const sourceHeight = rectHeight * scaleY

  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    pieceX + minX, pieceY + minY, rectWidth, rectHeight
  )

  ctx.strokeStyle = "#388E3C"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

// 事件处理函数
const handleMouseDown = (e: MouseEvent) => {
  if (!gameStarted.value) return

  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  for (let i = pieces.value.length - 1; i >= 0; i--) {
    const piece = pieces.value[i]

    if (!piece.fixed && isPointInPolygon(mouseX, mouseY, piece.shape, piece.x, piece.y)) {
      draggingPiece.value = piece

      pieces.value.splice(i, 1)
      pieces.value.push(piece)

      offsetX.value = mouseX - piece.x
      offsetY.value = mouseY - piece.y

      break
    }
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!draggingPiece.value) return

  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  draggingPiece.value.x = mouseX - offsetX.value
  draggingPiece.value.y = mouseY - offsetY.value

  const closeThreshold = 30
  const targetX = puzzleArea.x + draggingPiece.value.correctX
  const targetY = puzzleArea.y + draggingPiece.value.correctY

  if (Math.abs(draggingPiece.value.x - targetX) < closeThreshold &&
      Math.abs(draggingPiece.value.y - targetY) < closeThreshold) {
    const xDistance = targetX - draggingPiece.value.x
    const yDistance = targetY - draggingPiece.value.y
    const ratio = 0.2

    draggingPiece.value.x += xDistance * ratio
    draggingPiece.value.y += yDistance * ratio
  }

  drawPuzzle()
}

const handleMouseUp = () => {
  if (!draggingPiece.value) return

  const inPuzzleArea = (
    draggingPiece.value.x >= puzzleArea.x - 50 &&
    draggingPiece.value.y >= puzzleArea.y - 50 &&
    draggingPiece.value.x < puzzleArea.x + puzzleArea.width - 50 &&
    draggingPiece.value.y < puzzleArea.y + puzzleArea.height - 50
  )

  if (inPuzzleArea && isPieceNearCorrectPosition(draggingPiece.value)) {
    draggingPiece.value.x = puzzleArea.x + draggingPiece.value.correctX
    draggingPiece.value.y = puzzleArea.y + draggingPiece.value.correctY
    draggingPiece.value.fixed = true
  } else {
    Object.assign(draggingPiece.value, randomPosition())
  }

  drawPuzzle()
  draggingPiece.value = null

  if (pieces.value.every(p => p.fixed)) {
    setTimeout(() => {
      alert(`恭喜你完成了${currentLevel.value === 'easy' ? '初级' : currentLevel.value === 'medium' ? '中级' : '高级'}难度的拼图！🎉`)
    }, 300)
  }
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  handleMouseDown(mouseEvent)
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  if (!draggingPiece.value) return

  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  handleMouseMove(mouseEvent)
}

const handleTouchEnd = (e: TouchEvent) => {
  e.preventDefault()
  handleMouseUp()
}

// 提示功能
const showHint = () => {
  if (!gameStarted.value) return

  const unfixedPieces = pieces.value.filter(p => !p.fixed)

  if (unfixedPieces.length === 0) {
    alert("所有碎片已经完成！")
    return
  }

  hintPiece.value = unfixedPieces[Math.floor(Math.random() * unfixedPieces.length)]
  drawPuzzle()

  setTimeout(() => {
    hintPiece.value = null
    drawPuzzle()
  }, 5000)
}

// 切换难度
const changeDifficulty = (level: string) => {
  currentLevel.value = level
  generatePieces()
}

// 检查碎片是否在正确位置附近
const isPieceNearCorrectPosition = (piece: Piece): boolean => {
  const distanceThreshold = 60
  const targetX = puzzleArea.x + piece.correctX
  const targetY = puzzleArea.y + piece.correctY

  return (
    Math.abs(piece.x - targetX) < distanceThreshold &&
    Math.abs(piece.y - targetY) < distanceThreshold
  )
}

// 生命周期钩子
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = puzzleArea.width + operationArea.width
  canvas.height = Math.max(puzzleArea.height, operationArea.height)

  img.onload = () => {
    gameStarted.value = true
    generatePieces()
  }

  img.onerror = () => {
    console.error("图片加载失败")
    alert("图片加载失败，请检查网络连接或刷新页面重试。")
  }
})

// 监听难度变化
watch(currentLevel, () => {
  generatePieces()
})
</script>

<style scoped>
.puzzle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

canvas {
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.difficulty-btn {
  background-color: #e0e0e0;
}

.difficulty-btn.active {
  background-color: #4caf50;
  color: white;
}

#hintButton {
  background-color: #2196f3;
  color: white;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>