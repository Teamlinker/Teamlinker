<template>
    <div class="header-container">
        <div class="menus-container"> 
            <div class="logo"><img src="~@/assets/img/logo.png" alt=""></div>
           
            </div>
             <div class="pj-menu">
                <a-dropdown>
                    <a class="ant-dropdown-link" @click.prevent>
                    Teams
                    <DownOutlined />
                    </a>
                    <template #overlay>
                    <a-menu>
                       
                        <span class="rec-text">Recent teams</span>
                       
                        <a-menu-item v-for="(item,key,index) in teamList"  :index="index" :key="item.id">
                        <a href="javascript:;">{{item.name}}</a>
                        </a-menu-item>
                       
                        <span class="line"></span>
                       
                        <a-menu-item @click="viewAllTeam">
                        <a href="javascript:;">View all team</a>
                        </a-menu-item>
                        <a-menu-item>
                        <a href="javascript:;">Create team</a>
                        </a-menu-item>
                    </a-menu>
                    </template>
                </a-dropdown>
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
                        <a-menu class="menu">
                            <a-menu-item key="logout"  @click="onMenu">
                                <Icon :icon="LogoutOutlinedIcon" />退出登录
                            </a-menu-item>
                             <a-menu-item key="logout"  @click="onPerPage">
                                <Icon :icon="HomeOutlined" />个人主页
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </div>
        </div>
    </div>
</template>
<style>
    .rec-text{
        padding-left: 5px;
        color: #A1A1A1;
    }
    .line{
        display: inline-block;
        width: 100%;
        height: 1px;
        background-color: #C4C4C4;
    }
</style>
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import { useStore } from '@/store'
import { Icon } from './ICON.ts'
import { message } from 'ant-design-vue'
import { DownOutlined, HomeOutlined } from '@ant-design/icons-vue';
import axios from "@/plugins/axios";
import routes from 'virtual:generated-pages';
import { useRoute, useRouter } from 'vue-router'
export default defineComponent({
    components:{
        Icon,
        DownOutlined,
        HomeOutlined
    },
    emits: ['changeCompletely'],
    setup(props,context) {
        let store = useStore()
        const router = useRouter()
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
            routeMmatched:[],
            teamList:[],
        })
       

        const onMenu = async () => {
                message.destroy()
                const { code, message: msg } = await store.dispatch('user/logout')
                
                if (code == 0) {
                    console.log('登出成功')
                    
                }else{
                    message.info(msg || '登出失败')
                }
            
        }
         const getTeamList = () => {
            const params = {
                page: 0,
                size: 10,
                keyword: "",
            };
            axios.get("/team/list", { params: params }).then((res:any) => {
               state.teamList = res.data.data;
            });
        }
        getTeamList();
        const viewAllTeam = () => {
            router.push({ name: 'team-list' })
        }
        const onPerPage = () =>{
              router.push({ name: 'personalpage-index' })
        }
        return {
            ...toRefs(state),
            userInfo,
            store,
            props,
            onMenu,
            viewAllTeam,
            onPerPage
            
        }
    }
})
</script>