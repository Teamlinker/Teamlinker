<template>
    <div class="header-container">
        <div class="menus-container"> 
            <div class="logo"><img src="~@/assets/img/logo.png" alt=""></div>
            </div>
        <div class="right-container">
            <div class="space-item search">
                <div class="search-main">
                    <Icon :icon="SearchOutlinedIcon" :style="{color:'#3C3C3C',fontSize:'20px'}" @click="handlerSearch" />
                    <div :class="searchInputClass">
                        <a-auto-complete
                            v-model:value="value"
                            :options="options"
                            style="width: 200px"
                            placeholder="站内搜索"
                            :filter-option="filterOption"
                        />
                    </div>
                    
                </div>
            </div>       
            <div class="space-item user">
                <a-dropdown>
                    <div @click.prevent class="ant-dropdown-trigger">
                        <a-avatar size="small" alt="avatar" class="avatar" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
                        <span class="anticon">{{userInfo.username}}</span>
                    </div>
                    <template #overlay>
                        <a-menu class="menu" @click="onMenu">
                            <a-menu-item key="logout">
                                <Icon :icon="LogoutOutlinedIcon" />退出登录
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent, reactive, toRefs } from 'vue'
import { useStore } from '@/store'
import { Icon } from './ICON.ts'
import { message } from 'ant-design-vue'
export default defineComponent({
    components:{
        Icon
    },
    emits: ['changeCompletely'],
    setup(props,context) {
        let store = useStore()
        
        const filterOption = (input, option) => {
            return option.value.toUpperCase().indexOf(input.toUpperCase()) >= 0;
        };
        const userInfo = sessionStorage.getItem('userInfo')? JSON.parse(sessionStorage.getItem('userInfo')) : null
        // 搜搜
        const handleronSearch = (searchValue) => {
            console.log('onSearch',searchValue)
        }
        // 显示隐藏搜索框事件
        const handlerSearch = () => {
            state.inputSearch = !state.inputSearch
            if(state.searchInputClass == "search-input"){
                state.searchInputClass = "search-input search-input-show"
            }else{
                state.searchInputClass = "search-input"
            }
        }
        const handlerCompletely = () => {
            state.MenuFoldlinedIcon = (state.MenuFoldlinedIcon == 'MenuFoldOutlined' ? 'MenuUnfoldOutlined' : 'MenuUnfoldOutlined')
            context.emit('changeCompletely',null)
        }
        const state = reactive({
            SearchOutlinedIcon:'SearchOutlined',
            BellOutlinedIcon:'BellOutlined',
            LogoutOutlinedIcon:'LogoutOutlined',
            FullscreenOutlinedIcon:'FullscreenOutlined',
            value:'',
            options:[{ value: '搜索示例1' },
                    { value: '搜索示例2' },
                    { value: '搜索示例3' }],
            filterOption:filterOption,
            searchInputClass:'search-input',
            inputSearch:'',
            handlerCompletely:handlerCompletely,
            handlerSearch:handlerSearch,
            routeMmatched:[]
        })
       

        const onMenu = async (item) => {
            if(item.key == "logout"){
                message.destroy()
                const { code, message: msg } = await store.dispatch('user/logout')
                
                if (code == 0) {
                    console.log('登出成功')
                    
                }else{
                    message.info(msg || '登出失败')
                }
            }
        }
        
        return {
            ...toRefs(state),
            userInfo,
            store,
            props,
            onMenu
        }
    }
})
</script>