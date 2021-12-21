<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb></Breadcrumb>
    </div>
    <div
      
      class="container_main"
    >
      <div class="container_box">
        <div class="chat-main">
          <div class="chat_left">

            <div class="chat-item">
              <div class="chat-item-info">
                <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                <div class="chat-content" @mouseover="chatMouseover" @mouseleave="chatMouseleave">
                  <p>你好，我们这边是广发银行代表，您这边上个月消费人八千六百多元，已经逾期16天了，请 您中午11点处理进来。</p>
                </div>
              </div>
            </div>

            <div class="chat-item">
              <div class="chat-item-info chat-right">
                <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                <div class="chat-content" @mouseover="chatMouseover" @mouseleave="chatMouseleave">
                  <p>我上午来不及，没时间。</p>
                </div>
              </div>
            </div>

          </div>
          <div class="chat_right">

            <a-textarea auto-size placeholder="请输入测试用户话术……" v-model:value="message" />

            <a-button block @click="seedMessage">确定</a-button>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent,toRefs,reactive } from 'vue'

export default defineComponent({
  name:'话术推荐',

  setup() {
    const state = reactive({
      message:'',
    })
    const chatMouseover = () => {
      console.log('chatMouseover')
    }
    const chatMouseleave = () => {
      console.log('chatMouseleave')
    }
    const seedMessage = () => {
      state.message && alert(state.message)
    }
    
    return {
      ...toRefs(state),
      chatMouseover,
      chatMouseleave,
      seedMessage
    }
  }
})
</script>
<style lang="scss" scoped>
.chat-main{
  height: 100%;
  .chat_left,.chat_right{
    height: 100%;
  }
  .chat_left{
    float:left;
    width: calc(100% - 400px);
    overflow-y:auto;
    .chat-item{
      padding:5px 10px;
      
      &-info{
        display:flex;
        justify-content:flex-start;
        .ant-avatar{
          user-select: none;
        }
      }
      .chat-right{
        flex-direction: row-reverse;
      }
      .chat-content{
        position: relative;
        display: inline-block;
        max-width: 80%;
        padding: 12px;
        border-radius: 5px;
        background: #F4F7FF;
        word-wrap: break-word;
        word-break: break-all;
        color: #3C3C3C;
      }
      .chat-right .chat-content{
        background: #FFF9ED;
        text-align: left;
      }
    }
  }
  .chat_right{
    width: 400px;
    float:right;
    position: relative;
    background: #F9F9F9;
    textarea{
      height: calc(100% - 40px) !important;
      border: 1px solid #ECECEC;
      border-bottom: 0;
      background: #F9F9F9;
    }
    button{
      height: 40px;
    }
  }
}
</style>
<route lang="yaml">
  meta:
    level: 1
    name: '话术推荐'
    icon: 'DashboardOutlined'
    layout: auth
</route>