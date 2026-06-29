---
# 提供三种布局，doc、page和home
# 官方文档相关配置：https://vitepress.dev/reference/default-theme-layout
layout: home
layoutClass: "m-home-layout"
# home: true

# 官方文档相关配置：https://vitepress.dev/reference/default-theme-home-page
title: SW
titleTemplate: Hi，终于等到你
editLink: true
lastUpdated: true

hero:
  name: Hi,Southern Wind
  text: Endless Learning, Endless Growth.
  tagline: /午餐达人/办公室英雄/工具控/
  image:
    # 首页右边的图片
    src: /fwy.png
    # 图片的描述
    alt: 作者logo
  # 按钮相关
  actions:
    - theme: brand
      text: 开启探索
      link: 'https://vue3-blog-bt9.pages.dev/#/home'
    - theme: alt
      text: 成长轨迹
      link: /column/home/index
# 按钮下方的描述
features:
  - title: ""
    details: |
      <div class="flip-card-container">
        <input type="checkbox" id="main-flip-toggle" class="flip-toggle" style="display:none;">
        <div class="flip-card-inner">
          <!-- 正面 -->
          <div class="flip-card-front">
            <div class="fc-banner"></div>
            <label class="fc-flip-btn-wrapper" for="main-flip-toggle" aria-label="翻转卡片" style="cursor: pointer;">
              <div class="fc-flip-glow"></div>
              <div class="fc-flip-btn">
                <div class="fc-flip-fluid-bg"></div>
                <div class="fc-flip-svg-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                    <path d="M12 5v14" stroke-dasharray="3 3" />
                    <path d="M18 12v3a1 1 0 0 1-1 1h-2" />
                    <path d="M17 14l-2 2 2 2" />
                  </svg>
                </div>
              </div>
            </label>

            <div class="fc-avatar-wrapper">
              <img src="/logos.png" alt="Avatar" class="fc-avatar light-only-img">
              <img src="/logosdark.png" alt="Avatar" class="fc-avatar dark-only-img">
            </div>
            <div class="fc-info" style="align-items: center; text-align: center;">
              <div class="fc-name">南辰 (NanChen)</div>
              <div class="fc-role">前端开发——沪上漂泊记</div>
              
              <a href="/column/Travel/index" class="fc-btn-small">
                <span>查看个人历程</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
          
          <!-- 反面 -->
          <div class="flip-card-back">
            <div class="fc-back-header">
              <label for="main-flip-toggle" style="cursor: pointer; display: flex; align-items: center; flex: 1;" title="点击翻转回正面">
                <img src="/logos.png" alt="Avatar" class="fc-back-avatar light-only-img">
                <img src="/logosdark.png" alt="Avatar" class="fc-back-avatar dark-only-img">
                <div class="fc-back-expire">
                  <div class="fc-expire-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="12" height="12" style="margin-right:4px;"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 开发者档案</div>
                  <div class="fc-expire-val">NanChen</div>
                </div>
              </label>
              <label class="fc-back-qr" for="qr-modal-toggle" style="cursor: pointer;" title="点击查看二维码">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="5" height="5" x="3" y="3" rx="1"/>
                  <rect width="5" height="5" x="16" y="3" rx="1"/>
                  <rect width="5" height="5" x="3" y="16" rx="1"/>
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                  <path d="M21 21v.01"/>
                  <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                  <path d="M3 12h.01"/>
                  <path d="M12 3h.01"/>
                  <path d="M12 16v.01"/>
                  <path d="M16 12h1"/>
                  <path d="M21 12v.01"/>
                  <path d="M12 21v-1"/>
                </svg>
              </label>
            </div>
            <div class="fc-back-body">
              <div class="fc-row">
                <div class="fc-col">
                  <div class="fc-lbl">技能方向</div>
                  <div class="fc-val">前端核心 & 全栈</div>
                </div>
                <div class="fc-col">
                  <div class="fc-lbl">从业时间</div>
                  <div class="fc-val">4 Years</div>
                </div>
              </div>
              <div class="fc-row">
                <div class="fc-col">
                  <div class="fc-lbl">常驻城市</div>
                  <div class="fc-val">Shanghai, CN</div>
                </div>
                <div class="fc-col">
                  <div class="fc-lbl">当前状态</div>
                  <div class="fc-val">持续进化中</div>
                </div>
              </div>
              <div class="fc-row">
                <div class="fc-col" style="width:100%;">
                  <div class="fc-lbl">个人信条</div>
                  <div class="fc-val">步履虽缓，志不可停。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  - title: 核心技术栈 <span class="title-arrow-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7 M8 7h9v9"/></svg></span>
    details: |
      <div class="partner-grid marquee-container">
        <!-- 第一行：核心技术栈 (向左滚动) -->
        <div class="marquee-row">
          <div class="marquee-content">
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="#4FC08D" d="M12 20.5L3 5h4l5 8.5 5-8.5h4z"/></svg></div><span class="partner-name">Vue.js</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="#61DAFB" stroke-width="2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="2" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="2" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="2" transform="rotate(150 12 12)"/></svg></div><span class="partner-name">React</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#F7DF1E"/><path d="M11.75 14.71c-.34-.23-.62-.39-1.07-.39-.62 0-1.03.45-1.03 1.05 0 1.34 2.82 1.15 2.82 3.4 0 1.32-1.01 2.22-2.46 2.22-1.46 0-2.31-.76-2.73-1.44l1.24-.78c.31.54.79.9 1.48.9.71 0 1.06-.41 1.06-1.03 0-1.41-2.82-1.15-2.82-3.38 0-1.3.99-2.14 2.39-2.14 1.25 0 2.04.58 2.44 1.2l-1.32.74zm6.18 4.28h-1.63V10.2h1.63v8.79zm-1.63-9.91h1.63V7.55h-1.63v1.53z" fill="#000"/></svg></div><span class="partner-name">JavaScript</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#3178C6"/><path fill="#FFF" d="M13.5 16h-2v-4.5H9v-2h6.5v2h-2z"/></svg></div><span class="partner-name">TypeScript</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="#E34F26" d="M4 3l1.5 17 6.5 2 6.5-2L20 3z"/><path fill="#FFF" d="M12 8h4.5l-.5-2H7.5l.5 5h8.5l-.5 4.5-4 1-4-1-.25-2.5H6L6.5 17l5.5 1.5L17.5 17l1-9H12z"/></svg></div><span class="partner-name">HTML & CSS</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="#339933" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-15h-2v5H7v2h2v5h2v-5h2V9h-2V7z"/></svg></div><span class="partner-name">Node.js</span></div>
          </div>
          <div class="marquee-content">
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="#4FC08D" d="M12 20.5L3 5h4l5 8.5 5-8.5h4z"/></svg></div><span class="partner-name">Vue.js</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="#61DAFB" stroke-width="2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="2" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="2" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="2" transform="rotate(150 12 12)"/></svg></div><span class="partner-name">React</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#F7DF1E"/><path d="M11.75 14.71c-.34-.23-.62-.39-1.07-.39-.62 0-1.03.45-1.03 1.05 0 1.34 2.82 1.15 2.82 3.4 0 1.32-1.01 2.22-2.46 2.22-1.46 0-2.31-.76-2.73-1.44l1.24-.78c.31.54.79.9 1.48.9.71 0 1.06-.41 1.06-1.03 0-1.41-2.82-1.15-2.82-3.38 0-1.3.99-2.14 2.39-2.14 1.25 0 2.04.58 2.44 1.2l-1.32.74zm6.18 4.28h-1.63V10.2h1.63v8.79zm-1.63-9.91h1.63V7.55h-1.63v1.53z" fill="#000"/></svg></div><span class="partner-name">JavaScript</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#3178C6"/><path fill="#FFF" d="M13.5 16h-2v-4.5H9v-2h6.5v2h-2z"/></svg></div><span class="partner-name">TypeScript</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="#E34F26" d="M4 3l1.5 17 6.5 2 6.5-2L20 3z"/><path fill="#FFF" d="M12 8h4.5l-.5-2H7.5l.5 5h8.5l-.5 4.5-4 1-4-1-.25-2.5H6L6.5 17l5.5 1.5L17.5 17l1-9H12z"/></svg></div><span class="partner-name">HTML & CSS</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="#339933" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-15h-2v5H7v2h2v5h2v-5h2V9h-2V7z"/></svg></div><span class="partner-name">Node.js</span></div>
          </div>
        </div>
        <!-- 第二行：业务范围 (反向滚动) -->
        <div class="marquee-row reverse">
          <div class="marquee-content">
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#2563EB" stroke-width="1.5"/><path fill="none" stroke="#2563EB" stroke-width="1.5" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path fill="none" stroke="#2563EB" stroke-width="1.5" d="M2 12h20"/></svg></div><span class="partner-name">官网建设</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div><span class="partner-name">后台管理系统</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" fill="none" stroke="#D97706" stroke-width="1.5"/><path fill="none" stroke="#D97706" stroke-width="1.5" d="M12 18h.01"/></svg></div><span class="partner-name">H5 活动页</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div><span class="partner-name">小程序开发</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="#2BA245"/><path d="M8 8v5a4 4 0 0 0 8 0V8" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/></svg></div><span class="partner-name">uni-app</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#007DFF"/><circle cx="12" cy="12" r="3" fill="#FFF"/></svg></div><span class="partner-name">HarmonyOS</span></div>
          </div>
          <div class="marquee-content">
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#2563EB" stroke-width="1.5"/><path fill="none" stroke="#2563EB" stroke-width="1.5" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path fill="none" stroke="#2563EB" stroke-width="1.5" d="M2 12h20"/></svg></div><span class="partner-name">官网建设</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div><span class="partner-name">后台管理系统</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" fill="none" stroke="#D97706" stroke-width="1.5"/><path fill="none" stroke="#D97706" stroke-width="1.5" d="M12 18h.01"/></svg></div><span class="partner-name">H5 活动页</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div><span class="partner-name">小程序开发</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="#2BA245"/><path d="M8 8v5a4 4 0 0 0 8 0V8" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/></svg></div><span class="partner-name">uni-app</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#007DFF"/><circle cx="12" cy="12" r="3" fill="#FFF"/></svg></div><span class="partner-name">HarmonyOS</span></div>
          </div>
        </div>
        <!-- 第三行：进阶与服务 (向左滚动) -->
        <div class="marquee-row fast">
          <div class="marquee-content">
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#14B8A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div><span class="partner-name">接业务</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><span class="partner-name">Three.js / WebGL</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="#8B5CF6" stroke-width="2"/><text x="12" y="16.5" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#8B5CF6">AR</text></svg></div><span class="partner-name">AR / 3D 展示</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="#EC4899" stroke-width="2"/><text x="12" y="16.5" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#EC4899">AI</text></svg></div><span class="partner-name">AI 应用前端</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="none" stroke="#EF4444" stroke-width="1.5" d="M8 2v4M16 2v4M22 13h-4M6 13H2M20 18l-4-2M8 16l-4 2M20 8l-4 2M8 10L4 8"/><rect x="7" y="6" width="10" height="16" rx="5" fill="none" stroke="#EF4444" stroke-width="1.5"/></svg></div><span class="partner-name">疑难 Bug 修复</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="none" stroke="#F59E0B" stroke-width="1.5" d="M3.34 17a10 10 0 1 1 17.32 0M12 15l3.5-3.5"/></svg></div><span class="partner-name">性能优化</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="none" stroke="#6366F1" stroke-width="1.5" d="M16 18l6-6-6-6M8 6l-6 6 6 6M12 22v-3.5M12 5.5V2"/></svg></div><span class="partner-name">项目重构</span></div>
          </div>
          <div class="marquee-content">
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#14B8A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div><span class="partner-name">接业务</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><span class="partner-name">Three.js / WebGL</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="#8B5CF6" stroke-width="2"/><text x="12" y="16.5" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#8B5CF6">AR</text></svg></div><span class="partner-name">AR / 3D 展示</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="#EC4899" stroke-width="2"/><text x="12" y="16.5" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#EC4899">AI</text></svg></div><span class="partner-name">AI 应用前端</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="none" stroke="#EF4444" stroke-width="1.5" d="M8 2v4M16 2v4M22 13h-4M6 13H2M20 18l-4-2M8 16l-4 2M20 8l-4 2M8 10L4 8"/><rect x="7" y="6" width="10" height="16" rx="5" fill="none" stroke="#EF4444" stroke-width="1.5"/></svg></div><span class="partner-name">疑难 Bug 修复</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="none" stroke="#F59E0B" stroke-width="1.5" d="M3.34 17a10 10 0 1 1 17.32 0M12 15l3.5-3.5"/></svg></div><span class="partner-name">性能优化</span></div>
            <div class="partner-badge"><div class="partner-icon"><svg viewBox="0 0 24 24"><path fill="none" stroke="#6366F1" stroke-width="1.5" d="M16 18l6-6-6-6M8 6l-6 6 6 6M12 22v-3.5M12 5.5V2"/></svg></div><span class="partner-name">项目重构</span></div>
          </div>
        </div>
      </div>
  - title: 青年成功之道
    details: 真正的成功不在于你得到了什么，而是在于你成为了什么样的人。<br>不求尽胜，但拒久败。<br>步履虽缓，志不可停。
  - title: 效率工具箱 <a href="/nav/index" class="title-view-all">查看全部</a>
    details: |
      <div id="gravity-tags-mount" style="min-height: 300px;"></div>
  - title: 推荐文章 <a href="/column/home/" class="title-view-all">查看全部</a>
    details: |
      <div class="article-list dynamic-article-list">
        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">Vue 3 + Naive UI 企业级后台系统实战解析</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>本文将从零开始搭建一个基于 Vue 3 和 Naive UI 的企业级中后台管理系统，包含完整的角色权限管理、动态路由路由及通用业务组件封装。</p>
              <a href="/column/Vue/Vue 3 + Naive UI 企业级后台管理系统完整解析.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>
        
        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">Vue 3 + Socket.io 实时聊天项目完整开发</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>深入解析 WebSocket 原理，并结合 Vue 3 与 Socket.io 实现一个支持私聊、群聊、消息漫游的高性能实时聊天应用。</p>
              <a href="/column/Vue/Vue 3 + Socket.io 实时聊天项目完整开发文档.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>

        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">Cursor MCP 协议与 Magic AI 自动化建站</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>详细介绍如何利用 Cursor 强大的 MCP 协议，结合 Magic AI 平台实现从需求输入到代码生成的全链路自动化建站方案。</p>
              <a href="/column/AI/AI系列——01、用cursor接入mcp协议并体验Magic生成AI网站.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>

        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">Vista AI 接入大模型玩法与进阶指南</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>全面体验 Vista AI 的核心能力，手把手教你如何低代码接入各类主流大语言模型，并打造专属你的个性化 AI 助手。</p>
              <a href="/column/AI/AI系列——03、Vista AI 情景模拟类游戏开发指南.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>

        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">HarmonyOS 4.0 系列：安装与构建页面</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>作为鸿蒙原生开发的入门指南，本文将带你熟悉 DevEco Studio 环境配置、ArkTS 基础语法以及首个页面的构建与多端预览。</p>
              <a href="/column/harmony-os-4.0-series/HarmonyOS4.0系列——01、下载、安装、配置环境、搭建页面以及运行示例代码.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>

        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">LowCode Form Builder 低代码表单构建器</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>解析低代码表单引擎的核心架构设计，分享如何实现拖拽式表单生成、JSON Schema 解析及复杂的表单联动逻辑。</p>
              <a href="/column/web/lowcode-form-builder.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>

        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">从零开始：HTML5 拼图小游戏及 Canvas 实战</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>趣味实战篇！带你利用 HTML5 的 Canvas API，实现一个包含图片切割、拖拽交互及步数统计的完整拼图小游戏。</p>
              <a href="/column/Games/从零开始打造HTML5拼图游戏：一个Canvas实战项目.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>

        <div class="article-accordion">
          <div class="article-summary">
            <span class="article-title">Three.js 视觉实验室：搭建你的 3D 世界</span>
            <svg class="article-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <div class="article-content-wrapper">
            <div class="article-content">
              <p>初探 WebGL 的奇妙世界。本文将带你了解 Three.js 的核心三要素（场景、相机、渲染器），快速构建属于你的第一个 3D 渲染画面。</p>
              <a href="/column/ThreeJS/three01场景搭建.html" class="article-read-more">阅读全文 →</a>
            </div>
          </div>
        </div>
      </div>
  - title: 精选项目案例 <span class="title-arrow">→</span>
    details: |
      <div class="floating-gallery">
        <div tabindex="0" class="float-item p1">
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800" />
          <div class="float-overlay">
            <span>人像摄影合集</span>
            <small>Web 3D 画廊展示</small>
            <a href="/column/ThreeJS/three01场景搭建.html" class="float-btn">点击访问项目 →</a>
          </div>
        </div>
        <div tabindex="0" class="float-item p2">
          <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&h=400" />
          <div class="float-overlay">
            <span>色彩美学</span>
            <small>视觉交互设计</small>
            <a href="/column/Vue/Vue 3 + Naive UI 企业级后台管理系统完整解析.html" class="float-btn">点击访问项目 →</a>
          </div>
        </div>
        <div tabindex="0" class="float-item p3">
          <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&h=600" />
          <div class="float-overlay">
            <span>餐饮小程序</span>
            <small>O2O 商业闭环</small>
            <a href="/column/Vue/Vue 3 + Socket.io 实时聊天项目完整开发文档.html" class="float-btn">点击访问项目 →</a>
          </div>
        </div>
        <div tabindex="0" class="float-item p4">
          <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&h=400" />
          <div class="float-overlay">
            <span>电商系统重构</span>
            <small>高并发架构优化</small>
            <a href="/column/AI/Atlas.html" class="float-btn">点击访问项目 →</a>
          </div>
        </div>
        <div tabindex="0" class="float-item p5">
          <img src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&h=600" />
          <div class="float-overlay">
            <span>鲜花订阅</span>
            <small>微信生态闭环</small>
            <a href="/column/AI/VistaAI.html" class="float-btn">点击访问项目 →</a>
          </div>
        </div>
      </div>
      <span class="card-desc">点击相框即可跳转对应实战项目。涵盖从 0 到 1 的全链路落地经验与企业级架构设计思考。</span>
---



<Contribute />
<Confetti />

<!-- 纯 CSS 二维码全局弹窗 (放在最外层解决 z-index 和覆盖层被卡片遮挡的问题) -->
<input type="checkbox" id="qr-modal-toggle" class="qr-modal-toggle" style="display:none;">
<div class="qr-modal">
  <label for="qr-modal-toggle" class="qr-modal-backdrop"></label>
  <div class="qr-modal-content">
    <img src="/code.png" alt="微信二维码大图" />
    <label for="qr-modal-toggle" class="qr-modal-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </label>
  </div>
</div>

<style>
/*爱的魔力转圈圈*/
@media screen and (max-width: 768px) {
.m-home-layout{
   .VPHome{
        padding-bottom: 0 !important;
    }
}
}
</style>

<ClientOnly>
  <Teleport to="#gravity-tags-mount" v-if="isMounted">
    <GravityTags />
  </Teleport>
</ClientOnly>

<script setup>
import { ref, onMounted } from 'vue'

const isMounted = ref(false)

onMounted(() => {
  // 延迟挂载，确保 VitePress 的 v-html 已经把 #gravity-tags-mount 渲染到 DOM 中
  setTimeout(() => {
    if (document.getElementById('gravity-tags-mount')) {
      isMounted.value = true
    }
  }, 100)
})
</script>
