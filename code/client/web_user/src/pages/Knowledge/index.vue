<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb></Breadcrumb>
    </div>
    <div
      
      class="container_main"
    >
      <div class="container_box">
        <div class="addKnowledge">
          <a-button><IconFonts icon="icon-add" />新增知识库</a-button>
        </div>
         <a-tabs tab-position="left" prevClick={callback} nextClick={callback} v-model:activeKey="activeKey">
           
            <a-tab-pane v-for="(item,index) in listData" :key="index">
              <template #tab="tab">
                <div class="knowledgeTab">
                  <div class="knowledgeTab_title">
                    <div class="knowledgeTab_title_icon" :style="'background-color:' + (item.color || '50C14D')">
                      <IconFonts icon="icon-tushuzhishiku" />
                    </div>
                    <h4 class="title">{{item.title}}</h4>
                  </div>
                  <div class="knowledgeTab_description">
                    描述文字描述文字描述文字描述文字内容描 述文字内容
                  </div>
                </div>
              </template>

              <tableForm :columns="formColumns" :model="formState(formColumns)" @change="onFormListChange" ref="form1"></tableForm>
              <ResizableTable size="dafault" ref="tableRef" :columns="columns" :data-source="tableData">
                <template #action="action">
                  <a>Delete</a>
                </template>
              </ResizableTable>
            </a-tab-pane>
        </a-tabs>

      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent,reactive,toRefs } from 'vue'
import {columns,formColumns} from './columns'


export default defineComponent({
  name:'知识库',
  setup() {
    const state = reactive({
      activeKey:0,
      columns,formColumns,
      listData:[
        {
          title:'M1知识库',
          color:'#50C14D',
          describe:'描述文字描述文字描述文字描述文字内容描 述文字内容'
        },
        {
          title:'M2知识库',
          color:'#5093E1',
          describe:'描述文字描述文字描述文字描述文字内容描 述文字内容'
        },
        {
          title:'M3知识库',
          color:'#B74B75',
          describe:'描述文字描述文字描述文字描述文字内容描 述文字内容'
        }
      ]
    }) 
    const formState = (data) => {
      let stateData = {}
      if(data.formList){
        data.formList.forEach(item => {
          item.fieldName && (stateData[item.fieldName] = (item.defaultValue ? item.defaultValue : ''))
        })
      }
      return stateData
    }
    const callback = (val) => {
      console.log(val)
    }
    return {
      ...toRefs(state),
      formState,
      callback
    }
  }
})
</script>
<style lang="scss">
.container_box{
  .ant-tabs-nav{
    background: #F7F7F9;
    margin-top:64px;
    .ant-tabs-tab-active{
      background:#fff;
    }
  }
  .ant-tabs .ant-tabs-left-bar .ant-tabs-ink-bar{
    display: none !important;
  }
  .ant-tabs .ant-tabs-left-bar .ant-tabs-tab{
    padding:0;
    width: 260px;
    margin:0;
    border-bottom: 1px rgba(60, 60, 60, 0.10196078431372549) solid;
    padding:10px;
  }
  .addKnowledge{
    position:absolute;
    height: 64px;
    width: 260px;
    z-index: 999999;
    text-align: center;
    .ant-btn{
      width: 232px;
      height: 32px;
      background: #FFFFFF;
      border:1px dashed #4674DF;
      opacity: 1;
      border-radius: 3px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin:10px auto 0  auto;
    }
    .teamlinker-icon{
      width: 16px;
      height: 16px;
      line-height: 15px;
      svg{
        fill: #4674DF;
        width: 16px;
        height: 16px;
      }
    }
  }
  .knowledgeTab{
    width: 240px;
    font-family: Source Han Sans SC;
    &_title{
      display: flex;
      align-items: center;
      &_icon{
        height: 32px;
        width: 32px;
        border-radius: 6px;
        background: #50C14D;
        text-align: center;
        padding:4px;
        .teamlinker-icon{
          margin:0;
        }
      }
      .title{
        font-size: 16px;
        font-weight: 540;
        color: #3C3C3C;
        margin-left: 10px;
      }
    }
    &_description{
      color: #00000073;
      font-size: 14px;
      line-height: 1.5715;
      outline: none;
      white-space:normal;
      text-align: left;
      margin-top: 9px;
    }
  }
}

</style>
<route lang="yaml">
  meta:
    level: 1
    name: '知识问答库'
    icon: 'icon-wenda'
    layout: auth
</route>