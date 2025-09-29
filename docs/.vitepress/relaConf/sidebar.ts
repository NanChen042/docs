import { DefaultTheme } from 'vitepress';
export const sidebar: DefaultTheme.Sidebar = {
  // /column/Algothm/表示对这个文件夹下的所有md文件做侧边栏配置
  '/column/AI': [
    // 第一部分
    {
      collapsed: true,
      text: 'AI 系列',
      items: [
        {
          text: 'AI系列——01、用cursor接入mcp协议并体验Magic生成AI网站',
          link: '/column/AI/AI系列——01、用cursor接入mcp协议并体验Magic生成AI网站.md'
        },
        {
          text: 'AI系列——02、探索AI的无限可能，体验智能对话的未来，大模型 API 演示',
          link: '/column/AI/AI系列——02、探索AI的无限可能，体验智能对话的未来，大模型 API 演示.md'
        },
        {
          text: 'AI系列——03、Vista AI 情景模拟类游戏开发指南',
          link: '/column/AI/AI系列——03、Vista AI 情景模拟类游戏开发指南.md'
        },
        {
          text: 'AI系列——04、AIVista Image Studio 是怎么做出来的：用 AI 画画的工具台背后的小故事',
          link: '/column/AI/Kolors_AI_Studio.md'
        },
        {
          text: 'AI系列——05、AI提示词优化功能指南',
          link: '/column/AI/prompt-optimization-guide.md'
        },
        {
          text: 'AI系列——06、AI联网搜索增强功能使用指南',
          link: '/column/AI/web-search-enhancement-guide.md'
        },


      ]
    },
    {
      collapsed: true,
      text: 'Vista AI',
      items: [
        {
          text: 'Vista平台 接入 智能体API 演示',
          link: '/column/AI/VistaAI.md'
        }
      ]
    }
  ],
  '/column/harmony-os-4.0-series': [
    // 第一部分
    {
      collapsed: true,
      text: 'HarmonyOS4.0',
      items: [
        {
          text: '1.下载、安装、配置环境、搭建页面',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——01、下载、安装、配置环境、搭建页面以及运行示例代码.md'
        },
        {
          text: '02、汉化插件、声明式开发范式ArkTS和类web开发范式',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——02、汉化插件、声明式开发范式ArkTS和类web开发范式'
        },
        {
          text: '03、声明式UI、链式编程、事件方法、以及自定义组件简单案例',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——03、声明式UI、链式编程、事件方法、以及自定义组件简单案例'
        },
        {
          text: '04、@Styles、@Extend、@Extend事件以及多态样式stateStyles',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——04、@Styles、@Extend、@Extend事件以及多态样式stateStyles'
        },
        {
          text: '05、状态管理之@Prop、@Link、@Provide、@Consume，以及@Watch装饰器',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——05、状态管理之@Prop、@Link、@Provide、@Consume，以及@Watch装饰器'
        },
        {
          text: '06、渲染之条件渲染、循环渲染以及懒加载渲染',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——06、渲染之条件渲染、循环渲染以及懒加载渲染.md'
        },
        {
          text: '07、自定义组件的生命周期、路由跳转以及传参',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——07、自定义生命周期、路由跳转及传参.md'
        },
        {
          text: '08、整合UI常用组件',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0系列——08、UI组件.md'
        },

      ]
    },
    {
      collapsed: true,
      text: 'HarmonyOS4.0案例',
      items: [
        {
          text: '简易版todoList',
          link: '/column/harmony-os-4.0-series/HarmonyOS4.0——案例一、简易版todoList.md'
        }
      ]
    }
  ],
  '/column/ThreeJS': [
    {
      text: 'ThreeJS',
      items: [
        {
          text: 'Three.js——一、初识Three以及基础的前端场景搭建(结尾含源码)',
          link: '/column/ThreeJS/three01场景搭建.md'
        },
        {
          text: 'Three——二、加强对三维空间的认识',
          link: '/column/ThreeJS/three02.md'
        },
        {
          text: 'Three——三、动画执行、画布大小、渲染帧率和相机适配体验',
          link: '/column/ThreeJS/three03.md'
        },
        {
          text: 'Three——四、几何体、高光网络材质、锯齿模糊以及GUI库的使用',
          link: '/column/ThreeJS/three04.md'
        },
        {
          text: 'Threejs——五、点线模型对象、三角形概念、几何体顶点位置，顶点索引、法线以及对几何体进行旋转缩放和平移',
          link: '/column/ThreeJS/three05.md'
        },
        {
          text: 'Three.js——六、模型对象/材质',
          link: '/column/ThreeJS/three06.md'
        },
        {
          text: 'Three.js——七、Group层级模型',
          link: '/column/ThreeJS/three07.md'
        },
        {
          text: 'Three.js——八、坐标、更改模型原点、移除、显示隐藏模型对象', link: '/column/ThreeJS/three08.md'
        },
        {
          text: 'Three.js——九、纹理贴图、纹理对象阵列、地面网格辅助观察、UV坐标以及动画',
          link: '/column/ThreeJS/three09.md'
        },
        {
          text: 'Threejs——十、关于 gltf 模型的介绍、引入方法以及设置属性添加功能（结尾附代码）',
          link: '/column/ThreeJS/three10.md'
        },
        {
          text: 'Three.js——十一、PBR材质金属度、粗糙度以及环境贴图的使用',
          link: '/column/ThreeJS/three11.md'
        },
        {
          text: 'Three.js——十二、MeshPhysicalMaterial清漆层、粗糙度、物理材质透光率以及折射率（结尾附代码）',
          link: '/column/ThreeJS/three12.md'
        },
        {
          text: 'Three.js——十三、自定义大小画布、UI交互按钮以及3D场景交互、渲染画布为文件（图片）',
          link: '/column/ThreeJS/three13.md'
        },
        {
          text: 'Threejs——十四、关于深度冲突、重叠、以及加载模型进度条效果实现（附完整代码）',
          link: '/column/ThreeJS/three14.md'
        },
        {
          text: 'Three.js——十五、Box3、相机动画、lookAt()视线方向、管道漫游案例、OrbitControls旋转缩放限制、以及相机控件MapControls',
          link: '/column/ThreeJS/three15.md'
        },
        {
          text: 'three模型Glb压缩教程',
          link: '/column/ThreeJS/three模型Glb压缩教程.md'
        },
      ],

    }
  ]
};
