/*
 * @Description: 
 * @Autor: Southern Wind
 * @Date: 2024-01-10 11:24:34
 * @LastEditors: Southern Wind
 * @LastEditTime: 2024-01-10 13:26:13
 */
import { defineConfig } from 'vitepress'
import { nav, sidebar } from './relaConf';


// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs/',
  title: "blog-demo😶‍🌫️",

  description: "A VitePress Site",
  head: [['link', { rel: 'icon', href: '/docs/bitbug_favicon.ico' }],],
  themeConfig: {

    outline: {
      level: [2, 6],
      label: '目录'
    },

    siteTitle: 'blog-demo😶‍🌫️',
    logo: '/ceshi.jpg',
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,
    i18nRouting: true,
    sidebar: sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },

      {
        icon: {
          svg: '<svg t="1670828084087" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1923" width="32" height="32"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="1924"></path></svg>',
        },
        link: "https://gitee.com/NanChen042",
      },

    ],
    search: {
      provider: 'local',

    },

    // 站点页脚配置
    footer: {
      message: "According to the information provided by the front desk staff",
      copyright: "Copyright © 2023-present Southern Wind",
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
