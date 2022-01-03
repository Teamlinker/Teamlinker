<template>
    <a-menu mode="inline" theme="dark" @click="clickMenuItem" v-model:selected-keys="selectedKeys" :openKeys="openKeys">
        <div class="sider-logo">
            <a :class="props.collapsed?'sider-logo-a':'sider-logo-a sider-logo-awidth'">
                <h1 v-if="props.collapsed">系统</h1>
            </a>
        </div>
        <template v-for="item in store.state.system.adminMenus" :key="item.path">
            <menu-item :menu-info="item" />
        </template>
    </a-menu>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, watch, toRefs } from 'vue'
import routes from 'virtual:generated-pages';
import { Menu } from 'ant-design-vue'
import MenuItem from './menu-item.vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default defineComponent({
    name: 'Menu',
    components: {
        MenuItem,
        'a-sub-menu': Menu.SubMenu,
        'a-menu-item': Menu.Item
    },
    props: {
        collapsed: {
            // 侧边栏菜单是否收起
            type: Boolean,
            dafault:true
        }
    },
    setup(props) {
        // 当前路由
        const currentRoute = useRoute()
        // console.log(currentRoute.name)
        const router = useRouter()
        const store = useStore()
        // 获取当前打开的子菜单
        const getOpenKeys = () => [currentRoute.matched[1]?.name]
        // console.log(currentRoute)
        const state = reactive({
            openKeys: getOpenKeys(),
            selectedKeys: [currentRoute.name],
            props
        })
        // 点击菜单
        const clickMenuItem = ({ item, key, keyPath }) => {
            if (/http(s)?:/.test(key)) {
                window.open(key)
            }else{
                router.push({ name: key })
            }
        }
        const menus = computed(() =>
            store.getters['asyncRoute/menus'] ?? routes.find((item) => item.name == 'Layout')!.children
            
        )

        // 监听菜单收缩状态
        watch(() => props.collapsed,(newVal) => {
            state.openKeys = newVal ? [] : getOpenKeys()
            state.selectedKeys = [currentRoute.name]
        })
        // 跟随页面路由变化，切换菜单选中状态

        watch(() => currentRoute.fullPath,() => {
            if (currentRoute.name == 'login') return
            !props.collapsed && (state.openKeys = getOpenKeys())
            state.selectedKeys = [currentRoute.name]
        })
        return {
            ...toRefs(state),
            store,
            clickMenuItem,
            menus
        }
    }
})
</script>