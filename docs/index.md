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
    title: 前端开发——沪上漂泊记
    details: 2022：我能找到工作吗？<br>2023：我能活下来吗？<br>2024：我是不是废了？<br>2025：我要跑路<br>2026：AI是不是要干掉我？
    link: /column/Travel/index
  - icon: 👩🎨
    title: 我接触过的内容
    details: HTML、CSS、JQuery、Ts、Uniapp、Vue、WebGL、HarmonyOS <br> 踩过无数坑 <br> 折腾过新技术
  - icon: 🧩
    title: 青年成功之道
    details: 真正的成功不在于你得到了什么，而是在于你成为了什么样的人。<br>不求尽胜，但拒久败。<br>步履虽缓，志不可停。
  - icon: 🧱
    title: 好用的让你根本停不下来的工具
    details: 噢耶！这也太好用了吧！！<br>效率起飞<br>摸鱼必备<br>生产力拉满
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
