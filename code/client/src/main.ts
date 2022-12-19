import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import '@arco-design/web-vue/dist/arco.css';
import ArcoVue, {Message} from '@arco-design/web-vue';
import sicon from "./icon/sicon.vue"
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import {createPinia} from "pinia";
import Login from "./business/controller/login/login.vue";
import Desktop from "./business/controller/desktop/desktop.vue";
import {createRouter, createWebHashHistory} from "vue-router";

const routes=[
    {
        name:"login",
        path:"/login",
        component:Login
    },
    {
        name:"desktop",
        path:"/desktop",
        component:Desktop
    }
]
const router=createRouter({
    history:createWebHashHistory(),
    routes
});
let app=createApp(App)
Message._context=app._context
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(createPinia())
app.use(router);
app.component("sicon",sicon)
app.mount('#app')
