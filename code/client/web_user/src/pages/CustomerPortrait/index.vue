<template>
<div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
  <div class="tabsOrBreadcrumb">
    <Breadcrumb></Breadcrumb>
  </div>
  <div
    
    class="container_main"
  >
    <div class="container_box">
      <div class="flex_R mb10">
        <a-space>
          <a-button @click="onCreate">创建画像</a-button>
        </a-space>
      </div>
      <tableForm :columns="formColumns" :model="formState(formColumns)" @change="onFormListChange" refs="form1"></tableForm>
      <ResizableTable size="dafault" ref="tableRef" :columns="columns" :data-source="tableData" :rowKey="(record,index)=>{return index}">
        <template #action="action">
          <a-space>
            <a-button>查看详情</a-button>
            <a-button>删除</a-button>
          </a-space>
        </template>
      </ResizableTable>
    </div>
  </div>
  <a-modal v-model:visible="visibleCreate" title="创建画像" @ok="handleOk">
    <a-form :model="formStates">
      <a-form-item label="画像名称">
        <a-input v-model:value="formStates.name" />
      </a-form-item>
      <div class="addLabel">
        <p class="mt">静态属性</p>
        <a-form-item label="属性1">
          <a-select v-model:value="formStates.static.value1" :options="selectOptions" />
        </a-form-item>

        <a-form-item v-for="(item) in staticForm" :label="item.name" :key="item">
          <div class="flex flex_space flex_align_center">
            <a-select v-model:value="formStates.static[item.value]" :options="selectOptions" style="width:90%" /> <IconVue icon="MinusCircleOutlined" @click="delForm('staticForm',item)" class="MinusCircleOutlined" />
          </div>
        </a-form-item>

        <a-button type="dashed" block @click="addStaticForm"><IconVue icon="PlusOutlined" />添加属性</a-button>
      </div>
      <div class="addLabel">
        <p class="mt">动态属性</p>
        <a-form-item label="属性1">
          <a-select v-model:value="formStates.dynamic.value1" :options="selectOptions" />
        </a-form-item>

        <a-form-item v-for="(item) in dynamicForm"  :label="item.name" :key="item">
          <div class="flex flex_space flex_align_center">
            <a-select v-model:value="formStates.dynamic[item.value]" :options="selectOptions" style="width:90%" /> <IconVue icon="MinusCircleOutlined" @click="delForm('dynamicForm',item)" class="MinusCircleOutlined" />
          </div>
        </a-form-item>

        <a-button type="dashed" block @click="addDynamicForm"><IconVue icon="PlusOutlined" />添加属性</a-button>
      </div>
    </a-form>
  </a-modal>
</div>
</template>
<script>
import { defineComponent,reactive, toRefs,onMounted } from 'vue'
import {columns,formColumns} from './columns'
import { getTableList } from '@/api/demo'
export default defineComponent({
  name:'标签管理',
  setup() {
    const state = reactive({
      visibleCreate:false,
      formStates:{
        name: '',
        static:{
          value1:''
        },
        dynamic:{
          value1:''
        }
      },
      labelCol:{ span: 4 },
      wrapperCol:{ span: 14 },
      selectOptions:[
        {
          value: 'jack',
          label: 'Jack (100)',
        },
        {
          value: 'lucy',
          label: 'Lucy (101)',
        }
      ],
      staticForm:[],
      dynamicForm:[],
      rowSelection:{
        onChange: (selectedRowKeys, selectedRows) => {
          state.rowSelection.selectedRowKeys = selectedRowKeys
        },
        selectedRowKeys: []
      },
      columns,
      formColumns,
      tableData:[
        {
            key: 0,
            date: '2018-02-11',
            amount: 120,
            type: 'income',
            note: 'transfer',
        },
        {
            key: 1,
            date: '2018-03-11',
            amount: 243,
            type: 'income',
            note: 'transfer',
        },
        {
            key: 2,
            date: '2018-04-11',
            amount: 98,
            type: 'income',
            note: 'transfer',
        },
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
    const onFormListChange = () => {
      alert('onFormListChange')
    }

    const onCreate = () => {
      state.visibleCreate = true
    }
    const handleOk = () => {
      alert('handleOk')
    }
    const addStaticForm = (item) => {
      let staticForm = state.staticForm
      state.staticForm.push({
        name:'属性' + (staticForm.length + 2),
        value:'value' + (staticForm.length + 2),
        index:staticForm.length + 2
      })
    }
    const addDynamicForm = () => {
      // formStates.dynamic['value'+ (index+1)]
      let dynamicForm = state.dynamicForm
      state.dynamicForm.push({
        name:'属性' + (dynamicForm.length + 2),
        value:'value' + (dynamicForm.length + 2),
        index:dynamicForm.length + 2
      })
    }
    
    const delForm = (name,item) => {
      const thatState = state[name]
      thatState.forEach((its,index) => {
        if(its.index === item.index){
          thatState.splice(index, 1);
        }
      })
      state[name] = thatState
    }
    //初始化
    onMounted(() => {
      // onSubmit()
    })
    return {
      ...toRefs(state),
      getTableList,
      formState,
      onFormListChange,
      onCreate,
      handleOk,
      addStaticForm,
      addDynamicForm,
      delForm
    }
  }
})


</script>
<style lang="scss" scoped>
.addLabel{
  border: 1px solid #f0f0f0;
  padding:10px;
  &:last-child{
    margin-top: 10px;
  }
  .mt{
    margin-bottom: 24px;
  }
}
.MinusCircleOutlined{
  color: red;
}
</style>
<route lang="yaml">
  meta:
    level: 1
    name: '画像列表'
    icon: 'icon-yonghuhuaxiang'
    layout: auth
</route>