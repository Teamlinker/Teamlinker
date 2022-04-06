<template>
  <div class="create-issue">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
     
      <a-form-item label="Project" name="projectId">
        <a-select
          v-model:value="formState.projectId"
          show-search
          placeholder="please select project"
          @change="handleProjectChange"
          allowClear
        >
          <a-select-option
            :value="item.id"
            v-for="item in projectList"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="Type" name="issueTypeId">
        <a-select
          v-model:value="formState.issueTypeId"
          show-search
          placeholder="please select issueType"
          allowClear
          @change="handleIssueTypeChange"
        >
          <a-select-option
            :value="item.id"
            v-for="item in issueTypeList"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
       <a-form-item label="Assigner" name="assignerId">
        <a-select
          v-model:value="formState.assignerId"
          show-search
          placeholder="please select assigner"
          allowClear
        >
          <a-select-option
            :value="item.id"
            v-for="item in memberList"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
       <a-form-item label="Reporter" name="assignerId">
        <a-select
          v-model:value="formState.reporterId"
          show-search
          placeholder="please select reporter"
          allowClear
        >
          <a-select-option
            :value="item.id"
            v-for="item in memberList"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
       <a-form-item
        label="Name"
        name="name"
      >
        <a-input v-model:value="formState.name" :min="0" />
      </a-form-item>
       <a-form-item
        label="Priority"
        name="priority"
      >
        <a-input-number v-model:value="formState.priority" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">创建</a-button>
        <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, UnwrapRef, reactive } from 'vue'
import axios from '@/plugins/axios'
interface FormState {
  name: string
}
export default defineComponent({
  setup() {
    const formRef = ref()
    let formState: UnwrapRef<FormState> = reactive({
      projectId:'',
      issueTypeId:'',
      name: '',
      reporterId:'',
      assignerId:'',
      priority:''
    })
    const projectList = ref([])
    const issueTypeList = ref([])
    const memberList = ref([])
    //获取项目列表
    const getProjectList = ()=>{
        const params = {page:0,size:10}
        axios.get('/project/list',{params:params}).then(res=>{
          projectList.value = res.data.data
    })
    }
    
   const handleProjectChange = (val)=>{
       const params = {
           projectId:val
       }
       axios.get('/project/issuetype/list',{params:params}).then(res=>{
           issueTypeList.value = res.data
       })
        axios.get('/project/issuetype/list',{params:params}).then(res=>{
           issueTypeList.value = res.data
       })
       const memberParams = Object.assign({},params,{page:0,size:10})
       axios.get("/project/member/list", { params: memberParams }).then(res=>{
           memberList.value = res.data
       })
   }
   //获取第一个节点需要字段
   const getFields = (params)=>{
       axios.get('/issue/item/first',{params:params}).then(res=>{

       })
   }
   const handleIssueTypeChange = (val)=>{
       const parmas = {
           projectId:formState.projectId,
           issueTypeId:val
       }
        getFields(parmas)
   }
    const rules = reactive({
      name: [
        {
          required: true,
          message: '请输入事务名称',
          trigger: 'blur'
        }
      ]
    })
    const onSubmit = () => {
      formRef.value.validate().then(() => {})
    }
    const resetForm = () => {
      formRef.value.resetFields()
    }
   
    getProjectList()
    return {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      },
      projectList,
      issueTypeList,
      memberList,
      formRef,
      formState,
      rules,
      handleProjectChange,
      handleIssueTypeChange,
      onSubmit,
      resetForm
    }
  }
})
</script>
<route lang="yaml">
  meta:
    level: 1
    name: 'createIssue'
    layout: auth
</route>
<style scoped>
.create-issue {
  margin-top: 50px;
}
</style>
