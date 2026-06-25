<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import html2canvas from "html2canvas";
import { ElMessage } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";

const acknowledged = ref(false);
const confirmed = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const formRef = ref<HTMLDivElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let drawing = false;
let devicePixelRatioCached = 1;
let lastX = 0;
let lastY = 0;

const signatureData = ref<string>("");
const isLocked = ref(false); // 已签名则锁定画布，需清空后才能重签
const hasInk = ref(false); // 画布是否有笔迹（未保存前）
const signedAt = ref<string>(""); // 确认签署时间（年-月-日 时）
const forceFullscreen = ref(false); // 首次未签名时，强制全屏签署
const previewImage = ref<string>("");
const showPreview = ref(false);

const setupHiDPICanvas = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Get target render size in CSS pixels (from current layout)
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    devicePixelRatioCached = dpr;

    // Only resize when necessary to avoid clearing unnecessarily
    const targetWidth = Math.max(1, Math.floor(rect.width * dpr));
    const targetHeight = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        // Preserve existing drawing by copying to an offscreen canvas before resize
        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const offCtx = offscreen.getContext('2d');
        if (offCtx) {
            offCtx.drawImage(canvas, 0, 0);
        }

        // Set the internal bitmap size for HiDPI
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Ensure CSS size matches layout rect (so visual size stays the same)
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        // Reset transform for restoration in device pixels
        context.setTransform(1, 0, 0, 1, 0, 0);
        // Restore the previous content, scaled to new size (device pixels)
        if (offCtx) {
            context.drawImage(offscreen, 0, 0, offscreen.width, offscreen.height, 0, 0, targetWidth, targetHeight);
        }
    } else {
        // When size unchanged, ensure transform is correct
        // no-op here, transform will be applied below
        // Ensure CSS size still matches current layout box
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }

    // Use CSS pixel coordinate space by scaling the context once
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Set drawing styles (measured in CSS pixels)
    context.lineWidth = 2.5; // CSS px; transform scales it for HiDPI
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#000";

    ctx = context;
};

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    setupHiDPICanvas();

    // 微信浏览器兼容性处理
    try {
        const saved = localStorage.getItem("ackData");
        console.log('微信浏览器调试 - 读取存储数据:', saved ? '有数据' : '无数据');
        
        if (saved) {
            const parsedData = JSON.parse(saved);
            console.log('微信浏览器调试 - 解析数据:', parsedData);
            
            const { acknowledged: ack, signature } = parsedData;
            acknowledged.value = ack;
            
            if (signature) {
                signatureData.value = signature;
                confirmed.value = true;
                isLocked.value = true;
                try {
                    const { date } = parsedData;
                    if (date) signedAt.value = String(date);
                } catch {}
                
                const img = new Image();
                img.onload = () => {
                    // Draw saved image to fit current canvas size (in CSS pixels)
                    const rect = canvas.getBoundingClientRect();
                    ctx?.drawImage(img, 0, 0, rect.width, rect.height);
                    console.log('微信浏览器调试 - 签名图片加载完成');
                };
                img.onerror = () => {
                    console.error('微信浏览器调试 - 签名图片加载失败');
                };
                img.src = signature;
                forceFullscreen.value = false;
            } else {
                // 首次无签名，进入全屏签署模式
                forceFullscreen.value = true;
            }
        } else {
            forceFullscreen.value = true;
        }
    } catch (error) {
        console.error('微信浏览器调试 - 存储读取错误:', error);
        // 出错时重置状态
        acknowledged.value = false;
        confirmed.value = false;
        signatureData.value = "";
        isLocked.value = false;
        forceFullscreen.value = true;
    }

    // Reconfigure on window resize/orientation to keep crisp lines
    window.addEventListener('resize', setupHiDPICanvas);
    window.addEventListener('orientationchange', setupHiDPICanvas);
    
    // 微信浏览器特殊处理：延迟检查状态
    setTimeout(() => {
        console.log('微信浏览器调试 - 延迟检查状态:', {
            acknowledged: acknowledged.value,
            confirmed: confirmed.value,
            hasSignature: !!signatureData.value,
            isLocked: isLocked.value,
            forceFullscreen: forceFullscreen.value
        });
    }, 1000);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', setupHiDPICanvas);
    window.removeEventListener('orientationchange', setupHiDPICanvas);
});

// 监听全屏签署模式切换（通常会触发布局/定位变化），在下一帧重新配置画布
watch(forceFullscreen, async () => {
    await nextTick();
    setupHiDPICanvas();
});

const getXY = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.value!;
    const rect = canvas.getBoundingClientRect();
    // 计算指针相对画布 CSS 坐标
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;
    // 直接返回 CSS 像素坐标；绘制由上下文缩放处理
    return { x: cssX, y: cssY };
};

const startDrawing = (e: MouseEvent | TouchEvent) => {
    if (isLocked.value) return; // 已签名锁定
    // 开始绘制前进行一次尺寸/变换校准，避免因布局/定位变化产生偏移
    setupHiDPICanvas();
    drawing = true;
    ctx?.beginPath();
    const { x, y } = getXY(e);
    ctx?.moveTo(x, y);
    lastX = x;
    lastY = y;
    hasInk.value = true;
};

const draw = (e: MouseEvent | TouchEvent) => {
    if (isLocked.value) return; // 已签名锁定
    if (!drawing || !ctx) return;
    const { x, y } = getXY(e);
    const midX = (lastX + x) / 2;
    const midY = (lastY + y) / 2;
    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.stroke();
    lastX = x;
    lastY = y;
};

const stopDrawing = () => {
    drawing = false;
};

const clearCanvas = () => {
    const canvas = canvasRef.value;
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    signatureData.value = "";
    confirmed.value = false;
    isLocked.value = false;
    hasInk.value = false;
    signedAt.value = "";
    acknowledged.value = false;
    forceFullscreen.value = true; // 清空后回到全屏签署
    // 清除本地存储信息（签名与状态）
    localStorage.removeItem("ackData");
};

// Popconfirm 确认清空回调
const onConfirmClear = () => {
    clearCanvas();
    ElMessage.success("需重新阅读本协议并签字");
};

const handleSubmit = () => {
    if (!acknowledged.value) {
        ElMessage.warning("请勾选已知晓！");
        return;
    }
    const canvas = canvasRef.value;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    signatureData.value = dataUrl;

    // 生成当前签署时间（到小时）
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const human = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}`;
    signedAt.value = human;

    const data = {
        acknowledged: acknowledged.value,
        signature: dataUrl,
        date: human,
    };
    localStorage.setItem("ackData", JSON.stringify(data));
    confirmed.value = true;
    isLocked.value = true;
    // 保持当前会话继续全屏，等下次进入由已保存签名自动退出全屏
    ElMessage.success("确认信息已保存 ✅");
};

// 是否允许“确认签署”
const canConfirm = computed(() => hasInk.value && !isLocked.value && acknowledged.value);

const hideExportElements = () => {
    const noExportElements = document.querySelectorAll('.no-export');
    noExportElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });
};

const showExportElements = () => {
    const noExportElements = document.querySelectorAll('.no-export');
    noExportElements.forEach(el => {
        (el as HTMLElement).style.display = '';
    });
};

const previewForm = async () => {
    if (!formRef.value) return;

    // 临时隐藏不需要导出的元素
    hideExportElements();

    try {
        const canvas = await html2canvas(formRef.value, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            foreignObjectRendering: false,
        });
        previewImage.value = canvas.toDataURL("image/png");
        showPreview.value = true;
        ElMessage.success("预览已生成 👀");
    } finally {
        // 恢复显示元素
        showExportElements();
    }
};

const exportForm = async () => {
    if (!formRef.value) return;

    // 临时隐藏不需要导出的元素
    hideExportElements();

    try {
        const canvas = await html2canvas(formRef.value, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            foreignObjectRendering: false,
        });
        const dataUrl = canvas.toDataURL("image/png");
        const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
        if (isWeChat) {
            // WeChat often blocks programmatic downloads; show preview to long-press save
            previewImage.value = dataUrl;
            showPreview.value = true;
            ElMessage.success("已生成图片，长按即可保存 📷");
        } else {
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `确认表单_${new Date().toLocaleDateString()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            ElMessage.success("已导出为图片 🎉");
        }
    } finally {
        // 恢复显示元素
        showExportElements();
    }
};
</script>

<template>
    <div ref="formRef" class="ack-form contract-paper max-w-md mx-auto p-6 space-y-6 text-black" :class="{ 'fullscreen-modal': forceFullscreen }">
        <!-- 活动说明 -->
        <div class="markdown">
            <div class="contract-header">
                <h1>活动参与确认书</h1>
                <p class="contract-sub">Participation Acknowledgement</p>
            </div>
            <h2>🎉 关于国庆抽奖活动说明</h2>
            <p><strong>活动时间</strong><br />国庆期间（具体日期以现场为准）</p>
            <p>
                <strong>参与方式</strong><br />现场抽奖，每张仅需
                <strong>0.5 元</strong>，刮刮卡每张仅需
                <strong>1 元</strong>，想抽完就看你钱包鼓不鼓~（数量 30+）
            </p>
            <p><strong>中奖规则</strong><br />100% 必中，不存在 “谢谢参与” 这种扫兴的卡片 🎁</p>
            <p><strong>奖品设置</strong></p>
            <ul>
                <li><strong>实物类</strong>：光遇小镜子、盲盒等精心准备的小礼物</li>
                <li><strong>趣味类</strong>：比如 “无论如何不生气券” ❤️</li>
                <li><strong>消费券类</strong>：电影券、奶茶券等（⚠️ 兑换需视小贾钱包余额情况而定）</li>
            </ul>
            <p><strong>其他说明</strong><br />所有奖品的种类、数量及最终解释权归小贾所有</p>

            <!-- 确认声明 -->
            <p class="mt-4 font-semibold">
                我已阅读并充分理解上述活动说明，愿意自愿参与该抽奖活动，
                并接受活动发起方 <strong>小贾</strong> 的相关规则及最终解释。
            </p>

            <!-- 确认复选框 -->
            <label class="flex items-center gap-2 no-export mt-3">
                <el-checkbox v-model="acknowledged" label="确认同意" size="large" border :disabled="!hasInk || isLocked" />
            </label>
        </div>


        <!-- 确认表单 -->
        <div>


            <p class="mt-4 mb-2 contract-section-title">签名 Signature</p>
            <div class="canvas-wrapper">
                <canvas ref="canvasRef" width="360" height="200" class="responsive-canvas" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing" @touchstart.prevent="startDrawing" @touchmove.prevent="draw" @touchend="stopDrawing"></canvas>
            </div>
            <div class="meta-lines">
                <div class="meta-item">
                    <span>签署人 Printed Name：陈佳欣</span>
                </div>
                <div class="meta-item" style="display: flex; flex-direction: column;">
                    <span v-if="signedAt">日期 Date：{{ signedAt+'时' || '—' }}</span>
                    <!-- <span class="filled"></span> -->
                </div>
            </div>

        </div>

        <div class="flex gap-3 no-export">
            <div class="flex gap-3">
                <el-button type="warning" @click="handleSubmit" :disabled="!canConfirm">
                    确认签署
                </el-button>
             <!--    <el-button type="info" @click="previewForm">
                    预览图片
                </el-button> -->
                <el-button @click="exportForm" :disabled="!confirmed && !signatureData">
                    导出为图片
                </el-button>
                <el-popconfirm
                    width="280"
                    :icon="InfoFilled"
                    icon-color="#F56C6C
"
                    title="确认清空画布并重新进行签字？"
                    confirm-button-text="确认清空"
                    cancel-button-text="取消"
                    confirm-button-type="danger"
                    @confirm="onConfirmClear"
                >
                    <template #reference>
                        <el-button type="danger" plain>清空画布</el-button>
                    </template>
                </el-popconfirm>
            </div>
        </div>

        <!-- 预览弹窗 -->
        <el-dialog v-model="showPreview" title="导出预览" width="80%" center>
            <div class="preview-container">
                <img v-if="previewImage" :src="previewImage" alt="预览图片" class="preview-image" />
            </div>
            <template #footer>
                <el-button @click="showPreview = false">关闭</el-button>
                <el-button type="primary" @click="exportForm">确认导出</el-button>
            </template>
        </el-dialog>


    </div>
</template>

<style scoped>
.contract-paper {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,.06);
    position: relative;
    padding: 1rem;
}

.contract-paper::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      180deg,
      rgba(0,0,0,0.03) 0px,
      rgba(0,0,0,0.03) 1px,
      transparent 1px,
      transparent 28px
    );
    border-radius: 12px;
    pointer-events: none;
}

/* 全屏签署模式 */
.fullscreen-modal {
    position: fixed;
    inset: 0;
    max-width: none !important;
    margin: 0 !important;
    border-radius: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: auto; /* 内容可滚动 */
    -webkit-overflow-scrolling: touch; /* 移动端顺滑滚动 */
    padding-bottom: 72px; /* 预留底部操作区高度，避免被遮挡 */
}

.fullscreen-modal .canvas-wrapper { max-width: 720px; margin: 0 auto; }
.fullscreen-modal .no-export {  background: rgba(255,255,255,.9); backdrop-filter: blur(4px); padding: 8px 0; }

.contract-header {
    text-align: center;
    margin-bottom: 10px;
}

.contract-header h1 {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin: 0;
}

.contract-sub {
    font-size: 0.75rem;
    color: #6b7280;
   
}

.contract-section-title {
    font-weight: 600;
}

.meta-lines {
    display: flex;flex-direction: column;
    
    align-items: flex-end;
    gap: 8px 16px;
    margin-top: 8px;
}

.meta-item { display: flex; align-items: center; gap: 8px; color: #374151; font-size: 0.875rem; }
.meta-item .line { flex: 1; height: 1px; background: #d1d5db; }
.meta-item .filled { font-weight: 600; color: #111827; }

.gap-3{
    display: flex;
    margin-top: 1rem;
    justify-content: center;
    gap: 0.5rem !important;
}
.ack-form canvas {
    touch-action: none;
}

.canvas-wrapper {
    width: 100%;
    /* 固定画布显示高度，避免行高/外边距造成的视觉偏移 */
    height: 200px;
    position: relative;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
}

.responsive-canvas {
    width: 100% !important; /* CSS size defines visual size */
    height: 100% !important;
    display: block;
    background: transparent;
}

.markdown p,
.markdown ul {
    margin: 6px 0;
    line-height: 1.6;
}

.markdown ul {
    padding-left: 20px;
    list-style: disc;
}

:deep(.el-button) {
    margin: 0 !important;
    /* 去掉 element-plus 自带外边距 */
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    vertical-align: baseline !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    box-sizing: border-box !important;
}

:deep(.el-button span) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    transform: translateY(0) !important;
}

.preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 70vh;
    overflow: auto;
}

.preview-image {
    max-width: 100%;
    max-height: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 导出时隐藏的元素样式 - 通过JS动态控制显示/隐藏 */
.vp-doc h2 {
    margin: 0
}

/* 移动端优化 */
@media (max-width: 768px) {
    .contract-paper {
        padding: 0.75rem;
        font-size: 14px;
    }
    
    .contract-header h1 {
        font-size: 1.125rem;
    }
    
    .contract-sub {
        font-size: 0.7rem;
    }
    
    .markdown p,
    .markdown ul {
        font-size: 14px;
        line-height: 1.5;
        margin: 8px 0;
    }
    
    .markdown h2 {
        font-size: 1rem;
        margin: 12px 0 8px 0;
    }
    
    .markdown strong {
        font-weight: 600;
    }
    
    .meta-lines {
        grid-template-columns: 1fr;
        gap: 8px;
    }
    
    .meta-item {
        font-size: 0.8rem;
    }
    
    .fullscreen-modal {
        padding: 0.75rem;
        padding-bottom: 80px;
    }
    
    .fullscreen-modal .markdown {
        color: #000 !important;
        opacity: 1 !important;
        visibility: visible !important;
    }
    
    /* 微信浏览器特殊处理 - 强制显示文字 */
    .markdown * {
        color: inherit !important;
        opacity: 1 !important;
        visibility: visible !important;
    }
    
    .markdown p,
    .markdown h1,
    .markdown h2,
    .markdown ul,
    .markdown li {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        color: #000 !important;
    }
}
</style>
