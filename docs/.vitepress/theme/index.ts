/*
 * @Description: 
 * @Autor: Southern Wind
 * @Date: 2024-01-10 13:16:40
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-03-04 19:17:47
 */
import { h, watch } from 'vue'
import DefaultTheme from "vitepress/theme";
import "element-plus/dist/index.css";
import { useData,EnhanceAppContext } from 'vitepress'
import ElementPlus from 'element-plus'


import MLayout from '../../nav/components/MLayout.vue'
import Home from '../../column/home/home.vue'
import Map from '../../column/map/map.vue'
import Contribute from '../components/Contribute/Contribute.vue'
import NightLight from '../../column/home/NightLight.vue'


import MNavLinks from '../../nav/components/MNavLinks.vue'

import './custom.css';
// 图标并进行全局注册
export default {
  Layout: () => {
    const props: Record<string, any> = {}
    // 获取 frontmatter
    const { frontmatter } = useData()
    console.log(frontmatter);
    
    /* 添加自定义 class */
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }

    return h(MLayout, props)
  },
  
  enhanceApp({app,router}:EnhanceAppContext) {
    app.component('MNavLinks', MNavLinks)
    app.component('Home', Home)
    app.component('Contribute', Contribute)
    app.component('NightLight', NightLight)
    app.component('Map', Map)
   // 全局注册基础组件
   app.use(ElementPlus)
  }
};

// import { h, App } from 'vue'
// import { useData } from 'vitepress'
// import Theme from 'vitepress/theme'
// // import "element-plus/dist/index.css";
// import './custom.css';
// export default Object.assign({}, Theme, {
//   Layout: () => {
//     const props: Record<string, any> = {}
//     // 获取 frontmatter
//     const { frontmatter } = useData()

//     /* 添加自定义 class */
//     if (frontmatter.value?.layoutClass) {
//       props.class = frontmatter.value.layoutClass
//     }

//     return h(Theme.Layout, props)
//   },
  

// })
