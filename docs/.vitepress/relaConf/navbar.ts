/*
 * @Description: 
 * @Autor: Southern Wind
 * @Date: 2024-01-10 11:29:56
 * @LastEditors: Southern Wind
 * @LastEditTime: 2024-01-18 13:02:22
 */
import { DefaultTheme } from 'vitepress';
export const nav: DefaultTheme.NavItem[] = [
  {
    text: '首页',
    link: '/' // 表示docs/index.md
  },
  {
    text: '地图',
    link:'/column/maps/'
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
      }
    ]
  },
  {
    text: '相关技术文章',
    items: [
      {
        text: '👶 HarmonyOS 4.0',
        link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——01、下载、安装、配置环境、搭建页面以及运行示例代码.md', // 表示docs/column/Travel/index.md
       /*  target: '_blank', */
        /* rel: 'sponsored' */
      },
      {
        text: '💦 Threejs',
        link: '/column/ThreeJS/three01场景搭建.md', // 表示docs/column/Travel/index.md
       /*  target: '_blank', */
        /* rel: 'sponsored' */
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
