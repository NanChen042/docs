# 从零开始打造HTML5拼图游戏：一个Canvas实战项目

> 你是否曾经被那些精美的网页拼图游戏所吸引？用 HTML5 的 Canvas 技术，从零开始，教你怎么画图、处理鼠标事件，还有游戏的核心逻辑，最后实现一个完整的拼图游戏！

## 1. 前言：为什么选择Canvas开发拼图游戏？

在开始动手之前，我想分享一下为什么选择HTML5 Canvas来开发拼图游戏。相比于传统的DOM操作，Canvas提供了更高效的图形渲染能力和更灵活的像素级控制。对于拼图这种需要处理不规则形状和复杂交互的游戏来说，Canvas无疑是最佳选择。

在我尝试过各种技术方案后，最终确定了这套实现方案，它具有以下优势：

- **性能优异**：即使在移动设备上也能流畅运行
- **视觉效果好**：支持不规则拼图形状、平滑动画和精确的图像裁剪
- **交互体验佳**：磁性吸附、拖放操作和触摸支持让游戏体验更加友好
- **代码结构清晰**：便于理解和扩展

本文将分享我在开发这款拼图游戏过程中的经验和技巧，希望能对你的Canvas游戏开发之旅有所帮助。

## 2. 游戏功能与效果展示

在深入代码实现之前，让我们先来看看这个拼图游戏能做什么：

- **多种难度级别**：初级(3×3)、中级(4×4)、高级(5×5)和不规则形状模式
- **锯齿形拼图**：每个拼图碎片都有独特的锯齿形状，能够完美拼合
- **智能交互**：
  - 拖放操作：直观地拖动和放置拼图碎片
  - 磁性吸附：当碎片接近正确位置时会有轻微的吸引力
  - 自动对齐：正确放置的碎片会自动对齐并固定
- **辅助功能**：提供提示功能帮助玩家找到正确位置
- **全设备支持**：同时支持鼠标和触摸屏操作，可在电脑和移动设备上游玩

当你完成整个拼图时，游戏会显示祝贺信息，让玩家体验到成就感。整体来说，这是一个兼具挑战性和趣味性的小游戏，非常适合Canvas初学者作为练手项目。

效果展示：
<Games />

## 3. 核心设计与数据结构

任何游戏开发的第一步都是设计合适的数据结构。在我们的拼图游戏中，需要管理拼图的状态、形状和位置，所以设计了以下核心数据结构：

### 3.1 游戏配置

游戏配置决定了不同难度级别的参数，主要是每边的拼图数量：

```javascript
const config = {
  easy: { piecesPerSide: 3 },      // 3x3=9块
  medium: { piecesPerSide: 4 },    // 4x4=16块
  hard: { piecesPerSide: 5 },      // 5x5=25块
  irregular: { piecesPerSide: 3 }  // 使用预定义的不规则形状，3x3布局
};
```

这种设计允许我们轻松地扩展更多难度级别，只需添加新的配置项即可。比如，如果将来想添加一个"噩梦"难度，可以简单地添加 `nightmare: { piecesPerSide: 6 }`。

### 3.2 游戏状态变量

为了跟踪游戏的当前状态，我设计了一组关键变量：

```javascript
let currentLevel = "easy";        // 当前难度级别
let pieces = [];                  // 所有拼图碎片的数组
let draggingPiece = null;         // 当前正在拖动的碎片
let hintPiece = null;             // 当前提示高亮的碎片
let offsetX = 0, offsetY = 0;     // 拖动时的鼠标偏移量
let gameStarted = false;          // 游戏是否已开始
```

这些状态变量共同构成了游戏的"记忆系统"，使游戏能够正确响应用户操作并维持连贯的体验。

### 3.3 拼图碎片的数据结构

每个拼图碎片是一个复杂的对象，包含多种属性：

```javascript
{
  id: Number,            // 唯一标识符，用于区分不同碎片
  shape: Array,          // 形状点数组，定义碎片的多边形轮廓
  correctX: Number,      // 正确位置的X坐标（拼图区域内）
  correctY: Number,      // 正确位置的Y坐标（拼图区域内）
  width: Number,         // 碎片基本宽度
  height: Number,        // 碎片基本高度
  row: Number,           // 行索引（在拼图网格中）
  col: Number,           // 列索引（在拼图网格中）
  x: Number,             // 当前X坐标（可能在操作区或拼图区）
  y: Number,             // 当前Y坐标（可能在操作区或拼图区）
  fixed: Boolean         // 是否已固定到正确位置
}
```

这个数据结构的设计反映了拼图碎片的二重性：它既有一个"应该在的位置"（correctX/Y），也有一个"当前位置"（x/y）。当玩家成功将碎片放到正确位置时，fixed属性会被设置为true，表示该碎片已完成。

### 3.4 游戏区域定义

游戏界面分为两个主要区域：

```javascript
const puzzleArea = {
  x: 0,
  y: 0,
  width: 600,
  height: 600
};

const operationArea = {
  x: 620,
  y: 0,
  width: 340,
  height: 600
};
```

左侧的拼图区是玩家需要完成拼图的地方，而右侧的操作区则存放未使用的拼图碎片。这种分区设计使界面清晰，玩家可以轻松区分"工作区"和"材料区"。

这些核心数据结构共同构成了拼图游戏的骨架，为后续的功能实现奠定了基础。在设计这些结构时，我特别注重了可扩展性和可维护性，使代码更容易理解和修改。

## 4. 初始化与资源加载

游戏开发中，初始化是至关重要的一步。我们需要设置画布、加载图片，并准备好游戏的初始状态。

### 4.1 Canvas与图片准备

首先，我们需要获取Canvas元素并创建2D绘图上下文：

```javascript
const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");
```

然后，加载要用于拼图的图片：

```javascript
const img = new Image();
img.crossOrigin = "Anonymous"; // 添加跨域支持
img.src = "https://images.pexels.com/photos/87452/flowers-background-butterflies-beautiful-87452.jpeg?auto=compress&cs=tinysrgb&w=600";
```

注意我添加了`crossOrigin`属性，这是因为我们使用的是外部图片源。如果没有这个属性，当图片来自不同域时，Canvas会被"污染"，导致无法通过`toDataURL()`或`getImageData()`方法提取像素数据。

在实际项目中，我建议尽可能使用自己服务器上的图片，以避免跨域问题和外部资源不可用的风险。

### 4.2 图片加载完成后的初始化

接下来是图片加载完成后的初始化逻辑：

```javascript
img.onload = () => {
  console.log("图片加载完成:", img.width, "x", img.height);
  
  // 设置canvas大小以适应拼图区和操作区
  canvas.width = puzzleArea.width + operationArea.width;
  canvas.height = Math.max(puzzleArea.height, operationArea.height);
  
  // 默认选中初级难度
  document.querySelector('.difficulty-btn[data-level="easy"]').classList.add('active');
  
  // 生成拼图碎片
  generatePieces();
  gameStarted = true;
  
  console.log("游戏已初始化，难度: " + currentLevel + "，碎片数量: ", pieces.length);
};
```

这里我做了几件重要的事：
1. 根据拼图区和操作区的大小设置Canvas的尺寸
2. 通过CSS类标记当前选中的难度级别
3. 调用`generatePieces()`生成拼图碎片
4. 设置`gameStarted`为true，表示游戏已准备就绪

另外，我还添加了图片加载失败的处理：

```javascript
img.onerror = () => {
  console.error("图片加载失败");
  alert("图片加载失败，请检查网络连接或刷新页面重试。");
};
```

良好的错误处理可以提升用户体验，让他们知道发生了什么问题，而不是面对一个无响应的界面。

## 5. 拼图碎片生成

拼图游戏的核心在于生成形状独特、能够完美拼合的拼图碎片。这是整个项目中最具挑战性的部分。

### 5.1 生成拼图碎片

先来看看生成拼图碎片的主函数：

```javascript
function generatePieces() {
  console.log("生成拼图碎片，难度:", currentLevel);
  pieces = [];
  
  // 获取配置
  const piecesPerSide = config[currentLevel].piecesPerSide;
  const pieceWidth = puzzleArea.width / piecesPerSide;
  const pieceHeight = puzzleArea.height / piecesPerSide;
  
  // 生成所有碎片
  for (let row = 0; row < piecesPerSide; row++) {
    for (let col = 0; col < piecesPerSide; col++) {
      // 计算碎片在原图中的位置
      const x = col * pieceWidth;
      const y = row * pieceHeight;
      
      // 生成带锯齿的形状（确保能完美拼合）
      const shape = generateJigsaw(row, col, pieceWidth, pieceHeight, piecesPerSide);
      
      // 创建碎片对象
      const piece = {
        id: row * piecesPerSide + col,
        shape: shape,
        correctX: x,
        correctY: y,
        width: pieceWidth,
        height: pieceHeight,
        row: row,
        col: col,
        x: randomPosition().x,
        y: randomPosition().y,
        fixed: false
      };
      
      pieces.push(piece);
    }
  }
  
  // 打乱顺序
  pieces.sort(() => Math.random() - 0.5);
  console.log("生成的碎片:", pieces.length, "个");
  
  // 初始绘制
  drawPuzzle();
}
```

这个函数完成了以下工作：
1. 根据当前难度级别确定拼图的数量和尺寸
2. 通过嵌套循环生成网格状的拼图碎片
3. 为每个碎片调用`generateJigsaw()`生成带锯齿的形状
4. 将每个碎片随机放置在操作区
5. 打乱碎片顺序，增加游戏的随机性
6. 调用`drawPuzzle()`进行初始绘制

生成的碎片初始都是未固定状态（fixed: false），并且位于操作区内的随机位置。

### 5.2 锯齿形状生成算法

接下来是最有趣的部分——生成锯齿形状的算法：

```javascript
function generateJigsaw(row, col, width, height, piecesPerSide) {
  const jigSize = Math.min(width, height) * 0.15; // 锯齿大小
  
  // 基础矩形的四个角
  const baseRect = [
    {x: 0, y: 0},             // 左上
    {x: width, y: 0},         // 右上
    {x: width, y: height},    // 右下
    {x: 0, y: height}         // 左下
  ];
  
  const result = [];
  
  // 为每条边添加锯齿
  for (let i = 0; i < 4; i++) {
    const p1 = baseRect[i];
    const p2 = baseRect[(i + 1) % 4];
    
    result.push({x: p1.x, y: p1.y});
    
    // 只在内部边缘添加锯齿（不是拼图的外边缘）
    if ((i === 0 && row > 0) ||                // 上边，且不是第一行
        (i === 1 && col < piecesPerSide - 1) || // 右边，且不是最后一列
        (i === 2 && row < piecesPerSide - 1) || // 下边，且不是最后一行
        (i === 3 && col > 0)) {                // 左边，且不是第一列
      
      // 在边的中点添加锯齿
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      // 确定锯齿方向
      let perpX = 0, perpY = 0;
      
      if (i === 0 || i === 2) { // 上边或下边
        perpY = i === 0 ? -jigSize : jigSize;  // 上边凸起，下边凹陷
        if ((row + col) % 2 === 0) perpY = -perpY; // 交替锯齿方向
      } else { // 左边或右边
        perpX = i === 3 ? -jigSize : jigSize;  // 左边凸起，右边凹陷
        if ((row + col) % 2 === 1) perpX = -perpX; // 交替锯齿方向
      }
      
      // 添加锯齿点（3点组成圆滑锯齿）
      const ctrlDist = Math.min(width, height) * 0.1;
      result.push({x: (p1.x + midX) / 2 + perpX * 0.3, y: (p1.y + midY) / 2 + perpY * 0.3});
      result.push({x: midX + perpX, y: midY + perpY});
      result.push({x: (midX + p2.x) / 2 + perpX * 0.3, y: (midY + p2.y) / 2 + perpY * 0.3});
    }
  }
  
  return result;
}
```

这个算法的巧妙之处在于：
1. 首先创建一个基础矩形，代表拼图碎片的基本形状
2. 然后在每条内部边（不是拼图外边缘）的中点添加锯齿
3. 通过设置锯齿的方向（凸起或凹陷），确保相邻碎片可以完美拼合
4. 使用行列索引的奇偶性交替锯齿方向，创造更多变化
5. 添加三个点来形成圆滑的锯齿，而不是尖锐的三角形

这种算法生成的锯齿形状既有视觉上的美感，又能确保每个碎片只能与正确的相邻碎片拼合。

### 5.3 随机位置生成

最后，我们需要一个函数来生成操作区内的随机位置：

```javascript
const randomPosition = () => {
  return {
    x: operationArea.x + Math.random() * (operationArea.width - 200),
    y: Math.random() * (operationArea.height - 200)
  };
};
```

注意，我减去了200像素的边距，以确保大部分拼图碎片能完全显示在操作区内，不会超出Canvas的边界。

这三个函数共同完成了拼图碎片的生成工作。从基本的网格划分，到精细的锯齿形状设计，再到随机的初始布局，每一步都经过精心设计，以确保游戏的可玩性和视觉效果。

## 6. 绘图系统设计

Canvas拼图游戏的核心是绘图系统。我们需要高效、准确地绘制背景、拼图碎片和各种视觉效果。

### 6.1 主绘制函数

`drawPuzzle`函数是整个绘图系统的入口，负责协调所有绘制任务：

```javascript
function drawPuzzle() {
  // 确保图片已加载
  if (!img.complete) {
    console.log("图片尚未加载完成，稍后重试");
    requestAnimationFrame(drawPuzzle);
    return;
  }

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制完整的原始图片作为背景
  ctx.drawImage(img, 0, 0, img.width, img.height, puzzleArea.x, puzzleArea.y, puzzleArea.width, puzzleArea.height);
  
  // 添加半透明遮罩，使背景图片变暗
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; // 黑色遮罩，60%不透明度
  ctx.fillRect(puzzleArea.x, puzzleArea.y, puzzleArea.width, puzzleArea.height);
  
  // 绘制拼图区轮廓
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.strokeRect(puzzleArea.x, puzzleArea.y, puzzleArea.width, puzzleArea.height);
  
  // 绘制操作区轮廓
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.strokeRect(operationArea.x, operationArea.y, operationArea.width, operationArea.height);
  
  // 添加区域标签
  ctx.fillStyle = "#666";
  ctx.font = "14px Arial";
  ctx.fillText("拼图区域", puzzleArea.x + 10, puzzleArea.y + 20);
  ctx.fillText("操作区域", operationArea.x + 10, operationArea.y + 20);
  
  // 首先绘制所有已固定的碎片（在下层）
  pieces.forEach(piece => {
    if (piece.fixed) {
      drawFixedPiece(piece);
    }
  });
  
  // 然后绘制所有未固定的碎片（在上层）
  pieces.forEach(piece => {
    if (!piece.fixed) {
      drawFloatingPiece(piece);
    }
  });
}
```

这个函数完成了以下工作：
1. 确保图片已加载完成，否则通过`requestAnimationFrame`稍后重试
2. 清空整个Canvas画布，准备重新绘制
3. 绘制原始图片作为背景，并添加半透明遮罩使其变暗
4. 绘制拼图区和操作区的边框和标签
5. 先绘制已固定的碎片（在下层），再绘制未固定的碎片（在上层）

绘制顺序非常重要，它决定了哪些元素会出现在上层。在我们的设计中，未固定的碎片应该显示在固定碎片的上方，以便玩家可以轻松拖动它们。

### 6.2 绘制浮动碎片

`drawFloatingPiece`函数负责绘制尚未固定到正确位置的拼图碎片：

```javascript
function drawFloatingPiece(piece) {
  ctx.save();
  
  // 如果正在拖动且接近正确位置，显示吸附辅助线
  if (draggingPiece === piece) {
    const distanceThreshold = 60;
    const targetX = puzzleArea.x + piece.correctX;
    const targetY = puzzleArea.y + piece.correctY;
    
    if (Math.abs(piece.x - targetX) < distanceThreshold && 
        Math.abs(piece.y - targetY) < distanceThreshold) {
      // 绘制辅助线
      ctx.save();
      ctx.strokeStyle = "rgba(46, 125, 50, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      
      // 绘制正确位置的轮廓
      ctx.beginPath();
      piece.shape.forEach((point, i) => {
        if (i === 0) ctx.moveTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y);
        else ctx.lineTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y);
      });
      ctx.closePath();
      ctx.stroke();
      
      ctx.restore();
    }
  }
  
  // 添加阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // 创建碎片形状路径用于裁剪
  ctx.beginPath();
  piece.shape.forEach((point, i) => {
    if (i === 0) ctx.moveTo(piece.x + point.x, piece.y + point.y);
    else ctx.lineTo(piece.x + point.x, piece.y + point.y);
  });
  ctx.closePath();
  
  // 创建裁剪路径
  ctx.save();
  ctx.clip();
  
  // 缩放因子
  const scaleX = img.width / puzzleArea.width;
  const scaleY = img.height / puzzleArea.height;
  
  // 计算矩形边界，确保覆盖整个形状
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  piece.shape.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  
  // 添加一些边距确保完全覆盖
  const margin = 2;
  minX -= margin;
  minY -= margin;
  maxX += margin;
  maxY += margin;
  
  // 计算要绘制的矩形尺寸
  const rectWidth = maxX - minX;
  const rectHeight = maxY - minY;
  
  // 计算图像源区域，包含可能超出基本格子的部分
  const correctXWithOffset = piece.correctX + minX;
  const correctYWithOffset = piece.correctY + minY;
  
  const sourceX = correctXWithOffset * scaleX;
  const sourceY = correctYWithOffset * scaleY;
  const sourceWidth = rectWidth * scaleX;
  const sourceHeight = rectHeight * scaleY;
  
  // 绘制相应区域的图像到碎片位置
  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    piece.x + minX, piece.y + minY, rectWidth, rectHeight
  );
  
  ctx.restore();
  
  // 绘制边框
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // 绘制提示高亮
  if (hintPiece === piece) {
    // 高亮当前碎片
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 显示目标位置
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "lime";
    
    // 在正确位置绘制形状提示
    ctx.beginPath();
    piece.shape.forEach((point, i) => {
      if (i === 0) ctx.moveTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y);
      else ctx.lineTo(puzzleArea.x + piece.correctX + point.x, puzzleArea.y + piece.correctY + point.y);
    });
    ctx.closePath();
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
  }
  
  ctx.restore();
}
```

这个函数实现了以下功能：

1. **吸附辅助线**：当拖动的碎片接近正确位置时，显示虚线轮廓指示目标位置
2. **阴影效果**：为碎片添加阴影，增强立体感
3. **图像裁剪**：使用碎片的形状作为裁剪路径，只显示对应区域的图像
4. **边界计算**：计算碎片形状的边界框，确保锯齿部分也能正确显示
5. **提示高亮**：当碎片被选为提示时，用黄色边框高亮显示，并在正确位置显示半透明的绿色轮廓

其中最关键的部分是图像裁剪和源区域计算。不同于普通的拼图，我们的锯齿形状可能超出基本的网格单元，所以需要特别计算图像的源区域和目标区域，确保锯齿部分显示正确的图像内容。

### 6.3 绘制已固定碎片

`drawFixedPiece`函数负责绘制已固定到正确位置的拼图碎片：

```javascript
function drawFixedPiece(piece) {
  ctx.save();
  
  // 定位到拼图区中的正确位置
  const pieceX = puzzleArea.x + piece.correctX;
  const pieceY = puzzleArea.y + piece.correctY;
  
  // 创建碎片路径用于裁剪
  ctx.beginPath();
  piece.shape.forEach((point, i) => {
    if (i === 0) ctx.moveTo(pieceX + point.x, pieceY + point.y);
    else ctx.lineTo(pieceX + point.x, pieceY + point.y);
  });
  ctx.closePath();
  
  // 创建裁剪路径
  ctx.clip();
  
  // 缩放因子
  const scaleX = img.width / puzzleArea.width;
  const scaleY = img.height / puzzleArea.height;
  
  // 计算矩形边界，确保覆盖整个形状
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  piece.shape.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  
  // 添加一些边距确保完全覆盖
  const margin = 2;
  minX -= margin;
  minY -= margin;
  maxX += margin;
  maxY += margin;
  
  // 计算要绘制的矩形尺寸
  const rectWidth = maxX - minX;
  const rectHeight = maxY - minY;
  
  // 计算图像源区域，考虑锯齿形状可能超出基本格子的部分
  const sourceX = (piece.correctX + minX) * scaleX;
  const sourceY = (piece.correctY + minY) * scaleY;
  const sourceWidth = rectWidth * scaleX;
  const sourceHeight = rectHeight * scaleY;
  
  // 绘制相应区域的图像到碎片位置
  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    pieceX + minX, pieceY + minY, rectWidth, rectHeight
  );
  
  // 绘制边框
  ctx.strokeStyle = "#388E3C";  // 绿色边框
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
}
```

这个函数与绘制浮动碎片的函数类似，但有几个重要区别：

1. 碎片位置固定在拼图区的正确位置（使用`correctX`和`correctY`）
2. 没有阴影效果，使固定碎片看起来更"平"
3. 使用绿色边框而不是灰色，表示碎片已正确放置
4. 不需要处理拖动和提示相关的逻辑

通过这种方式，玩家可以直观地区分已固定和未固定的碎片，并得到视觉上的满足感当他们成功放置一个碎片时。

### 6.4 图像裁剪的技术挑战

在实现这些绘制函数时，我遇到了几个技术挑战：

1. **锯齿形状的完整裁剪**：由于锯齿可能超出基本矩形边界，我们需要计算完整的边界框并调整源图像区域
2. **坐标系转换**：需要在拼图碎片的局部坐标和Canvas的全局坐标之间进行转换
3. **透明度处理**：使用`globalAlpha`属性时需要注意恢复默认值，以免影响后续绘制

其中最复杂的是计算正确的源图像区域。考虑一个有锯齿的拼图碎片，其锯齿部分可能伸出基本网格单元。为了显示完整的碎片，我们需要：

1. 计算形状的边界框（最小/最大x和y坐标）
2. 根据边界框调整源图像区域和目标绘制区域
3. 使用裁剪路径确保只显示我们想要的形状部分

这种方法确保了锯齿部分显示的是正确的图像内容，而不是相邻碎片的内容，从而保证拼图能够视觉上完美拼合。

## 7. 交互系统实现

一个好的拼图游戏需要流畅、直观的交互体验。让我们看看如何实现拖放、吸附和其他交互功能。

### 7.1 鼠标拖放

```javascript
// 鼠标按下 - 选择碎片
canvas.addEventListener("mousedown", (e) => {
  if (!gameStarted) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // 从上往下检查（这样可以选择最上面的碎片）
  for (let i = pieces.length - 1; i >= 0; i--) {
    const piece = pieces[i];
    
    if (!piece.fixed && isPointInPiece(mouseX, mouseY, piece)) {
      draggingPiece = piece;
      
      // 将当前碎片移到数组末尾（绘制时会显示在最上层）
      pieces.splice(i, 1);
      pieces.push(piece);
      
      // 记录偏移量
      offsetX = mouseX - piece.x;
      offsetY = mouseY - piece.y;
      
      break;
    }
  }
});

// 鼠标移动 - 拖动碎片
canvas.addEventListener("mousemove", (e) => {
  if (!draggingPiece) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // 设置碎片位置
  draggingPiece.x = mouseX - offsetX;
  draggingPiece.y = mouseY - offsetY;
  
  // 磁性吸附效果
  const closeThreshold = 30;
  const targetX = puzzleArea.x + draggingPiece.correctX;
  const targetY = puzzleArea.y + draggingPiece.correctY;
  
  if (Math.abs(draggingPiece.x - targetX) < closeThreshold && 
      Math.abs(draggingPiece.y - targetY) < closeThreshold) {
    const xDistance = targetX - draggingPiece.x;
    const yDistance = targetY - draggingPiece.y;
    const ratio = 0.2; // 吸引力强度系数
    
    draggingPiece.x += xDistance * ratio;
    draggingPiece.y += yDistance * ratio;
  }
  
  drawPuzzle();
});

// 鼠标释放 - 放置碎片
canvas.addEventListener("mouseup", (e) => {
  if (!draggingPiece) return;
  
  // 检查是否放在拼图区域中
  const inPuzzleArea = (
    draggingPiece.x >= puzzleArea.x - 50 && 
    draggingPiece.y >= puzzleArea.y - 50 &&
    draggingPiece.x < puzzleArea.x + puzzleArea.width - 50 &&
    draggingPiece.y < puzzleArea.y + puzzleArea.height - 50
  );
  
  if (inPuzzleArea) {
    // 检查是否接近正确位置
    if (isPieceNearCorrectPosition(draggingPiece)) {
      // 吸附到正确位置
      draggingPiece.x = puzzleArea.x + draggingPiece.correctX;
      draggingPiece.y = puzzleArea.y + draggingPiece.correctY;
      draggingPiece.fixed = true;
    } else {
      // 放回操作区
      Object.assign(draggingPiece, randomPosition());
    }
  } else {
    // 放回操作区
    Object.assign(draggingPiece, randomPosition());
  }
  
  drawPuzzle();
  draggingPiece = null;
  
  // 检测是否完成拼图
  if (pieces.every(p => p.fixed)) {
    setTimeout(() => {
      alert(`恭喜你完成了${currentLevel === 'easy' ? '初级' : currentLevel === 'medium' ? '中级' : currentLevel === 'hard' ? '高级' : '不规则形状'}难度的拼图！🎉`);
    }, 300);
  }
});
```

### 7.2 触摸屏支持

```javascript
// 触摸开始
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
});

// 触摸移动
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!draggingPiece) return;
  
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
});

// 触摸结束
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  const mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
});
```

### 7.3 提示功能

```javascript
function showHint() {
  if (!gameStarted) return;
  
  // 找出未固定的碎片
  const unfixedPieces = pieces.filter(p => !p.fixed);
  
  if (unfixedPieces.length === 0) {
    alert("所有碎片已经完成！");
    return;
  }
  
  // 随机选择一个未固定的碎片作为提示
  hintPiece = unfixedPieces[Math.floor(Math.random() * unfixedPieces.length)];
  
  // 更新画面
  drawPuzzle();
  
  // 5秒后取消提示
  setTimeout(() => {
    hintPiece = null;
    drawPuzzle();
  }, 5000);
}
```

### 7.4 切换难度

```javascript
function changeDifficulty(level) {
  currentLevel = level;
  
  // 更新按钮样式
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    if (btn.dataset.level === level) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // 重新生成拼图
  generatePieces();
}
```

## 8. 辅助函数

### 8.1 点是否在多边形内

```javascript
function isPointInPolygon(x, y, polygon, offsetX, offsetY) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x + offsetX, yi = polygon[i].y + offsetY;
    let xj = polygon[j].x + offsetX, yj = polygon[j].y + offsetY;
    
    let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
```

### 8.2 判断碎片是否在正确位置附近

```javascript
function isPieceNearCorrectPosition(piece) {
  const distanceThreshold = 60; // 吸附距离阈值
  
  const targetX = puzzleArea.x + piece.correctX;
  const targetY = puzzleArea.y + piece.correctY;
  
  return (
    Math.abs(piece.x - targetX) < distanceThreshold && 
    Math.abs(piece.y - targetY) < distanceThreshold
  );
}
```

### 8.3 生成随机位置

```javascript
const randomPosition = () => {
  return {
    x: operationArea.x + Math.random() * (operationArea.width - 200),
    y: Math.random() * (operationArea.height - 200)
  };
};
```

## 9. 优化和改进

1. **碎片边缘处理**：通过计算边界框并添加适当的边距，确保锯齿部分的图像正确渲染。

2. **背景遮罩**：使用半透明遮罩使背景变暗，让拼图碎片更加突出。

3. **磁性吸附**：当碎片接近正确位置时，会有轻微的吸引力引导用户。

4. **视觉反馈**：提供碎片放置正确时的边框颜色变化，以及接近正确位置时的辅助线。

5. **图像裁剪精度**：通过计算精确的图像源区域，确保每个碎片显示正确的图像部分。

## 10. 总结

这个拼图游戏通过HTML5 Canvas实现了一个具有现代交互体验的拼图游戏。核心技术包括：

1. Canvas绘图API用于渲染游戏界面
2. 复杂的多边形生成算法创建锯齿形状
3. 图像裁剪和绘制确保碎片显示正确图像
4. 鼠标/触摸事件处理实现拖放功能
5. 算法判断点是否在多边形内以处理交互

游戏还具有响应式设计，支持多种难度级别，以及辅助功能如提示和磁性吸附，提供了良好的用户体验。 