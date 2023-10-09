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
import {apiGateway} from "./business/common/request/request";
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
        component: ()=>import("./business/controller/index/index.vue")
    },
    {
        name:"register",
        path:"/register",
        component: ()=>import("./business/controller/login/register.vue")
    },
    {
        name:"registerCode",
        path:"/registerCode",
        component: ()=>import("./business/controller/login/registerCode.vue"),
        props:route=>({username:route.query.username})
    },
    {
        name:"reset",
        path:"/reset",
        component: ()=>import("./business/controller/login/reset.vue")
    },
    {
        name:"resetCode",
        path:"/resetCode",
        component: ()=>import("./business/controller/login/resetCode.vue"),
        props:route=>({username:route.query.username})
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

apiGateway.deployInfo().then(async value => {
    if(value?.code==0) {
        app.config.globalProperties.$deployMode.value=value.data.type
        if(value.data.type===ECommon_Application_Mode.OFFLINE) {
            let hash=location.hash
            if(!(hash.startsWith("#/login") || hash.startsWith("#/desktop"))) {
                await router.replace("login")
            }
        }
    }
})