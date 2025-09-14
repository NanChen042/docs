import {
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  toRaw,
  watch
} from "./chunk-YRCM6ECU.js";
import "./chunk-LQ2VYIYD.js";

// node_modules/.pnpm/tlbs-map-vue@1.3.1_vue@3.4.8/node_modules/tlbs-map-vue/dist/v3/index.es.js
var _ = Object.defineProperty;
var k = (e, a, n) => a in e ? _(e, a, { enumerable: true, configurable: true, writable: true, value: n }) : e[a] = n;
var M = (e, a, n) => (k(e, typeof a != "symbol" ? a + "" : a, n), n);
var Z = false;
function O(e, a) {
  const n = {};
  Object.keys(a.attrs).forEach((t) => {
    if (t.indexOf("on") === 0) {
      const l = B(t.slice(2));
      n[l] = (...r) => a.emit(l, ...r);
    }
  }), Object.keys(n).forEach((t) => {
    e.on(t, n[t]);
  }), onUnmounted(() => {
    Object.keys(n).forEach((t) => {
      e.off(t, n[t]);
    });
  });
}
function B(e) {
  return !e || e.length === 0 ? e : e.charAt(0).toLowerCase() + e.slice(1);
}
var y = "Tlbs";
var L = {
  // 腾讯位置服务开发Key
  apiKey: {
    type: String,
    default: ""
  },
  // 地图附加库
  libraries: {
    type: String,
    default: "visualization,geometry,vector,tools"
  },
  // 地图中心点经纬度
  center: {
    type: Object,
    default: () => ({ lat: 40.040452, lng: 116.273486 })
  },
  // 地图缩级别
  zoom: {
    type: Number,
    default: 17
  },
  // 地图最小缩放级别
  minZoom: {
    type: Number,
    default: 3
  },
  // 地图最大缩放级别
  maxZoom: {
    type: Number,
    default: 20
  },
  // 地图控件配置
  control: {
    type: Object,
    default: () => ({ zoom: true, scale: true, rotation: true })
  },
  // 除了上述属性其他初始化属性
  options: {
    type: Object,
    default: () => ({})
  }
};
L.class = {
  type: String,
  default: ""
}, L.style = {
  type: Object,
  default: () => ({})
};
var F = defineComponent({
  name: `${y}Map`,
  inheritAttrs: Z,
  props: L,
  emits: ["map_inited"],
  setup(e, a) {
    const n = ref(null), t = ref(null);
    let l;
    return onMounted(async () => {
      e.apiKey && await H(e.apiKey, e.libraries), n.value && (l = new TMap.Map(n.value, {
        ...e.options,
        center: new TMap.LatLng(e.center.lat, e.center.lng),
        zoom: e.zoom,
        minZoom: e.minZoom,
        maxZoom: e.maxZoom
      }), t.value = l, nextTick(() => {
        a.emit("map_inited", l);
      }), O(l, a), Object.keys(e.control).forEach((r) => {
        let u;
        switch (r) {
          case "rotation":
            u = TMap.constants.DEFAULT_CONTROL_ID.ROTATION;
            break;
          case "scale":
            u = TMap.constants.DEFAULT_CONTROL_ID.SCALE;
            break;
          case "zoom":
            u = TMap.constants.DEFAULT_CONTROL_ID.ZOOM;
            break;
        }
        if (!e.control[r]) {
          l.removeControl(u);
          return;
        }
        if (typeof e.control[r] == "object") {
          const o = l.getControl(u), { position: T, className: s, numVisible: g } = e.control[r], h2 = {
            topLeft: TMap.constants.CONTROL_POSITION.TOP_LEFT,
            topCenter: TMap.constants.CONTROL_POSITION.TOP_CENTER,
            topRight: TMap.constants.CONTROL_POSITION.TOP_RIGHT,
            centerLeft: TMap.constants.CONTROL_POSITION.CENTER_LEFT,
            center: TMap.constants.CONTROL_POSITION.CENTER,
            centerRight: TMap.constants.CONTROL_POSITION.CENTER_RIGHT,
            bottomLeft: TMap.constants.CONTROL_POSITION.BOTTOM_LEFT,
            bottomCenter: TMap.constants.CONTROL_POSITION.BOTTOM_CENTER,
            bottomRight: TMap.constants.CONTROL_POSITION.BOTTOM_RIGHT
          };
          h2[T] && o.setPosition(h2[T]), s && o.setClassName(s), g && o.setNumVisible(g);
        }
      }));
    }), onUnmounted(() => {
      l && l.destroy();
    }), watch(
      () => e.center,
      (r) => {
        l && l.setCenter(r);
      }
    ), watch(
      () => e.zoom,
      (r) => {
        l && l.setZoom(r);
      }
    ), provide("map", t), {
      map: t,
      ele: n
    };
  },
  render() {
    const e = {
      ref: "ele",
      // @ts-ignore
      class: this.class,
      // @ts-ignore
      style: this.style
    };
    return h(
      "div",
      e,
      // eslint-disable-next-line no-nested-ternary
      // @ts-ignore
      this.$slots.default && this.map ? this.$slots.default() : []
    );
  }
});
var j = [];
var p;
function H(e, a) {
  return new Promise((n) => {
    if (window.TMap) {
      n();
      return;
    }
    if (j.push(n), window.initGLMap || (window.initGLMap = () => {
      j.forEach((t) => {
        t();
      });
    }), !p) {
      p = document.createElement("script");
      const t = a ? `https://map.qq.com/api/gljs?v=1.exp&key=${e}&libraries=${a}&callback=initGLMap` : `https://map.qq.com/api/gljs?v=1.exp&key=${e}&callback=initGLMap`;
      p.type = "text/javascript", p.src = t, document.body.appendChild(p);
    }
  });
}
function b(e) {
  return e.map((a) => ({
    ...a,
    position: new TMap.LatLng(a.position.lat, a.position.lng)
  }));
}
var W = defineComponent({
  name: `${y}MultiMarker`,
  props: {
    // 图层id
    id: {
      type: String,
      default: "multiMarker"
    },
    // 点标注的相关样式
    styles: {
      type: Object,
      required: true
    },
    // 点标注数据数组
    geometries: {
      type: Array,
      required: true
    },
    // 其他初始化配置
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.MultiMarker({
      ...e.options,
      id: e.id,
      map: toRaw(n.value),
      styles: A(e.styles),
      geometries: b(e.geometries)
    });
    return O(t, a), onUnmounted(() => {
      t.setMap(null);
    }), watch(
      () => e.styles,
      (l) => {
        t.setStyles(A(l));
      }
    ), watch(
      () => e.geometries,
      (l) => {
        t.setGeometries(b(l));
      }
    ), {
      marker: t
    };
  },
  render() {
    return null;
  }
});
function A(e) {
  const a = {};
  return Object.keys(e).forEach((n) => {
    a[n] = new TMap.MarkerStyle(e[n]);
  }), a;
}
var U = defineComponent({
  name: `${y}MarkerCluster`,
  props: {
    id: {
      type: String,
      default: "markerCluster"
    },
    geometries: {
      type: Array,
      required: true
    },
    gridSize: {
      type: Number,
      default: 60
    },
    maxZoom: {
      type: Number,
      default: 13
    },
    minimumClusterSize: {
      type: Number,
      default: 2
    },
    zoomOnClick: {
      type: Boolean,
      default: true
    },
    averageCenter: {
      type: Boolean,
      default: false
    },
    enableDefaultStyle: {
      type: Boolean,
      default: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["clusterchange"],
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.MarkerCluster({
      ...e.options,
      id: e.id,
      // 图层id
      map: toRaw(n.value),
      // 设置点聚合显示在哪个map对象中（创建map的段落省略）
      enableDefaultStyle: e.enableDefaultStyle,
      // 使用默认样式
      minimumClusterSize: e.minimumClusterSize,
      // 最小聚合点数：2个
      geometries: b(e.geometries),
      zoomOnClick: e.zoomOnClick,
      // 点击聚合数字放大展开
      gridSize: e.gridSize,
      // 聚合算法的可聚合距离，即距离小于该值的点会聚合至一起，默认为60，以像素为单位
      averageCenter: e.averageCenter,
      // 每个聚和簇的中心是否应该是聚类中所有标记的平均值
      maxZoom: e.maxZoom
      // 采用聚合策略的最大缩放级别，若地图缩放级别大于该值，则不进行聚合，标点将全部被展开
    });
    let l = [], r = [];
    return t.on("cluster_changed", () => {
      l = [], r = [];
      const u = t.getClusters();
      let o = [];
      u.forEach((s) => {
        s.geometries.length > 1 && o.indexOf(s.geometries.length) === -1 && o.push(s.geometries.length);
      }), o = o.sort((s, g) => s - g);
      const T = n.value.getZoom();
      u.forEach((s) => {
        const g = s.geometries.length;
        if (T >= e.maxZoom)
          r.push({
            center: s.center,
            data: s
          });
        else if (s.geometries.length > 1) {
          const h2 = o.indexOf(g), I = `${30 + h2 * 0.5 + String(g).length * 8}px`;
          l.push({
            center: s.center,
            width: I,
            height: I,
            "line-height": I,
            content: g,
            sort: h2,
            data: s
          });
        } else
          r.push({
            center: s.center,
            data: s
          });
      }), a.emit("clusterchange", r, l);
    }), O(t, a), onUnmounted(() => {
      t.setMap(null);
    }), watch(
      () => e.geometries,
      (u) => {
        t.setGeometries(b(u));
      }
    ), {
      aggregationPoints: l,
      scatteredPoints: r,
      markerCluster: t
    };
  },
  render() {
    return null;
  }
});
var K = (e) => {
  const a = (n) => Array.isArray(n) ? n.map((t) => a(t)) : new TMap.LatLng(n.lat, n.lng);
  return e.map((n) => a(n));
};
var C = (e) => e.map((a) => ({
  ...a,
  paths: K(a.paths)
}));
var V = defineComponent({
  name: `${y}MultiPolygon`,
  props: {
    // 图层id
    id: {
      type: String,
      default: "multiPolygon"
    },
    // 多边形的相关样式
    styles: {
      type: Object,
      required: true
    },
    // 多边形数据数组
    geometries: {
      type: Array,
      required: true
    },
    // 其他初始化配置
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.MultiPolygon({
      ...e.options,
      id: e.id,
      map: toRaw(n.value),
      styles: S(e.styles),
      geometries: C(e.geometries)
    });
    return O(t, a), onUnmounted(() => {
      t.setMap(null);
    }), watch(
      () => e.styles,
      (l) => {
        t.setStyles(S(l));
      }
    ), watch(
      () => e.geometries,
      (l) => {
        t.setGeometries(C(l));
      }
    ), {
      polygon: t
    };
  },
  render() {
    return null;
  }
});
function S(e) {
  const a = {};
  return Object.keys(e).forEach((n) => {
    "extrudeHeight" in e[n] ? a[n] = new TMap.ExtrudablePolygonStyle(e[n]) : a[n] = new TMap.PolygonStyle(e[n]);
  }), a;
}
var E = (e) => {
  const a = (n) => Array.isArray(n) ? n.map((t) => a(t)) : new TMap.LatLng(n.lat, n.lng);
  return e.map((n) => a(n));
};
var P = (e) => e.map((a) => a.rainbowPaths ? {
  ...a,
  rainbowPaths: a.rainbowPaths.map((n) => ({
    ...n,
    path: E(n.path)
  }))
} : {
  ...a,
  paths: E(a.paths)
  // 坐标转换
});
var X = defineComponent({
  name: `${y}MultiPolyline`,
  props: {
    // 图层id
    id: {
      type: String,
      default: "multiPolyline"
    },
    // 折线的相关样式
    styles: {
      type: Object,
      required: true
    },
    // 折线数据数组
    geometries: {
      type: Array,
      required: true
    },
    // 其他初始化配置
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.MultiPolyline({
      ...e.options,
      id: e.id,
      map: toRaw(n.value),
      styles: R(e.styles),
      geometries: P(e.geometries)
    });
    return O(t, a), onUnmounted(() => {
      t.setMap(null);
    }), watch(
      () => e.styles,
      (l) => {
        t.setStyles(R(l));
      }
    ), watch(
      () => e.geometries,
      (l) => {
        t.setGeometries(P(l));
      }
    ), {
      polyline: t
    };
  },
  render() {
    return null;
  }
});
function R(e) {
  const a = {};
  return Object.keys(e).forEach((n) => {
    a[n] = new TMap.PolylineStyle(e[n]);
  }), a;
}
var Y = defineComponent({
  name: `${y}MultiCircle`,
  props: {
    // 图层id
    id: {
      type: String,
      default: "multiCircle"
    },
    // 圆的相关样式
    styles: {
      type: Object,
      required: true
    },
    // 圆数据数组
    geometries: {
      type: Array,
      required: true
    },
    // 其他初始化配置
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.MultiCircle({
      ...e.options,
      id: e.id,
      map: toRaw(n.value),
      styles: v(e.styles),
      geometries: N(e.geometries)
    });
    return O(t, a), onUnmounted(() => {
      t.setMap(null);
    }), watch(
      () => e.styles,
      (l) => {
        t.setStyles(v(l));
      }
    ), watch(
      () => e.geometries,
      (l) => {
        t.setGeometries(N(l));
      }
    ), {
      circle: t
    };
  },
  render() {
    return null;
  }
});
function v(e) {
  const a = {};
  return Object.keys(e).forEach((n) => {
    a[n] = new TMap.CircleStyle(e[n]);
  }), a;
}
function N(e) {
  return e.map((a) => ({
    ...a,
    center: new TMap.LatLng(a.center.lat, a.center.lng)
  }));
}
var J = defineComponent({
  name: `${y}MultiLabel`,
  props: {
    // 图层id
    id: {
      type: String,
      default: "multiLabel"
    },
    // 文本标注的相关样式
    styles: {
      type: Object,
      required: true
    },
    // 文本标注数据数组
    geometries: {
      type: Array,
      required: true
    },
    // 其他初始化配置
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.MultiLabel({
      ...e.options,
      id: e.id,
      map: toRaw(n.value),
      styles: D(e.styles),
      geometries: q(e.geometries)
    });
    return O(t, a), onUnmounted(() => {
      t.setMap(null);
    }), watch(
      () => e.styles,
      (l) => {
        t.setStyles(D(l));
      }
    ), watch(
      () => e.geometries,
      (l) => {
        t.setGeometries(q(l));
      }
    ), {
      label: t
    };
  },
  render() {
    return null;
  }
});
function D(e) {
  const a = {};
  return Object.keys(e).forEach((n) => {
    a[n] = new TMap.LabelStyle(e[n]);
  }), a;
}
function q(e) {
  return e.map((a) => ({
    ...a,
    position: new TMap.LatLng(a.position.lat, a.position.lng)
  }));
}
var Q = defineComponent({
  name: `${y}DomOverlay`,
  props: {
    // DOM覆盖物经纬度位置
    position: {
      type: Object,
      required: true
    },
    // DOM覆盖物相对中心点偏移量
    offset: {
      type: Object,
      required: false,
      default: () => ({ x: 0, y: 0 })
    },
    // 额外参数支持事件是否冒泡
    options: {
      type: Object,
      default: () => ({
        enableBubble: true
      })
    },
    width: {
      type: Number,
      required: false
    },
    height: {
      type: Number,
      required: false
    }
  },
  setup(e) {
    const a = inject("map");
    if (!a)
      return;
    const n = ref(null);
    class t extends TMap.DOMOverlay {
      constructor(o) {
        super(o);
        M(this, "map");
        M(this, "position", null);
        M(this, "offset", null);
        this.map = o.map, this.onInit(o);
      }
      // 初始化DOMOverlay
      onInit(o) {
        this.position = o.position, this.offset = o.offset, this.dom = o.dom, this.dom.style.position = "absolute";
      }
      // 创建DOM
      createDOM() {
        return this.dom;
      }
      // 缩放地图或者移动地图触发
      updateDOM() {
        nextTick(() => {
          if (this.map && this.position && this.offset) {
            const o = this.map.projectToContainer(new TMap.LatLng(this.position.lat, this.position.lng)), T = e.width || this.dom.clientWidth, s = e.height || this.dom.clientHeight, g = `${o.getX() - T / 2 + this.offset.x}px`, h2 = `${o.getY() - s / 2 + this.offset.y}px`;
            this.dom.style.left = g, this.dom.style.top = h2;
          }
        });
      }
      // 更新DOM位置
      updatePosition() {
        l.position = e.position, l.offset = e.offset, this.updateDOM();
      }
      // 销毁DOMOverlay实例
      onDestroy() {
        this.setMap(null);
      }
    }
    let l;
    return onMounted(() => {
      n.value && (l = new t({
        ...e.options,
        position: e.position,
        offset: e.offset,
        map: toRaw(a.value),
        dom: n.value
      }), e.options.enableBubble || (n.value.addEventListener("click", (r) => r.stopPropagation()), n.value.addEventListener("dblclick", (r) => r.stopPropagation()), n.value.addEventListener("mousemove", (r) => r.stopPropagation())));
    }), onUnmounted(() => {
      l.onDestroy();
    }), watch(() => [e.position, e.offset], () => {
      l.updatePosition();
    }), {
      dom: n
    };
  },
  render() {
    return h(
      "div",
      { ref: "dom" },
      this.$slots.default ? this.$slots.default() : []
    );
  }
});
var ee = defineComponent({
  name: `${y}Heat`,
  props: {
    // 热力数据
    data: {
      type: Array,
      required: true
    },
    // 最大辐射半径
    radius: {
      type: Number,
      default: 50
    },
    // 峰值高度
    height: {
      type: Number,
      default: 100
    },
    // 全局透明度
    opacity: {
      type: Number,
      default: 0.8
    },
    // 热力最弱阈值
    min: {
      type: Number,
      default: 0
    },
    // 热力最强阈值
    max: {
      type: Number,
      required: false
    },
    // 渐变颜色
    gradientColor: {
      type: Object,
      required: false
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e) {
    const a = inject("map");
    if (!a)
      return;
    const n = new TMap.visualization.Heat({
      ...e.options,
      radius: e.radius,
      height: e.height,
      opacity: e.opacity,
      min: e.min,
      max: e.max
    });
    return n.addTo(toRaw(a.value)), e.gradientColor && n.setGradientColor(new TMap.GradientColor(e.gradientColor)), e.max && n.setMax(e.max), n.setData(e.data), onUnmounted(() => {
      n.remove(), n.destroy();
    }), watch(() => e.gradientColor, (t) => {
      t && n.setGradientColor(new TMap.GradientColor(t));
    }), watch(() => e.data, (t) => {
      n.setData(t);
    }), watch(() => e.radius, (t) => {
      n.setRadius(t);
    }), watch(() => e.height, (t) => {
      n.setHeight(t);
    }), watch(() => e.opacity, (t) => {
      n.setOpacity(t);
    }), watch(() => e.min, (t) => {
      n.setMin(t);
    }), watch(() => e.max, (t) => {
      t && n.setMax(t);
    }), {
      heat: n
    };
  },
  render() {
    return null;
  }
});
var te = {
  circleId: {
    type: String,
    default: "circle"
  },
  defaultCircleGeometries: {
    type: Array
  },
  circleStyles: {
    type: Object
  },
  circleDrawingStyleId: {
    type: String,
    default: "default"
  },
  circleSelectedStyleId: {
    type: String,
    default: "default"
  },
  polygonId: {
    type: String,
    default: "polygon"
  },
  defaultPolygonGeometries: {
    type: Array
  },
  polygonStyles: {
    type: Object
  },
  polygonDrawingStyleId: {
    type: String,
    default: "default"
  },
  polygonSelectedStyleId: {
    type: String,
    default: "default"
  },
  activeOverlayId: {
    type: String,
    default: "polygon"
  },
  actionMode: {
    type: String,
    default: "draw"
  },
  snappable: {
    type: Boolean,
    default: false
  },
  selectable: {
    type: Boolean,
    default: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
};
var ne = defineComponent({
  name: `${y}GeometryEditor`,
  props: te,
  emits: ["select", "update:activeOverlayId"],
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = toRaw(n.value), l = new TMap.MultiCircle({
      id: e.circleId,
      map: t,
      styles: e.circleStyles ? v(e.circleStyles) : {},
      geometries: e.defaultCircleGeometries ? N(e.defaultCircleGeometries) : []
    }), r = new TMap.MultiPolygon({
      id: e.polygonId,
      map: t,
      styles: e.polygonStyles ? S(e.polygonStyles) : {},
      geometries: e.defaultPolygonGeometries ? C(e.defaultPolygonGeometries) : []
    });
    l.on("click", (o) => {
      e.actionMode !== "draw" && (a.emit("select", o.geometry), a.emit("update:activeOverlayId", e.circleId));
    }), r.on("click", (o) => {
      e.actionMode !== "draw" && (a.emit("select", o.geometry), a.emit("update:activeOverlayId", e.polygonId));
    });
    const u = new TMap.tools.GeometryEditor({
      ...e.options,
      map: t,
      // 编辑器绑定的地图对象
      overlayList: [
        // 可编辑图层
        {
          overlay: r,
          id: e.polygonId,
          selectedStyleId: e.polygonSelectedStyleId,
          drawingStyleId: e.polygonDrawingStyleId
        },
        {
          overlay: l,
          id: e.circleId,
          selectedStyleId: e.circleSelectedStyleId,
          drawingStyleId: e.circleDrawingStyleId
        }
      ],
      actionMode: e.actionMode === "draw" ? TMap.tools.constants.EDITOR_ACTION.DRAW : TMap.tools.constants.EDITOR_ACTION.INTERACT,
      // 编辑器的工作模式
      activeOverlayId: e.activeOverlayId,
      // 激活图层
      selectable: e.selectable,
      // 开启点选功能
      snappable: e.snappable
      // 开启吸附
    });
    return O(u, a), onUnmounted(() => {
      l.setMap(null), r.setMap(null);
      try {
        u.setMap(null);
      } catch (o) {
        console.error(o);
      }
    }), watch(
      () => e.circleStyles,
      (o) => {
        o && l.setStyles(v(o));
      }
    ), watch(
      () => e.polygonStyles,
      (o) => {
        o && r.setStyles(S(o));
      }
    ), watch(() => e.activeOverlayId, (o) => o && u.setActiveOverlay(o)), watch(() => e.actionMode, (o) => o && u.setActionMode(o === "draw" ? TMap.tools.constants.EDITOR_ACTION.DRAW : TMap.tools.constants.EDITOR_ACTION.INTERACT)), {
      circle: l,
      polygon: r,
      editor: u
    };
  },
  render() {
    return null;
  }
});
var ae = defineComponent({
  name: `${y}Arc`,
  props: {
    // 弧线数据
    data: {
      type: Array,
      required: true
    },
    // 弧线图样式映射函数，接收ArcLine数据返回对应样式，样式对象规范详见TMap.visualization.ArcStyle
    pickStyle: {
      type: Function,
      require: false
    },
    // 弧线模式，horizontal 代表贴地的弧线，vertical 代表弧线所在平面会垂直于底图平面，默认为vertical。
    mode: {
      type: String,
      default: "vertical"
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e) {
    const a = inject("map");
    if (!a)
      return;
    const n = new TMap.visualization.Arc({
      ...e.options,
      mode: e.mode
    });
    return n.addTo(toRaw(a.value)), e.pickStyle && n.setPickStyle(e.pickStyle), n.setData(e.data), onUnmounted(() => {
      n.remove(), n.destroy();
    }), watch(() => e.pickStyle, (t) => {
      t && n.setPickStyle(t);
    }), watch(() => e.data, (t) => {
      n.setData(t);
    }), watch(() => e.mode, (t) => {
      n.setMode(t);
    }), {
      arc: n
    };
  },
  render() {
    return null;
  }
});
var le = defineComponent({
  name: `${y}Grid`,
  props: {
    // 网格数据
    data: {
      type: Array,
      required: true
    },
    sideLength: {
      type: Number,
      required: false,
      default: 1e3
    },
    extrudable: {
      type: Boolean,
      required: false,
      default: true
    },
    colorList: {
      type: Array,
      required: false,
      default: () => ["#D8AFA7", "#842610", "#641200"]
    },
    heightRange: {
      type: Array,
      required: false,
      default: () => [1, 100]
    },
    showRange: {
      type: Array,
      required: false,
      default: () => []
    },
    options: {
      type: Object,
      required: false,
      default: () => ({})
    },
    selectOptions: {
      type: Object,
      required: false,
      default: null
    }
  },
  setup(e) {
    const a = inject("map");
    if (!a)
      return;
    const n = new TMap.visualization.Grid({
      ...e.options,
      sideLength: e.sideLength,
      // 设置网格边长
      extrudable: e.extrudable,
      // 网格是否可拔起
      colorList: e.colorList,
      // 颜色层级
      heightRange: e.heightRange,
      // 高度变化区间
      showRange: e.showRange
      // 聚合数据显示区间
    });
    return n.addTo(toRaw(a.value)), n.setData(e.data), e.selectOptions && n.setSelectOptions(e.selectOptions), onUnmounted(() => {
      n.remove(), n.destroy();
    }), watch(() => e.showRange, (t) => {
      n.setShowRange(t);
    }), watch(() => e.sideLength, (t) => {
      n.setSideLength(t);
    }), watch(() => e.extrudable, (t) => {
      n.setExtrudable(t);
    }), watch(() => e.colorList, (t) => {
      n.setColorList(t);
    }), watch(() => e.heightRange, (t) => {
      n.setHeightRange(t);
    }), watch(() => e.data, (t) => {
      n.setData(t);
    }), watch(() => e.options.zIndex, (t) => {
      t !== void 0 && n.setZIndex(t);
    }), watch(() => e.options.minZoom, (t) => {
      t && n.setMinZoom(t);
    }), watch(() => e.options.maxZoom, (t) => {
      t && n.setMaxZoom(t);
    }), {
      grid: n
    };
  },
  render() {
    return null;
  }
});
var ie = defineComponent({
  name: `${y}Area`,
  props: {
    // 数据
    data: {
      type: Array,
      required: true
    },
    // 样式
    styles: {
      type: Object,
      required: true
    },
    selectOptions: {
      type: Object,
      required: false,
      default: () => null
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e) {
    const a = inject("map");
    if (!a)
      return;
    const n = new TMap.visualization.Area({
      ...e.options,
      styles: e.styles
      // 设置网格边长
    });
    return e.selectOptions && n.setSelectOptions(e.selectOptions), n.setData(e.data), n.addTo(toRaw(a.value)), onUnmounted(() => {
      n.remove(), n.destroy();
    }), watch(() => e.styles, (t) => {
      n.setStyles(t);
    }), watch(() => e.data, (t) => {
      n.setData(t);
    }), watch(() => e.selectOptions, (t) => {
      t && n.setSelectOptions(t);
    }), watch(() => e.options.zIndex, (t) => {
      t !== void 0 && n.setZIndex(t);
    }), watch(() => e.options.minZoom, (t) => {
      t && n.setMinZoom(t);
    }), watch(() => e.options.maxZoom, (t) => {
      t && n.setMaxZoom(t);
    }), {
      area: n
    };
  },
  render() {
    return null;
  }
});
var oe = defineComponent({
  name: `${y}InfoWindow`,
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    position: {
      type: Object,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    // 其他初始化配置
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.InfoWindow({
      ...e.options,
      map: toRaw(n.value),
      position: new TMap.LatLng(e.position.lat, e.position.lng),
      content: e.content
    });
    return e.visible ? t.open() : t.close(), O(t, a), onUnmounted(() => {
      t.destroy();
    }), watch(() => e.visible, (l) => {
      l ? t.open() : t.close();
    }), watch(() => e.position, (l) => {
      t.setPosition(new TMap.LatLng(l.lat, l.lng));
    }), watch(() => e.content, (l) => {
      t.setContent(l);
    }), {
      infoWindow: t
    };
  },
  render() {
    return null;
  }
});
var re = defineComponent({
  name: `${y}Dot`,
  props: {
    // 散点数据
    data: {
      type: Array,
      required: true
    },
    // 散点样式
    styles: {
      type: Object,
      required: true
    },
    // 散点固定朝向
    faceTo: {
      type: String,
      default: "screen"
    },
    // 拾取配置
    selectOptions: {
      type: Object,
      default: () => ({})
    },
    // 散点图呈现泛光效果
    enableBloom: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(e, a) {
    const n = inject("map");
    if (!n)
      return;
    const t = new TMap.visualization.Dot({
      ...e.options,
      styles: e.styles,
      faceTo: e.faceTo,
      enableBloom: e.enableBloom,
      selectOptions: e.selectOptions
    });
    return t.addTo(toRaw(n.value)), t.setData(e.data), O(t, a), onUnmounted(() => {
      t.remove(), t.destroy();
    }), watch(() => e.data, (l) => {
      t.setData(l);
    }), watch(() => e.styles, (l) => {
      t.setStyles(l);
    }), watch(() => e.faceTo, (l) => {
      t.setFaceTo(l);
    }), watch(() => e.selectOptions, (l) => {
      t.setSelectOptions(l);
    }), {
      dot: t
    };
  },
  render() {
    return null;
  }
});
var se = [
  F,
  W,
  V,
  X,
  Y,
  Q,
  J,
  ee,
  ne,
  U,
  ae,
  le,
  ie,
  oe,
  re
];
var de = {
  install(e) {
    se.forEach((a) => e.component(a.name, a));
  }
};
export {
  ae as Arc,
  ie as Area,
  F as BaseMap,
  Q as DomOverlay,
  re as Dot,
  ne as GeometryEditor,
  le as Grid,
  ee as Heat,
  oe as InfoWindow,
  U as MarkerCluster,
  Y as MultiCircle,
  J as MultiLabel,
  W as MultiMarker,
  V as MultiPolygon,
  X as MultiPolyline,
  de as default
};
//# sourceMappingURL=tlbs-map-vue.js.map
