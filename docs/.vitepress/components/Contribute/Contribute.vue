<template>
  <div class="contribute-wrapper">
    <div v-if="loading" class="loading-text">正在同步 GitHub 真实数据...</div>

    <div v-else-if="error" class="fallback-img">
      <img src="https://ghchart.rshah.org/8b5cf6/NanChen042" alt="GitHub Contributions" />
    </div>

    <div v-else class="layout-container">
      <!-- Calendar Card -->
      <div class="calendar-card">
        <div class="calendar-header">
          <span class="year-total">{{ activeYearTotal }} contributions in {{ selectedYear }}</span>
          <span class="status"><span class="dot"></span>Live Sync</span>
        </div>

        <div class="graph-section">
          <!-- Month labels -->
          <div class="month-labels" :style="{ marginLeft: labelWidth + 'px' }">
            <span v-for="m in monthLabels" :key="m.key"
                  class="month-label" :style="{ left: m.left + 'px' }">
              {{ m.name }}
            </span>
          </div>

          <!-- Grid row: weekday labels + cells -->
          <div class="grid-row">
            <div class="weekday-labels" :style="{ width: labelWidth + 'px' }">
              <span></span><span>Mon</span><span></span>
              <span>Wed</span><span></span><span>Fri</span><span></span>
            </div>
            
            <div class="contribution-grid">
              <template v-for="(day, i) in gridDays" :key="i">
                <div v-if="day"
                     class="cell"
                     :class="['level-' + day.intensity]"
                     :data-tooltip="getTooltipText(day)">
                </div>
                <div v-else class="cell cell-empty"></div>
              </template>
            </div>
          </div>

          <!-- Legend -->
          <div class="legend">
            <span class="legend-text">Less</span>
            <div class="legend-cell level-0"></div>
            <div class="legend-cell level-1"></div>
            <div class="legend-cell level-2"></div>
            <div class="legend-cell level-3"></div>
            <div class="legend-cell level-4"></div>
            <span class="legend-text">More</span>
          </div>
        </div>
      </div>

      <!-- Right: Year Selector -->
      <div class="year-list">
        <button v-for="y in years" :key="y.year"
                class="year-button"
                :class="{ active: selectedYear === y.year }"
                @click="selectedYear = y.year">
          {{ y.year }}
        </button>
      </div>
    </div>

    <div class="flex">
      <h1>访问量:</h1>
      <img src="https://hitwebcounter.com/counter/counter.php?page=19094990&style=0024&nbdigits=5&type=page&initCount=0" title="Counter Widget" Alt="Visit counter For Websites" border="0" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{ username?: string }>(), {
  username: 'NanChen042'
})

interface YearItem {
  year: string
  total: number
}

interface ContributionDay {
  date: string
  count: number
  color: string
  intensity: string
}

const allContributions = ref<ContributionDay[]>([])
const years = ref<YearItem[]>([])
const selectedYear = ref<string>('')

const loading = ref(true)
const error = ref(false)

const cellSize = 11
const cellGap = 3
const labelWidth = 32

// GitHub changed their SVG format, so the Vercel API can no longer reliably parse the exact 'count'.
// It returns count: 0 for almost everything. We use 'intensity' to approximate the tooltip.
const getTooltipText = (day: ContributionDay) => {
  if (day.intensity === '0') return `No contributions on ${day.date}`
  if (day.intensity === '1') return `1-3 contributions on ${day.date}`
  if (day.intensity === '2') return `4-6 contributions on ${day.date}`
  if (day.intensity === '3') return `7-9 contributions on ${day.date}`
  if (day.intensity === '4') return `10+ contributions on ${day.date}`
  return `Contributions on ${day.date}`
}

/** Switch between years */
const activeYearTotal = computed(() => {
  const y = years.value.find(item => item.year === selectedYear.value)
  return y ? y.total : 0
})

/** Filter, reverse (API sends newest first), and pad the start of the year */
const gridDays = computed(() => {
  if (!selectedYear.value || allContributions.value.length === 0) return []

  let daysInYear = []
  
  // If selected year is the most recent year (e.g., current year), show rolling 365 days like GitHub
  if (years.value.length > 0 && selectedYear.value === years.value[0].year) {
    // Find the first date that is not in the future
    const todayStr = new Date().toISOString().split('T')[0]
    const todayIndex = allContributions.value.findIndex(d => d.date <= todayStr)
    const startIndex = todayIndex >= 0 ? todayIndex : 0
    daysInYear = allContributions.value.slice(startIndex, startIndex + 365).reverse()
  } else {
    // For historical years, show full calendar year (Jan 1 - Dec 31)
    daysInYear = allContributions.value
      .filter(d => d.date.startsWith(selectedYear.value))
      .reverse()
  }

  if (daysInYear.length === 0) return []

  // Calculate padding based on the first day's weekday (Sunday = 0)
  // We use UTC parsing to avoid local timezone shifts changing the day
  const firstDate = new Date(daysInYear[0].date + 'T12:00:00Z')
  const padCount = firstDate.getUTCDay()
  
  const padding = Array(padCount).fill(null)
  return [...padding, ...daysInYear]
})

/** Compute month labels based on the first appearance of each month */
const monthLabels = computed(() => {
  const step = cellSize + cellGap
  const labels: { name: string; left: number; key: string }[] = []
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  let lastMonth = -1

  gridDays.value.forEach((day, i) => {
    if (day) {
      const month = new Date(day.date + 'T12:00:00Z').getUTCMonth()
      if (month !== lastMonth) {
        const colIndex = Math.floor(i / 7)
        labels.push({ name: names[month], left: colIndex * step, key: `${month}-${colIndex}` })
        lastMonth = month
      }
    }
  })

  return labels
})

onMounted(async () => {
  try {
    // 开发环境走 Vite 代理以绕过 CORS，生产环境直连 API
    const hostname = window.location.hostname
    const isDev = hostname === 'localhost' || hostname.startsWith('192.168') || hostname.startsWith('127.')
    const apiUrl = isDev
      ? `/api/github-contributions/${props.username}`
      : `https://github-contributions.vercel.app/api/v1/${props.username}`
    const res = await fetch(apiUrl)
    
    if (!res.ok) throw new Error('API Error')
    const data = await res.json()
    
    allContributions.value = data.contributions
    years.value = data.years
    
    if (years.value.length > 0) {
      selectedYear.value = years.value[0].year
    }
  } catch (e) {
    console.error('Failed to fetch GitHub contributions:', e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
/* ============================================
   Variables
   ============================================ */
$cell-size: 11px;
$cell-gap: 3px;

/* Purple theme colors */
$level-1: #d8b4fe;
$level-2: #a855f7;
$level-3: #7c3aed;
$level-4: #5b21b6;

/* ============================================
   Layout
   ============================================ */
.contribute-wrapper {
  max-width: 1152px;
  margin: 0 auto;
  padding: 40px 24px 0;
  box-sizing: border-box;
}

.layout-container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
}

.calendar-card {
  width: max-content;
  max-width: 100%;
  background: transparent;
  border: none;
  padding: 0;
}

.year-list {
  width: 70px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.year-button {
  width: 100%;
  padding: 4px 0;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-1);
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--vp-c-bg-mute);
  }
  
  &.active {
    background: #7c3aed; /* Theme purple */
    color: white;
    font-weight: 500;
  }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .year-list {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .year-button {
    width: auto;
    padding: 6px 16px;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .calendar-header .status {
    align-self: flex-end;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  .year-total {
    font-size: 15px;
    font-weight: 500;
    color: var(--vp-c-text-1);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--vp-c-text-2);

    .dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

.loading-text {
  text-align: center;
  color: var(--vp-c-text-2);
  padding: 60px 0;
  font-size: 14px;
}

.fallback-img {
  text-align: center;
  img {
    width: 100%;
    max-width: 720px;
  }
}

/* ============================================
   Graph Section
   ============================================ */
.graph-section {
  overflow-x: auto;
  padding: 20px 8px 8px 8px; /* Safe zone for tooltips and box-shadows */
  width: max-content;
  max-width: 100%;
  
  /* Hide scrollbar visually but allow scrolling */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Month labels row */
.month-labels {
  position: relative;
  height: 18px;
  margin-bottom: 4px;
  margin-left: 28px; /* Offset for the sticky weekday labels (24px + 4px gap) */

  .month-label {
    position: absolute;
    top: 0;
    font-size: 11px;
    color: var(--vp-c-text-2);
    white-space: nowrap;
    line-height: 1;
  }
}

/* Grid row: weekday labels + contribution cells */
.grid-row {
  display: flex;
  gap: 4px;
}

.weekday-labels {
  width: 24px;
  flex-shrink: 0;
  display: grid;
  grid-template-rows: repeat(7, $cell-size);
  gap: $cell-gap;
  
  position: sticky;
  left: 0;
  background-color: var(--vp-c-bg); /* Match theme background so it hides cells sliding under it */
  z-index: 5;

  span {
    display: flex;
    align-items: center;
    font-size: 10px;
    color: var(--vp-c-text-2);
    line-height: 1;
    justify-content: flex-end;
    padding-right: 4px;
  }
}

.contribution-grid {
  display: grid;
  grid-template-rows: repeat(7, $cell-size);
  grid-auto-flow: column;
  gap: $cell-gap;
}

/* ============================================
   Cells
   ============================================ */
.cell {
  width: $cell-size;
  height: $cell-size;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;

  /* Level colors with visible outlines for empty cells */
  &.level-0, &.cell-empty { 
    background-color: transparent; 
    outline: 1px solid var(--vp-c-divider); 
    outline-offset: -1px; 
  }
  &.level-1 { background-color: $level-1; }
  &.level-2 { background-color: $level-2; }
  &.level-3 { background-color: $level-3; }
  &.level-4 { background-color: $level-4; }
  
  &.cell-empty { cursor: default; }

  /* Hover effect: Glow */
  &:not(.cell-empty):hover {
    box-shadow: 0 0 6px 1px #a855f7;
    outline: 1px solid #d8b4fe;
    outline-offset: -1px;
    z-index: 10;
  }

  /* Tooltip bubble (Default: Centered) */
  &:not(.cell-empty):hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: #24292f;
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
    pointer-events: none;
    z-index: 999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }

  /* Tooltip arrow (Default: Centered) */
  &:not(.cell-empty):hover::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #24292f;
    pointer-events: none;
    z-index: 999;
  }

  /* Edge case: First 8 columns (left edge) - Prevent left overflow */
  &:nth-child(-n+56):not(.cell-empty):hover::after {
    left: 0;
    transform: none;
  }
  &:nth-child(-n+56):not(.cell-empty):hover::before {
    left: 6px;
    transform: none;
  }

  /* Edge case: Last 8 columns (right edge) - Prevent right overflow */
  &:nth-last-child(-n+56):not(.cell-empty):hover::after {
    left: auto;
    right: 0;
    transform: none;
  }
  &:nth-last-child(-n+56):not(.cell-empty):hover::before {
    left: auto;
    right: 6px;
    transform: none;
  }
}

/* ============================================
   Legend
   ============================================ */
.legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 10px;
  padding-right: 4px;

  .legend-text {
    font-size: 11px;
    color: var(--vp-c-text-2);
    margin: 0 2px;
  }

  .legend-cell {
    width: $cell-size;
    height: $cell-size;
    border-radius: 2px;

    &.level-0 { 
      background-color: transparent;
      outline: 1px solid var(--vp-c-divider);
      outline-offset: -1px;
    }
    &.level-1 { background-color: $level-1; }
    &.level-2 { background-color: $level-2; }
    &.level-3 { background-color: $level-3; }
    &.level-4 { background-color: $level-4; }
  }
}

/* ============================================
   Visit counter
   ============================================ */
.flex {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;

  h1 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    color: var(--vp-c-text-1);
  }
}

/* ============================================
   Responsive
   ============================================ */
@media screen and (max-width: 768px) {
  .contribute-wrapper {
    padding: 20px 16px 0;
  }
  .layout-container {
    flex-direction: column;
  }
  .year-list {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
    
    .year-button {
      flex: 0 0 auto;
      padding: 6px 16px;
    }
  }
  .calendar-card {
    width: 100%;
    padding: 16px;
  }
}
</style>

