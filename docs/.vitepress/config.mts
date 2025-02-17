import { defineConfig } from 'vitepress'
import { nav, sidebar } from './relaConf';


// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs/',
  title: "personal-blog😶‍🌫️",

  description: "A VitePress Site",
  head: [
    ['link', { rel: 'icon', href: '/docs/bitbug_favicon.ico' }],
    // Simple Analytics script

  ],
  themeConfig: {

    outline: {
      level: [2, 6],
      label: '目录'
    },

    siteTitle: 'Personal blog😶‍🌫️',
    logo: '/ceshi.jpg',
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,
    i18nRouting: true,
    sidebar: sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NanChen042' },// { icon: 'twitter', link: 'https://twitter.com/vite_js' },
      {
        icon: {
          svg: '<svg t="1670828084087" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1923" width="32" height="32"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="1924"></path></svg>',
        },
        link: "https://gitee.com/NanChen042",
      },

      {
        icon: {
          svg: '<svg data-v-4eabc4e0="" t="1706854775585" class="icon discord" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4835" width="30px" height="30px"><path data-v-4eabc4e0="" d="M229.12 841.92c-170.88-237.76-46.4-629.12 236.16-716.8 118.4-38.08 262.72-16.96 351.36 74.24 48.64 43.2 1.28 102.4-24.96 141.76-81.92-62.4-179.2-143.04-289.92-102.08C303.36 310.4 232 593.28 338.24 764.8c128 141.44 358.08 94.08 488.64-20.48 42.88 37.12 88.96 112.32 24.64 153.92-182.4 120.96-474.24 120-622.4-56.32z" fill="#C71D23" p-id="4836"></path></svg>',
        },
        link: "https://blog.csdn.net/nanchen_J?type=blog",
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

})
