import { h, watch } from 'vue'
import DefaultTheme from "vitepress/theme";
import "../../styles/main.scss";
import "../../assets/styles/font/iconfont.css";
import "element-plus/dist/index.css";
import { useData,EnhanceAppContext } from 'vitepress'
import ElementPlus from 'element-plus'
import { initCustomCursor } from './cursor'
import { envLanguageSupport } from './env-lang'
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
import ImagePreview from '../components/ImagePreview/ImagePreview.vue'
import GravityTags from '../components/GravityTags.vue'
import './custom.css';
import './style/blur.css';
import { initHeroPopup } from './hero-popup'
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
    app.component('ImagePreview', ImagePreview)
    app.component('GravityTags', GravityTags)
    // app.component('Map4', Map4)

   // 全局注册基础组件
   app.use(ElementPlus)

   // 注册腾讯地图组件
   app.use(TlbsMap)

   if (typeof window !== 'undefined') {
     window.addEventListener('DOMContentLoaded', () => {
       initCustomCursor()
       initHeroPopup()
        // 注册环境变量文件语法高亮支持，解决 "The language 'env' is not loaded" 警告
        envLanguageSupport.register()
       })

     // 原生手风琴轮播逻辑封装
     let accordionInterval: any = null;
     
     const initAccordion = () => {
       const card = document.querySelector('.VPFeatures .item:nth-child(5)') as HTMLElement;
       const list = document.querySelector('.dynamic-article-list') as HTMLElement;
       if (!list || !card) return;

       // 1. 随机打乱并挑选前 4 个
       const items = Array.from(list.children) as HTMLElement[];
       items.sort(() => Math.random() - 0.5);
       list.innerHTML = '';
       
       const activeItems: HTMLElement[] = [];
       items.forEach((item, index) => {
         item.style.display = index < 5 ? 'block' : 'none';
         item.classList.remove('is-active'); // 初始化状态
         list.appendChild(item);
         if (index < 5) activeItems.push(item);
       });

       if (activeItems.length === 0) return;

       // 2. 默认展开第一个
       activeItems[0].classList.add('is-active');

       // 3. 点击互斥交互
       activeItems.forEach(item => {
         const summary = item.querySelector('.article-summary') as HTMLElement;
         if (summary) {
           summary.onclick = () => {
             // 如果点击当前已展开的，不做改变或者关闭？要求是手风琴，一般互斥
             if (item.classList.contains('is-active')) return; 
             activeItems.forEach(el => el.classList.remove('is-active'));
             item.classList.add('is-active');
           };
         }
       });

       // 4. 自动轮播逻辑
       let currentIndex = 0;
       const nextAccordion = () => {
         currentIndex = (currentIndex + 1) % activeItems.length;
         activeItems.forEach(el => el.classList.remove('is-active'));
         activeItems[currentIndex].classList.add('is-active');
       };

       if (accordionInterval) clearInterval(accordionInterval);
       accordionInterval = setInterval(nextAccordion, 4000); // 4秒切换一次

       // 5. 悬停暂停逻辑
       card.onmouseenter = () => {
         if (accordionInterval) clearInterval(accordionInterval);
       };
       card.onmouseleave = () => {
         // 获取当前 focus 的 index
         const curActive = activeItems.findIndex(el => el.classList.contains('is-active'));
         if (curActive !== -1) currentIndex = curActive;
         accordionInterval = setInterval(nextAccordion, 4000);
       };
     };

      router.onAfterRouteChanged = (to) => {
        setTimeout(initAccordion, 100);
      };

      // 初次加载时执行
      setTimeout(initAccordion, 300);
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
