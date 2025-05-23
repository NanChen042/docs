import { h, watch } from 'vue'
import DefaultTheme from "vitepress/theme";
import "element-plus/dist/index.css";
import { useData,EnhanceAppContext } from 'vitepress'
import ElementPlus from 'element-plus'
import { initCustomCursor } from './cursor'
import TlbsMap from 'tlbs-map-vue'

import MLayout from '../../nav/components/MLayout.vue'
import Home from '../../column/home/home.vue'
import Map from '../../column/map/map.vue'
import Games from '../../column/Games/Games.vue'
// import Map4 from '../../column/map/map4.vue'
import Contribute from '../components/Contribute/Contribute.vue'
import NightLight from '../../column/home/NightLight.vue'
import Confetti from '../components/Confetti/Confetti.vue'
import MNavLinks from '../../nav/components/MNavLinks.vue'

import './custom.css';
import './style/blur.css';
import './style.css';
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
    app.component('Confetti', Confetti)
    app.component('MNavLinks', MNavLinks)
    app.component('Home', Home)
    app.component('Contribute', Contribute)
    app.component('NightLight', NightLight)
    app.component('Map', Map)
    app.component('Games', Games)
    // app.component('Map4', Map4)

   // 全局注册基础组件
   app.use(ElementPlus)

   // 注册腾讯地图组件
   app.use(TlbsMap)

   if (typeof window !== 'undefined') {
     window.addEventListener('DOMContentLoaded', () => {
       initCustomCursor()
     })
   }
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
