/**
 * POI搜索功能 Composable
 * 负责周边搜索、关键词提示、搜索结果管理等
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'

// POI数据接口
export interface PoiItem {
  id: string
  title: string
  address: string
  category: string
  tel?: string
  type: number
  location: { lat: number; lng: number }
  _distance: number
  ad_info?: {
    adcode: number
    province: string
    city: string
    district: string
  }
  value?: string // 用于自动补全显示
}

export interface PoiSearchOptions {
  keyword: string
  radius: number
  category: string
  autoExtend: boolean
  pageSize: number
  pageIndex: number
}

export interface CircleGeometry {
  styleId: string
  paths: { lat: number; lng: number }[][]
  properties: {
    id: string
    isSearchCircle: boolean
  }
}

// API配置
const API_KEY = 'XFIBZ-74JKO-3XCW3-SDVGT-FVOVF-RBFAS'
const API_BASE_URL = 'https://apis.map.qq.com/ws/place/v1'

// POI分类配置
const POI_CATEGORIES = [
  { label: '餐饮服务', value: '餐饮服务' },
  { label: '购物', value: '购物' },
  { label: '酒店', value: '酒店' },
  { label: '公交车站', value: '公交车站' },
  { label: '地铁站', value: '地铁站' },
  { label: '医疗', value: '医疗' },
  { label: '教育', value: '教育' },
  { label: '景点', value: '景点' },
  { label: '金融', value: '金融' },
  { label: '运动健身', value: '运动健身' },
]

// 快捷搜索标签
const QUICK_SEARCH_TAGS = [
  '餐厅', '超市', '酒店', '医院', '咖啡',
  '地铁', '公园', '银行', '健身房'
]

// 圆形样式配置
const CIRCLE_STYLES = {
  circle: {
    color: 'rgba(103, 194, 58, 0.25)',
    borderColor: '#67C23A',
    borderWidth: 3,
    borderStyle: 'solid',
  },
}

export function usePoiSearch() {
  // 搜索状态
  const poiSearchKeyword = ref<string>('')
  const poiSearchRadius = ref<number>(500)
  const poiSearchCategory = ref<string>('')
  const poiAutoExtend = ref<boolean>(true)
  const isUsingUserLocation = ref<boolean>(false)
  
  // 搜索结果状态
  const poiSearchResults = ref<PoiItem[]>([])
  const showSearchResults = ref<boolean>(false)
  const isSearching = ref<boolean>(false)
  const poiTotalCount = ref<number>(0)
  const poiCurrentPage = ref<number>(1)
  const activePoi = ref<string | null>(null)
  
  // 搜索范围圆形
  const circleGeometries = ref<CircleGeometry[]>([])
  const polygonRef = ref<any>(null)
  
  // 缓存管理
  const searchCache = new Map<string, { data: PoiItem[]; timestamp: number }>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  // 计算属性
  const poiCategories = computed(() => POI_CATEGORIES)
  const quickSearchTags = computed(() => QUICK_SEARCH_TAGS)
  const circleStyles = computed(() => CIRCLE_STYLES)
  
  const hasSearchResults = computed(() => poiSearchResults.value.length > 0)
  const shouldShowPagination = computed(() => poiTotalCount.value > 10)

  // 防抖处理
  let searchDebounceTimer: NodeJS.Timeout | null = null
  let suggestionDebounceTimer: NodeJS.Timeout | null = null

  // 工具方法
  const generateCacheKey = (options: Partial<PoiSearchOptions>, center: { lat: number; lng: number }): string => {
    return `${options.keyword}_${center.lat}_${center.lng}_${options.radius}_${options.category}_${options.pageIndex}`
  }

  const isValidCache = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }

  const cleanupOldScripts = (scriptId: string) => {
    const oldScript = document.getElementById(scriptId)
    if (oldScript) {
      document.body.removeChild(oldScript)
    }
  }

  const createJsonpRequest = (url: string, callbackName: string, scriptId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      cleanupOldScripts(scriptId)
      
      const script = document.createElement('script')
      script.id = scriptId
      script.src = url
      
      // 设置超时
      const timeout = setTimeout(() => {
        cleanup()
        reject(new Error('请求超时'))
      }, 10000)
      
      const cleanup = () => {
        clearTimeout(timeout)
        if (window[callbackName]) {
          delete window[callbackName]
        }
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
      
      window[callbackName] = (data: any) => {
        cleanup()
        resolve(data)
      }
      
      script.onerror = () => {
        cleanup()
        reject(new Error('网络请求失败'))
      }
      
      document.body.appendChild(script)
    })
  }

  // 搜索方法
  const searchNearbyPoi = async (
    keyword?: string,
    center?: { lat: number; lng: number }
  ): Promise<void> => {
    const searchKeyword = keyword || poiSearchKeyword.value.trim()
    
    if (!searchKeyword && !poiSearchCategory.value) {
      ElMessage.warning('请输入关键词或选择分类')
      return
    }

    if (!center) {
      ElMessage.warning('请提供搜索中心点')
      return
    }

    // 防抖处理
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    searchDebounceTimer = setTimeout(async () => {
      await performSearch(searchKeyword, center)
    }, 300)
  }

  const performSearch = async (keyword: string, center: { lat: number; lng: number }): Promise<void> => {
    const searchOptions: Partial<PoiSearchOptions> = {
      keyword,
      radius: poiSearchRadius.value,
      category: poiSearchCategory.value,
      autoExtend: poiAutoExtend.value,
      pageIndex: poiCurrentPage.value,
    }

    // 检查缓存
    const cacheKey = generateCacheKey(searchOptions, center)
    const cached = searchCache.get(cacheKey)
    
    if (cached && isValidCache(cached.timestamp)) {
      poiSearchResults.value = cached.data
      showSearchResults.value = true
      return
    }

    isSearching.value = true
    showSearchResults.value = true

    try {
      const callbackName = `mapCallback_${Date.now()}`
      const autoExtend = poiAutoExtend.value ? 1 : 0
      const encodedKeyword = encodeURIComponent(keyword)
      const boundary = `nearby(${center.lat},${center.lng},${poiSearchRadius.value},${autoExtend})`
      const filter = poiSearchCategory.value
        ? `&filter=category=${encodeURIComponent(poiSearchCategory.value)}`
        : ''

      const apiUrl = `${API_BASE_URL}/search?key=${API_KEY}&keyword=${encodedKeyword}&boundary=${boundary}${filter}&page_size=10&page_index=${poiCurrentPage.value}&get_subpois=1&output=jsonp&callback=${callbackName}`

      const data = await createJsonpRequest(apiUrl, callbackName, 'map-jsonp')

      if (data.status === 0) {
        const results = data.data.map((item: any) => ({
          id: item.id || `poi_${Date.now()}_${Math.random()}`,
          title: item.title,
          address: item.address || '',
          category: item.category || poiSearchCategory.value || keyword,
          tel: item.tel || '',
          type: item.type || 0,
          location: item.location || { lat: 0, lng: 0 },
          _distance: item._distance || 0,
          ad_info: item.ad_info || {
            adcode: 0,
            province: '',
            city: '',
            district: '',
          },
        }))

        poiSearchResults.value = results
        poiTotalCount.value = data.count

        // 缓存结果
        searchCache.set(cacheKey, {
          data: results,
          timestamp: Date.now(),
        })

        ElMessage.success(`搜索到 ${data.count} 个结果`)

        // 绘制搜索范围和结果
        if (results.length > 0) {
          drawSearchRadiusCircle(center, poiSearchRadius.value)
          adjustMapView(center, poiSearchRadius.value, results)
        }
      } else {
        ElMessage.error(`搜索失败: ${data.message}`)
        poiSearchResults.value = []
        poiTotalCount.value = 0
      }
    } catch (error) {
      console.error('POI搜索失败:', error)
      ElMessage.error('搜索失败，请稍后重试')
      poiSearchResults.value = []
      poiTotalCount.value = 0
    } finally {
      isSearching.value = false
    }
  }

  // 关键词提示
  const queryKeywordSuggestions = async (
    queryString: string,
    center: { lat: number; lng: number },
    callback: (suggestions: PoiItem[]) => void
  ): Promise<void> => {
    if (queryString.length < 1) {
      callback([])
      return
    }

    // 防抖处理
    if (suggestionDebounceTimer) {
      clearTimeout(suggestionDebounceTimer)
    }

    suggestionDebounceTimer = setTimeout(async () => {
      await performSuggestionQuery(queryString, center, callback)
    }, 200)
  }

  const performSuggestionQuery = async (
    queryString: string,
    center: { lat: number; lng: number },
    callback: (suggestions: PoiItem[]) => void
  ): Promise<void> => {
    try {
      const callbackName = `suggestionCallback_${Date.now()}`
      const apiUrl = `${API_BASE_URL}/suggestion?key=${API_KEY}&keyword=${encodeURIComponent(
        queryString
      )}&location=${center.lat},${center.lng}&policy=1&page_size=10&output=jsonp&callback=${callbackName}`

      const data = await createJsonpRequest(apiUrl, callbackName, 'suggestion-jsonp')

      if (data.status === 0 && data.data) {
        const suggestions = data.data.map((item: any) => ({
          id: item.id || `suggestion_${Date.now()}_${Math.random()}`,
          title: item.title,
          address: item.address || '',
          value: item.title,
          location: item.location || { lat: 0, lng: 0 },
          _distance: item._distance || 0,
          type: item.type || 0,
          category: item.category || '',
          ad_info: item.ad_info || {
            adcode: 0,
            province: '',
            city: '',
            district: '',
          },
        }))

        callback(suggestions)
      } else {
        console.error('API返回错误:', data)
        callback([])
      }
    } catch (error) {
      console.error('获取关键词提示失败:', error)
      callback([])
    }
  }

  // 搜索范围圆形绘制
  const drawSearchRadiusCircle = (center: { lat: number; lng: number }, radius: number): void => {
    try {
      circleGeometries.value = []

      const points: { lat: number; lng: number }[] = []
      const segments = 36
      const radiusLat = radius / 111320
      const radiusLng = radiusLat / Math.cos((center.lat * Math.PI) / 180)

      for (let i = 0; i <= segments; i++) {
        const angle = (Math.PI * 2 * i) / segments
        const dx = Math.cos(angle) * radiusLng
        const dy = Math.sin(angle) * radiusLat

        points.push({
          lat: center.lat + dy,
          lng: center.lng + dx,
        })
      }

      if (points.length > 0 && (
        points[0].lat !== points[points.length - 1].lat ||
        points[0].lng !== points[points.length - 1].lng
      )) {
        points.push({ ...points[0] })
      }

      circleGeometries.value = [{
        styleId: 'circle',
        paths: [points],
        properties: {
          id: 'search_circle',
          isSearchCircle: true,
        },
      }]

      // 刷新多边形组件
      setTimeout(() => {
        if (polygonRef.value && polygonRef.value.refresh) {
          polygonRef.value.refresh()
        }
      }, 100)
    } catch (error) {
      console.error('绘制搜索范围圆失败:', error)
    }
  }

  // 视图调整
  const adjustMapView = (
    center: { lat: number; lng: number },
    radius: number,
    results: PoiItem[]
  ): { center: { lat: number; lng: number }; zoom: number } => {
    if (!results || results.length === 0) {
      return {
        center,
        zoom: radius <= 500 ? 15 : radius <= 1000 ? 14 : 13,
      }
    }

    let minLat = center.lat
    let maxLat = center.lat
    let minLng = center.lng
    let maxLng = center.lng

    const radiusInDegrees = radius / 111000
    minLat = Math.min(minLat, center.lat - radiusInDegrees)
    maxLat = Math.max(maxLat, center.lat + radiusInDegrees)
    
    const lngOffset = radiusInDegrees / Math.cos((center.lat * Math.PI) / 180)
    minLng = Math.min(minLng, center.lng - lngOffset)
    maxLng = Math.max(maxLng, center.lng + lngOffset)

    results.forEach((poi) => {
      if (poi.location) {
        minLat = Math.min(minLat, poi.location.lat)
        maxLat = Math.max(maxLat, poi.location.lat)
        minLng = Math.min(minLng, poi.location.lng)
        maxLng = Math.max(maxLng, poi.location.lng)
      }
    })

    const newCenter = {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    }

    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)

    let zoom = 16
    if (maxDiff >= 0.1) zoom = 12
    else if (maxDiff >= 0.05) zoom = 13
    else if (maxDiff >= 0.01) zoom = 14

    return { center: newCenter, zoom }
  }

  // 搜索结果管理
  const clearSearchResults = (): void => {
    poiSearchResults.value = []
    showSearchResults.value = false
    activePoi.value = null
    circleGeometries.value = []
    poiTotalCount.value = 0
    poiCurrentPage.value = 1
  }

  const selectPoi = (poi: PoiItem): void => {
    activePoi.value = poi.id
  }

  const handlePageChange = (page: number): void => {
    poiCurrentPage.value = page
    // 重新搜索当前页
  }

  // 快速搜索
  const quickSearch = (keyword: string, center: { lat: number; lng: number }): void => {
    poiSearchKeyword.value = keyword
    searchNearbyPoi(keyword, center)
  }

  // 切换位置模式
  const toggleUseCurrentLocation = (): void => {
    isUsingUserLocation.value = !isUsingUserLocation.value
  }

  // 清理资源
  const cleanup = (): void => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }
    
    if (suggestionDebounceTimer) {
      clearTimeout(suggestionDebounceTimer)
      suggestionDebounceTimer = null
    }
    
    searchCache.clear()
    cleanupOldScripts('map-jsonp')
    cleanupOldScripts('suggestion-jsonp')
  }

  return {
    // 搜索状态
    poiSearchKeyword,
    poiSearchRadius,
    poiSearchCategory,
    poiAutoExtend,
    isUsingUserLocation,
    
    // 搜索结果状态
    poiSearchResults,
    showSearchResults,
    isSearching,
    poiTotalCount,
    poiCurrentPage,
    activePoi,
    
    // 圆形覆盖物
    circleGeometries,
    polygonRef,
    
    // 计算属性
    poiCategories,
    quickSearchTags,
    circleStyles,
    hasSearchResults,
    shouldShowPagination,
    
    // 搜索方法
    searchNearbyPoi,
    queryKeywordSuggestions,
    clearSearchResults,
    selectPoi,
    handlePageChange,
    quickSearch,
    toggleUseCurrentLocation,
    
    // 视图方法
    drawSearchRadiusCircle,
    adjustMapView,
    
    // 清理方法
    cleanup,
  }
}
