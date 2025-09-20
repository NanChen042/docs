/* type CursorType = 'auto' | 'pointer' | 'text' | 'wait' | 'move' | 'not-allowed' | 'grab' | 'grabbing' | 'zoom-in' | 'vertical-text' | 'cell' | 'copy' | 'progress';

interface CursorMapping {
  [key: string]: string;
}

type CleanupFunction = () => void;

// 光标映射配置 - 修复构建时路径解析问题
const cursorMap: CursorMapping = {
  'auto': '/docs/SimplifyCoffee/cursor.cur',
  'pointer': '/docs/SimplifyCoffee/cursor2.cur',
  'text': '/docs/SimplifyCoffee/cursor3.cur',
  'progress': '/docs/SimplifyCoffee/03_working_in_background.ani',
  'not-allowed': '/docs/SimplifyCoffee/08_unavailable.cur',
  'move': '/docs/SimplifyCoffee/13_move.cur',
  'wait': '/docs/SimplifyCoffee/03_working_in_background.ani',
  'zoom-in': '/docs/SimplifyCoffee/cursor.cur',
  'grab': '/docs/SimplifyCoffee/cursor2.cur',
  'grabbing': '/docs/SimplifyCoffee/cursor3.cur',
  'vertical-text': '/docs/SimplifyCoffee/09_vertical_resize.cur',
  'cell': '/docs/SimplifyCoffee/cursor.cur',
  'copy': '/docs/SimplifyCoffee/cursor2.cur'
};

// 获取计算样式中的cursor属性
const getComputedCursor = (element: HTMLElement): CursorType => {
  return window.getComputedStyle(element).cursor as CursorType;
};

// 防抖函数
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 处理鼠标移动事件
const handleMouseMove = debounce((e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target) return;

  const computedCursor = getComputedCursor(target);

  // 只处理特殊光标类型
  if (
    computedCursor === 'progress' ||
    computedCursor === 'not-allowed' ||
    computedCursor === 'move' ||
    computedCursor === 'wait' ||
    computedCursor === 'zoom-in' ||
    computedCursor === 'grab' ||
    computedCursor === 'grabbing' ||
    computedCursor === 'vertical-text' ||
    computedCursor === 'cell' ||
    computedCursor === 'copy'
  ) {
    const cursorPath = cursorMap[computedCursor];
    if (cursorPath && target.style.cursor !== `url('${cursorPath}'), ${computedCursor}`) {
      target.style.cursor = `url('${cursorPath}'), ${computedCursor}`;
    }
  }
}, 16);

// 初始化函数
export const initCustomCursor = (): CleanupFunction | void => {
  if (typeof window === 'undefined') return;

  // 移除可能存在的旧事件监听器
  document.removeEventListener('mousemove', handleMouseMove as any);

  // 设置默认光标
  document.body.style.cursor = `url('${cursorMap['auto']}'), auto`;

  // 添加新的事件监听器
  document.addEventListener('mousemove', handleMouseMove as any);

  // 清理函数
  return () => {
    document.removeEventListener('mousemove', handleMouseMove as any);
  };
};
 */