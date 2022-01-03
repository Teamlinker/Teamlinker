<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb>
        <a-tabs v-model:activeKey="activeKey" >
          <a-tab-pane key="1" tab="话术挖掘模型"></a-tab-pane>
          <a-tab-pane key="2" tab="标签提取模型"></a-tab-pane>
          <a-tab-pane key="3" tab="客户分群模型"></a-tab-pane>
          <a-tab-pane key="4" tab="话术推荐模型"></a-tab-pane>
          <a-tab-pane key="5" tab="查找策略模型"></a-tab-pane>
          <a-tab-pane key="6" tab="最优路径模型"></a-tab-pane>
        </a-tabs>
      </Breadcrumb>
    </div>
    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '1'">
        <div class="container_box">

          <div class="flex_R mb10">
            <a-space>
              <a-button>模型训练</a-button>
            </a-space>
          </div>
          <tableForm :columns="formColumns(1)" :model="formState(labelFormColumns)" @change="onFormListChange" ref="form1"></tableForm>

          <ResizableTable size="small" ref="tableRef1" :columns="labelColumns" :data-source="tableData1">
            <template #action="{ record }">
              <a-space>
                <a-button type="link" @click="handlerInfo(record)">查看版本信息</a-button>
                <template v-if="record.state == '0'">
                  <a-button type="text" v-if="record.release == '0'">回滚</a-button>
                  <a-button type="text" v-else>发布</a-button>
                </template>
                <template v-else>
                  <a-button type="text" style="color:#3C3C3C" v-if="record.release == '1'">停止训练</a-button>
                  <a-button type="text" style="color:#50C14D" v-if="record.release == '2'">继续训练</a-button>
                </template>
                <template v-if="record.state == '0'">
                  <a-button type="text" danger v-if="record.release == '0'">导出</a-button>
                  <a-button type="text" danger v-else>删除</a-button>
                </template>
              </a-space>
            </template>
          </ResizableTable>

        </div>
      </div>
    </transition>
    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '2'">
        <div class="container_box">

          <div class="flex_R mb10">
            <a-space>
              <a-button>模型训练</a-button>
            </a-space>
          </div>

          <tableForm :columns="formColumns(2)" :model="formState(labelFormColumns)" @change="onFormListChange" ref="form2"></tableForm>

          <ResizableTable size="small" ref="tableRef2" :columns="labelColumns" :data-source="tableData2">
            <template #action="{ record }">
              <a-space>
                <a-button type="link" @click="handlerInfo(record)">查看版本信息</a-button>
                <template v-if="record.state == '0'">
                  <a-button type="text" v-if="record.release == '0'">回滚</a-button>
                  <a-button type="text" v-else>发布</a-button>
                </template>
                <template v-else>
                  <a-button type="text" style="color:#3C3C3C" v-if="record.release == '1'">停止训练</a-button>
                  <a-button type="text" style="color:#50C14D" v-if="record.release == '2'">继续训练</a-button>
                </template>
                <template v-if="record.state == '0'">
                  <a-button type="text" danger v-if="record.release == '0'">导出</a-button>
                  <a-button type="text" danger v-else>删除</a-button>
                </template>
              </a-space>
            </template>
          </ResizableTable>

        </div>
      </div>
    </transition>

    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '3'">
        <div class="container_box">

          <div class="flex_R mb10">
            <a-space>
              <a-button>模型训练</a-button>
            </a-space>
          </div>

          <tableForm :columns="formColumns(3)" :model="formState(labelFormColumns)" @change="onFormListChange" ref="form3"></tableForm>

          <ResizableTable size="small" ref="tableRef3" :columns="labelColumns" :data-source="tableData3">
            <template #action="{ record }">
              <a-space>
                <a-button type="link" @click="handlerInfo(record)">查看版本信息</a-button>
                <template v-if="record.state == '0'">
                  <a-button type="text" v-if="record.release == '0'">回滚</a-button>
                  <a-button type="text" v-else>发布</a-button>
                </template>
                <template v-else>
                  <a-button type="text" style="color:#3C3C3C" v-if="record.release == '1'">停止训练</a-button>
                  <a-button type="text" style="color:#50C14D" v-if="record.release == '2'">继续训练</a-button>
                </template>
                <template v-if="record.state == '0'">
                  <a-button type="text" danger v-if="record.release == '0'">导出</a-button>
                  <a-button type="text" danger v-else>删除</a-button>
                </template>
              </a-space>
            </template>
          </ResizableTable>

        </div>
      </div>
    </transition>

    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '4'">
        <div class="container_box">

          <div class="flex_R mb10">
            <a-space>
              <a-button>模型训练</a-button>
            </a-space>
          </div>

          <tableForm :columns="formColumns(4)" :model="formState(labelFormColumns)" @change="onFormListChange" ref="form4"></tableForm>

          <ResizableTable size="small" ref="tableRef4" :columns="labelColumns" :data-source="tableData4">
            <template #action="{ record }">
              <a-space>
                <a-button type="link" @click="handlerInfo(record)">查看版本信息</a-button>
                <template v-if="record.state == '0'">
                  <a-button type="text" v-if="record.release == '0'">回滚</a-button>
                  <a-button type="text" v-else>发布</a-button>
                </template>
                <template v-else>
                  <a-button type="text" style="color:#3C3C3C" v-if="record.release == '1'">停止训练</a-button>
                  <a-button type="text" style="color:#50C14D" v-if="record.release == '2'">继续训练</a-button>
                </template>
                <template v-if="record.state == '0'">
                  <a-button type="text" danger v-if="record.release == '0'">导出</a-button>
                  <a-button type="text" danger v-else>删除</a-button>
                </template>
              </a-space>
            </template>
          </ResizableTable>

        </div>
      </div>
    </transition>

    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '5'">
        <div class="container_box">

          <div class="flex_R mb10">
            <a-space>
              <a-button>模型训练</a-button>
            </a-space>
          </div>

          <tableForm :columns="formColumns(5)" :model="formState(labelFormColumns)" @change="onFormListChange" ref="form5"></tableForm>

          <ResizableTable size="small" ref="tableRef5" :columns="labelColumns" :data-source="tableData5">
            <template #action="{ record }">
              <a-space>
                <a-button type="link" @click="handlerInfo(record)">查看版本信息</a-button>
                <template v-if="record.state == '0'">
                  <a-button type="text" v-if="record.release == '0'">回滚</a-button>
                  <a-button type="text" v-else>发布</a-button>
                </template>
                <template v-else>
                  <a-button type="text" style="color:#3C3C3C" v-if="record.release == '1'">停止训练</a-button>
                  <a-button type="text" style="color:#50C14D" v-if="record.release == '2'">继续训练</a-button>
                </template>
                <template v-if="record.state == '0'">
                  <a-button type="text" danger v-if="record.release == '0'">导出</a-button>
                  <a-button type="text" danger v-else>删除</a-button>
                </template>
              </a-space>
            </template>
          </ResizableTable>

        </div>
      </div>
    </transition>

    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '6'">
        <div class="container_box">

          <div class="flex_R mb10">
            <a-space>
              <a-button>模型训练</a-button>
            </a-space>
          </div>

          <tableForm :columns="formColumns(6)" :model="formState(labelFormColumns)" @change="onFormListChange" ref="form6"></tableForm>

          <ResizableTable size="small" ref="tableRef6" :columns="labelColumns" :data-source="tableData6">
            <template #action="{ record }">
              <a-space>
                <a-button type="link" @click="handlerInfo(record)">查看版本信息</a-button>
                <template v-if="record.state == '0'">
                  <a-button type="text" v-if="record.release == '0'">回滚</a-button>
                  <a-button type="text" v-else>发布</a-button>
                </template>
                <template v-else>
                  <a-button type="text" style="color:#3C3C3C" v-if="record.release == '1'">停止训练</a-button>
                  <a-button type="text" style="color:#50C14D" v-if="record.release == '2'">继续训练</a-button>
                </template>
                <template v-if="record.state == '0'">
                  <a-button type="text" danger v-if="record.release == '0'">导出</a-button>
                  <a-button type="text" danger v-else>删除</a-button>
                </template>
              </a-space>
            </template>
          </ResizableTable>

        </div>
      </div>
    </transition>
    <a-drawer title="查看版本" width="70%" :visible="visible" @close="onClose">
      <div class="select_top">
        <a-select
          value="v3.1"
          style="width: 200px"
        ></a-select>
      </div>
      <a-descriptions title="基础信息" class="descriptions_card">
        <a-descriptions-item label="训练完成时间">2021-05-22 08:33</a-descriptions-item>
        <a-descriptions-item label="训练数据集">训练集001</a-descriptions-item>
        <a-descriptions-item label="训练测试集">测试集002</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="训练数据集" class="descriptions_card">
        <a-descriptions-item label="训练集名称">001</a-descriptions-item>
        <a-descriptions-item label="数据量">500</a-descriptions-item>
        <a-descriptions-item label="备注">备注信息备注信息</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="训练测试集" class="descriptions_card">
        <a-descriptions-item label="训练集名称">001</a-descriptions-item>
        <a-descriptions-item label="数据量">500</a-descriptions-item>
        <a-descriptions-item label="备注">备注信息备注信息</a-descriptions-item>
      </a-descriptions>

      <div class="descriptions_card">
        <div class="title">测试结果</div>
        <div class="main">
          <div class="main-item">
            <div class="progress"><Percentloop percentNum="92.04" speed="3" background="5093E1" /></div>
            <div class="progress_right">
              <div class="rtitle">92.04%</div>
              <div class="rname">语义模型001 _ V1.1准确度</div>
            </div>
          </div>
          <div class="main-item">
            
            <div class="progress"><Percentloop percentNum="75.05" speed="3" background="50C14D" /></div>
            <div class="progress_right">
              <div class="rtitle">75.05%</div>
              <div class="rname">语义模型001 _ V1.1准确度</div>
            </div>

          </div>
          <div class="main-item">
            <div class="progress"><Percentloop percentNum="97.18" speed="3" background="B74B75" /></div>
            <div class="progress_right">
              <div class="rtitle">97.18%</div>
              <div class="rname">语义模型001 _ V1.1准确度</div>
            </div>
          </div>
        </div>
      </div>

      <a-table></a-table>

    </a-drawer>
  </div>
</template>
<script>
import { defineComponent,toRefs,reactive, watch, onMounted } from 'vue'

import {labelColumns,formColumns} from './columns'
import axios from '@/plugins/axios'




export default defineComponent({
  name:'模型列表',
  setup() {
    const state = reactive({
      labelColumns,formColumns,
      activeKey:"1",
      visible:false,
      tableData1:[],
      tableData2:[],
      tableData3:[],
      tableData4:[],
      tableData5:[],
      tableData6:[],
      apiList:['/trainingcenter/modellist/speechmining','/trainingcenter/modellist/labelextraction','/trainingcenter/modellist/customerfe','/trainingcenter/modellist/speechrecom','/trainingcenter/modellist/findpolicy','/trainingcenter/modellist/optimalpath'] // 话术挖掘模型   、 标签提取模型 、 客户分群模型 、 话术推荐模型 、 查找策略模型 、 最优路径模型
    })
    const formState = () => {}
    const onLoad = (val) => {
      axios({
        url: state.apiList[val - 1],
        method: 'post'
      }).then((res) => {
        if(!res.data.code){
          state['tableData' + val] = res.data.result.data
        }
      }).catch((error) => {
          console.log(error)
      })
    }
    onLoad(state.activeKey)
    watch(()=>state.activeKey,(newVal)=>{
      onLoad(newVal)
    })
    const handlerInfo = (item) => {
      console.log(item)
      state.visible = true;
    }
    const onClose = () => {
      state.visible = false;
    };

    onMounted(()=>{
      console.log('环形进度图')
    })
    
    return {
        ...toRefs(state),
        formState,
        handlerInfo,
        onClose
    }
  }
})
</script>
<route lang="yaml">
  meta:
    level: 1
    parent: '训练中心'
    name: '模型列表'
    icon: 'icon-xunlian'
    layout: auth
</route>