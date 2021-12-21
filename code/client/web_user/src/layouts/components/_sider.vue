<template>
    <div class="sider-container">
        <div class="teamlinker-scrollbar-default menu-list"> 
            <Menu :collapsed="props.collapsed" />
        </div>
    </div>
</template>
<script>

import { defineComponent, reactive,toRefs } from 'vue'

import Menu from './menu.vue'
export default defineComponent({
    components:{
        Menu
    },
    props:{
        collapsed: {
            // 侧边栏菜单是否收起
            type: Boolean,
            dafault:true
        }
    },
    setup(props) {
        const state = reactive({
            header:[],
            data:[],
            props
        })
        return { ...toRefs(state) }
    }
})
</script>