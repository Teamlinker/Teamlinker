import {createApp, ref} from 'vue'
import './style.css'
import App from './App.vue'
import '@arco-design/web-vue/dist/arco.css';
import ArcoVue, {Message} from '@arco-design/web-vue';
import sicon from "./icon/sicon.vue"
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import {createPinia} from "pinia";
import {createRouter, createWebHashHistory} from "vue-router";
import "@logicflow/core/dist/style/index.css";
import {ECommon_Application_Mode} from "../../common/types";
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import 'virtual:svg-icons-register'
import i18n from "@/business/common/i18n/i18n";

const Desktop =()=>import("./business/controller/desktop/desktop.vue")
const routes=[
    {
        name:"login",
        path:"/login",
        component:()=>import("./business/controller/login/login.vue")
    },
    {
        name:"desktop",
        path:"/desktop",
        component:Desktop
    },
    {
        name:"index",
        path:"/",
        component: ()=>import("./business/controller/login/login.vue")
    }
]
const router=createRouter({
    history:createWebHashHistory(),
    routes
});
let app=createApp(App)
app.config.globalProperties.$deployMode=ref()
Message._context=app._context
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(createPinia())
app.use(router);
app.use(i18n)
app.component("sicon",sicon)
app.component("icon",FontAwesomeIcon)
app.mount('#app')

app.config.globalProperties.$deployMode.value=ECommon_Application_Mode.OFFLINE

