import { defineConfig } from 'vitepress'
import { nav, sidebar } from './relaConf';


// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs/',
  title: "personal-blog😶‍🌫️",

  description: "A VitePress Site",

  // 配置 markdown 选项，解决语法高亮警告
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    // 添加语言别名，解决 env 语言警告
    languages: [
      {
        id: 'env',
        scopeName: 'source.env',
        aliases: ['dotenv', 'environment'],
        path: './env.tmLanguage.json'
      }
    ]
  },

  // 配置 SSR 选项，避免浏览器 API 错误
  ssr: {
    noExternal: ['canvas-confetti']
  },


  head: [
    ['link', { rel: 'icon', href: '/docs/bitbug_favicon.ico' }],
    // Simple Analytics script
    ['script', {}, 'var _hmt = _hmt || []; (function() { var hm = document.createElement(\'script\'); hm.src = \'https://hm.baidu.com/hm.js?d595e49724ffc0b53eb895cc7a704375\'; var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(hm, s); })();']
  ],
  themeConfig: {

    outline: {
      level: [2, 6],
      label: '目录'
    },

    siteTitle: false,
    logo: '/logo2.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,
    i18nRouting: true,
    sidebar: sidebar,

    socialLinks: [
      {
        ariaLabel: 'CSDN',
        icon: {
          svg: '<svg t="1782378927902" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2695" width="30px" height="30px"><path d="M0 0h1024v1024H0z" fill="#FF6633" p-id="2696"></path><path d="M698.9824 42.3936c-158.8736-32.5632-289.536 31.2832-324.9152 48.5888-94.72 46.2848-147.712 108.288-174.4896 140.288-25.9584 31.0272-82.7392 105.9328-108.288 215.8592-21.6576 93.1328-10.752 167.7824-6.0416 194.2528 11.4688 64.3072 33.28 186.88 150.4256 275.2 132.5056 99.8912 293.4784 85.5552 342.9888 80.9472 107.264-10.0352 289.4848-57.2928 300.8512-145.7152 5.1712-39.936-24.4224-89.4464-66.2016-102.5024-65.6384-20.5312-108.3392 63.5392-228.6592 80.9472-8.5504 1.2288-126.5664 16.6912-216.6272-48.5888-105.8816-76.6976-98.9696-211.3024-96.256-264.3968 1.536-30.5664 5.5808-93.5424 48.128-161.8944 14.7968-23.7568 60.3136-94.5664 156.4672-134.912 25.2928-10.5984 76.8512-31.5904 144.4352-26.9824 70.0416 4.7616 120.9856 34.5088 144.4352 48.5888 75.8272 45.4144 86.528 90.0608 120.3712 86.3232 35.8912-3.9424 69.9904-59.2896 66.2016-107.9296-7.424-93.7984-155.5968-158.1056-252.8256-178.0736z" fill="#FFFFFF" p-id="2697"></path></svg>',
        },
        link: "https://blog.csdn.net/nanchen_J?type=blog",
      },
      { ariaLabel: 'GitHub', icon: 'github', link: 'https://github.com/NanChen042' },
      {
        ariaLabel: '掘金',
        icon: {
          svg: '<svg t="1782378872179" class="icon" viewBox="0 0 1316 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1673" width="30px" height="30px"><path d="M643.181714 247.698286l154.916572-123.172572L643.181714 0.256 643.072 0l-154.660571 124.269714 154.660571 123.245715 0.109714 0.182857z m0 388.461714h0.109715l399.579428-315.245714-108.361143-87.04-291.218285 229.888h-0.146286l-0.109714 0.146285L351.817143 234.093714l-108.251429 87.04 399.433143 315.136 0.146286-0.146285z m-0.146285 215.552l0.146285-0.146286 534.893715-422.034285 108.397714 87.04-243.309714 192L643.145143 1024 10.422857 525.056 0 516.754286l108.251429-86.893715L643.035429 851.748571z" fill="#1E80FF" p-id="1674"></path></svg>'
        },
        link: 'https://juejin.cn/user/1588130256005415'
      },
      {
        ariaLabel: 'Gitee',
        icon: {
          svg: '<svg t="1670828084087" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1923" width="32" height="32"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="1924"></path></svg>',
        },
        link: "https://gitee.com/NanChen042",
      },
      {
        ariaLabel: '南辰Blog',
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="icon" width="38px" height="38px"><defs><clipPath id="circleClipLogo"><circle cx="100" cy="100" r="100"></circle></clipPath></defs><g clip-path="url(#circleClipLogo)"><g transform="translate(15, 20)"><path d="M 110,40 C 145,40 155,75 140,110 C 130,125 120,130 110,130 L 110,190 L 75,190 L 75,130 C 50,130 20,125 20,105 C 20,90 35,80 50,80 C 65,80 75,85 85,85 C 85,60 90,40 110,40 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"></path><rect x="72" y="145" width="41" height="14" rx="4" fill="#E32636" stroke="currentColor" stroke-width="4"></rect><path d="M 110,80 C 130,80 145,110 135,140 C 125,160 100,150 100,125 C 100,100 95,80 110,80 Z" fill="currentColor"></path><ellipse cx="20" cy="96" rx="9" ry="13" fill="currentColor" transform="rotate(-15 20 96)"></ellipse><path d="M 75,68 Q 80,56 85,68" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path><path d="M 40,115 Q 55,125 70,112" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></g></g></svg>'
        },
        link: 'https://vue3-blog-bt9.pages.dev/#/home'
      }
    ],
    search: {
      provider: 'local',

    },

    // 站点页脚配置
    footer: {
      message: "According to the information provided by the front desk staff",
      copyright: "Copyright © 2025-present Southern Wind",
    },
    darkModeSwitchLabel: '外观',
    returnToTopLabel: '返回顶部',
    lastUpdatedText: '上次更新',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
  },
  lastUpdated: true,

  // 添加Vite配置，设置代理解决腾讯地图API跨域问题
  vite: {
    define: {
      global: 'globalThis',
    },
    ssr: {
      noExternal: ['canvas-confetti']
    },

    build: {
      // 解决代码包体积过大警告
      chunkSizeWarningLimit: 1500,

    },
    // 开发服务器优化
    server: {
      fs: {
        // 排除大文件，提高开发服务器性能
        deny: [
          '**/assets/**/*.mp4',
          '**/assets/**/*.mp3',
          '**/assets/**/*.m4a',
          '**/assets/**/*.avi',
          '**/assets/**/*.mov'
        ]
      },
      proxy: {
        '/api/map': {
          target: 'https://apis.map.qq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/map/, '')
        }
      }
    },
    // 优化依赖预构建
    optimizeDeps: {
      exclude: ['canvas-confetti'],
      include: [
        'element-plus',
        '@element-plus/icons-vue'
      ]
    }
  }
})
