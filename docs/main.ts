import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './styles/index.css';
import App from './App.vue';
import { MainMap } from './column/map';

// 创建Vue应用
const app = createApp(App);

// 注册Element Plus
app.use(ElementPlus);

// 注册地图组件为全局组件
app.component('MainMap', MainMap);

// 挂载应用
app.mount('#app');
