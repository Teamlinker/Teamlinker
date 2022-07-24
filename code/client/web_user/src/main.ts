import { createApp } from 'vue'
import App from './App.vue'
import store from './store/index'
import router from './router/index'

// 导入ant-design-vue
import Antd from 'ant-design-vue';

import 'ant-design-vue/dist/antd.css';

import moment from 'moment';
import 'moment/dist/locale/zh-cn';
moment.locale('zh-cn');

import Vue3DraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
// 全局样式
import './style/global.scss';
// 全局工具函数插件 待添加

// 权限校验插件 待添加

// SvgIcon 插件 待添加

// EResize 插件 待添加

// virtual:windi.css
import 'virtual:windi.css'
// axios封装request
import axios from './plugins/axios.js'


import formCreate from "@form-create/ant-design-vue";


const app = createApp(App);

/**
 * 
 * In SFC,you can visit axios by:
 * import { getCurrentInstance } from 'vue'
 * const { proxy } = getCurrentInstance()  
 * proxy.$axios()
 * 
 */
app.config.globalProperties.$axios = axios;
app.use(router).use(store).use(Antd).use(Vue3DraggableResizable).mount('#app')

app.use(formCreate)
