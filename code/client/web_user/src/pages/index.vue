<template>
  <div class="container_box">
    <div class="title">Your work</div>
    <div class="sub-title">Recent project</div>
    <div class="project-list">
      <div
        class="project-item"
        v-for="(item, index) in listData"
        :key="index"
      >
        <div class="pro-cont">
          <div class="pro-info">
            <div class="avatar"><UserOutlined /></div>
            <div class="pro-name">{{item.name}}</div>
          </div>
          <div class="pro-detail">
            <div>No start:{{item.notstart}}</div>
            <div>Inprogress:{{item.inprogress}}</div>
            <div>Done issues:{{item.done}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs, ref } from "vue";
import { UserOutlined } from '@ant-design/icons-vue'
import axios from "@/plugins/axios";
export default defineComponent({
  components: {
    UserOutlined
  },
  setup() {
   const state = reactive({
      listData: [],
    });
    const getRecentProject = ()=>{
      axios.get('/project/recent/list', {  }).then((res) => {
        if(res?.code == '0'){
          state.listData = res.data
        }else{
          message.info(res.message)
          
        }
      })
    }
    getRecentProject()
    return {
      ...toRefs(state),
    }

  },

  
})
</script>
<style lang="scss" scoped>
.container_box {
  padding: 30px 30px 20px;
  .title {
    color: #333;
    font-size: 18px;
    font-weight: bold;
    margin-left: 30px;
  }
  .sub-title {
    color: #333;
    font-size: 14px;
    margin-left: 30px;
  }
  .project-list {
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    .project-item {
      width: 20%;
      padding: 20px 30px;
      .pro-cont {
        border: 1px solid #D9D9D9;
        .pro-info{
          padding-left:15px;
          height:50px;
          display:flex;
          align-items:center;
          border-bottom:1px solid #C4C4C4;
          .avatar{
            font-size:16px;
            margin-right:15px;
          }
        }
      }
    }
  }
}
</style>
<route lang="yaml">
  meta:
    level: 1
    name: '首页'
    icon: 'DashboardOutlined'
    layout: auth
</route>