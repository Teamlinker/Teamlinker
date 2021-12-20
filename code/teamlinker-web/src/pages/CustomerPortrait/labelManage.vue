<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb>
        <a-tabs v-model:activeKey="activeKey" >
          <a-tab-pane key="1" tab="静态标签"></a-tab-pane>
          <a-tab-pane key="2" tab="动态标签"></a-tab-pane>
        </a-tabs>
      </Breadcrumb>
    </div>
    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '1'">
        <div class="container_box">

          <div class="flex_R mb10">
            <a-space>
              <a-button @click="onExport">导出标签</a-button>
              <a-button @click="onImport">导入标签</a-button>
              <a-button @click="onAdd">新增标签</a-button>
            </a-space>
          </div>
          <tableForm :columns="labelFormColumns" :model="formState(labelFormColumns)" @change="onFormListChange" ref="static"></tableForm>

          <ResizableTable size="dafault" ref="staticTable" :columns="labelColumns" :data-source="staticTableData" :rowKey="(record,index)=>{return index}">
            <template v-for="col in ['name', 'remarks']" #[col]="{ text, record }" :key="col">
              <div>
                <a-input v-if="editableData[record.id]" v-model:value="editableData[record.id][col]" style="margin: -5px 0" />
                <template v-else>{{ text }}</template>
              </div>
            </template>
            <template #action="{ record }">
              <a-space>
                <a-button type="link" @click="staticSave(record.id,staticTableData)" v-if="editableData[record.id]">保存</a-button>
                <a-button type="link" @click="staticEdit(record.id,staticTableData)" v-else>编辑</a-button>
                <a-button type="text" v-if="record.state == '0'">停用</a-button>
                <a-button type="text" v-else style="color:#50C14D">启用</a-button>
                <a-button type="text" danger>删除</a-button>
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
              <a-button @click="onExport">导出标签</a-button>
              <a-button @click="onImport">导入标签</a-button>
              <a-button @click="onAdd">新增标签</a-button>
            </a-space>
          </div>

          <tableForm :columns="labelFormColumns" :model="formState(labelFormColumns)" @change="onFormListChange" ref="dynamic"></tableForm>

          <a-table size="dafault" ref="dynamicTable" :columns="labelColumns" :data-source="dynamicTableData" :rowKey="(record,index)=>{return index}">
            <template #action="{ record }">
              <a-space>
                <a-button type="link">编辑</a-button>
                <a-button type="text" v-if="record.state == '0'">停用</a-button>
                <a-button type="text" v-else style="color:#50C14D">启用</a-button>
                <a-button type="text" danger>删除</a-button>
              </a-space>
            </template>
          </a-table>

        </div>
      </div>
    </transition>
    <a-modal v-model:visible="visibleExport" title="导出标签" @ok="handleOk('visibleExport')">
      <p>导出标签</p>
    </a-modal>

    <a-modal v-model:visible="visibleImport" title="导入标签" @ok="handleOk('visibleImport')" :footer="null">
      <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        :multiple="true"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        @change="handleChange"
      >
        <p class="ant-upload-drag-icon">
          <CloudUploadOutlined />
        </p>
        <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
        <p class="ant-upload-hint">支持扩展名：.xls</p>
      </a-upload-dragger>

    </a-modal>

    <a-modal v-model:visible="visibleAdd" title="新增标签" @ok="handleOk('visibleAdd')">
      <a-form :model="formStates" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="标签名称">
          <a-input v-model:value="formStates.name" />
        </a-form-item>

        <a-form-item label="标签分类">
          <a-input v-model:value="formStates.class" />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model:value="formStates.remarks" />
        </a-form-item>
      </a-form>
    </a-modal>
    

  </div>
</template>
<script>
import { defineComponent,reactive,toRefs } from 'vue'

import {labelColumns,labelFormColumns} from './columns'

import { CloudUploadOutlined } from '@ant-design/icons-vue';

import axios from '@/plugins/axios'

export default defineComponent({
  name:'标签管理',
  components:{
    CloudUploadOutlined
  },
  setup() {
    const state = reactive({
      activeKey:"1",
      labelColumns,
      labelFormColumns,
      dynamicTableData:[],
      staticTableData:[],
      editableData:{},
      visibleImport:false,
      visibleExport:false,
      visibleAdd:false,
      fileList:[],
      formStates:{
        name:"",
        class:"",
        remarks:""
      },
      labelCol:{ span: 4 },
      wrapperCol:{ span: 14 }
    })
    /***************************
    ** @description 加载表格数据
    ****************************/
    axios({
      url: '/customerPortrait/labelManage',
      method: 'post'
    }).then((res) => {
      if(!res.data.code){
        state.staticTableData = res.data.result.data
      }
    }).catch((error) => {
        console.log(error)
    })

    const changeKey = (key) => {
      state.activeKey = key
    }
    const formState = () => {}
    const onFormListChange = () => {}

    const staticEdit = (id,dataSource) => {
      state.editableData[id] = dataSource.filter(item => id === item.id)[0]
    }

    const staticSave = (id,dataSource) => {
      Object.assign(dataSource.filter(item => id === item.id)[0], state.editableData[id]);
      delete state.editableData[id];
      // alert('保存')
    }

    // 导入标签
    const onImport = () => {
      state.visibleImport = true
      // alert('导入标签')
    }
    // 导出标签
    const onExport = () => {
      alert('导出标签')
    }
    // 新增标签
    const onAdd = () => {
     state.visibleAdd = true
    }

    const handleOk = (name) => {
      // 关闭弹窗
      state[name] && (state[name] = false)
    }
    
    return {
      ...toRefs(state),
      changeKey,
      formState,
      onFormListChange,
      staticEdit,
      staticSave,
      onImport,
      onExport,
      onAdd,
      handleOk
    }
  }
})


</script>
<route lang="yaml">
  meta:
    level: 2
    name: '标签管理'
    parent: '用户画像'
    icon: 'icon-yonghuhuaxiang'
    layout: auth
</route>