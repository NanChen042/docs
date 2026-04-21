import { DefaultTheme } from 'vitepress';
export const nav: DefaultTheme.NavItem[] = [
  {
    text: '<span class="nav-vp-tooltip" data-title="探索 AIVista 智能体"><i class="iconfont icon-zhinengti nav-aivista-icon"></i> AIVista</span>',
    link: 'https://nanchen042.github.io/magicforge/'
  },
  {
    text: '<span class="nav-vp-tooltip" data-title="访问 DeepSeek 专栏"><i class="iconfont icon-deepseek1 nav-deepseek-icon"></i> DeepSeek</span>',
    link: 'https://nanchen042.github.io/deepseek/'
  },
  {
    text: '<span class="nav-vp-tooltip" data-title="体验 Atilas 工具"><i class="iconfont icon-naozhong nav-atilas-icon"></i> Atilas</span>',
    link: 'https://nanchen042.github.io/atlas/'
  },
  {
    text: '首页',
    link: '/' // 表示docs/index.md
  },
  {
    text: '个人历程',
    items: [
      {
        text: '🤯 沪上漂泊记',
        link: '/column/Travel/' // 表示docs/column/Travel/index.md
      },
      {
        text: '所思·所想',
        link: '/column/Growing/' // 表示docs/column/Growing/index.md
      },
      // {
      //   text: '❤致陈佳欣的一封信',
      //   link: '/column/cjx/'
      // }
    ]
  },
  {
    text: '相关技术文章',
    items: [
      {
        text: '后端专栏',
        link: '/column/NodeJS/'
      },
      {
        text: 'Vue3 系列',
        link: '/column/Vue/Vue 3 + Naive UI 企业级后台管理系统完整解析.md'
      },
      {
        text: 'AI Agent',
        link: '/column/AI/AI Skill Server 动态技能中台 - 完整技术文档.md'
      },
      {
        text: 'DeepSeek',
        link: '/column/deepseek/deepseek.md',
      },
      {
        text: 'HarmonyOS 4.0',
        link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——01、下载、安装、配置环境、搭建页面以及运行示例代码.md', // 表示docs/column/Travel/index.md
        /*  target: '_blank', */
        /* rel: 'sponsored' */
      },
      {
        text: 'Threejs',
        link: '/column/ThreeJS/three01场景搭建.md', // 表示docs/column/Travel/index.md
        /*  target: '_blank', */
        /* rel: 'sponsored' */
      },
      {
        text: 'Games',
        link: '/column/Games/从零开始打造HTML5拼图游戏：一个Canvas实战项目.md',
      },
      {
        text: 'Lottie 动画实战',
        link: '/column/map/map.md'
      }
    ]
  },
  {
    text: '全栈实战',
    items: [
      {
        text: 'NaiveUI 企业级中后台',
        link: 'https://nanchen042.github.io/naiveui_admin'
      },
      {
        text: 'Vue3 个人博客主页',
        link: 'https://nanchen042.github.io/vue3-blog/#/'
      }
    ]
  },
  {
    text: '关于我',
    items: [
      { text: 'Github', link: 'https://github.com/NanChen042' },
      {
        text: '掘金',
        link: 'https://juejin.cn/user/1588130256005415'
      },
      {
        text: 'CSDN',
        link: 'https://blog.csdn.net/nanchen_J?type=blog'
      },
      {
        text: '51博客',
        link: 'https://blog.51cto.com/u_15947040'
      }
    ]
  }
];
