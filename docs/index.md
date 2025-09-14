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
      text: 开篇
      link: 'https://nanchen042.github.io/vue3-blog/#/'
    - theme: alt
      text: 个人成长
      link: /column/home/index
# 按钮下方的描述
features:
  - icon: 🤹♀️
    title: 前端开发
    details: 小厂程序猿，国内某不知名互联网厂搬砖。

  - icon: 👩🎨
    title: 学习语言
    details: HarmonyOS4.0、Typescript、JavaScript、HTML、CSS、Vue、WebGL
  - icon: 🧩
    title: 青年成功之道
    details: 真正的成功不在于你得到了什么，而是在于你成为了什么样的人。
  - icon: 🧱
    title: 好用的让你根本停不下来的工具
    details: 噢耶！这也太好用了吧！！
    link: /nav/index
---



<Contribute />
<Confetti />
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
