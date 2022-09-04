<template>
  <div class="list">
    <div class="search">
      <a-space>
        <a-input
          allowClear
          v-model:value="queryParams.name"
          placeholder="releaseName"
          @keyup.enter.prevent="searchEnterFun(queryParams.name)"
        />
        <a-button @click="searchQuery(queryParams.name)" type="primary"
          >search</a-button
        >
      </a-space>
      <div>
        <a-button
          @click="createVersion"
          type="primary"
          style="margin-right: 20px"
          >create version</a-button
        >
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :rowKey="(record) => record.id"
      :pagination="pagination"
    >
      <template #name="{ record }">
        <a @click="onDetail(record.id)">{{ record.name }}</a>
      </template>
      <template #photo="{ record }">
        <img
          :src="'http://175.27.166.37:13000' + record.photo"
          width="60"
          v-if="record.photo"
        />
      </template>
      <template #action="{ record }">
        <a @click="delRelease(record.id)">delete</a>
        <a-divider type="vertical" />
        <a @click="editRelease(record)">
          edit
        </a>
         <a-divider type="vertical" />
         <a @click="addIssue(record)">
         addIssue
        </a>
        <a-divider type="vertical" />
         <!-- <a @click="removeIssue(record)">
         removeIssue
        </a>
         <a-divider type="vertical" /> -->
         <a @click="release(record)">
           {{record.status==0?'release':'unrelease'}}
        </a>
      </template>
    </a-table>
    <a-modal
      v-model:visible="visible"
      :confirm-loading="confirmLoading"
      title="create Version"
      @ok="handleOk"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="name" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="startTime" name="start_time">
          <a-date-picker
            placeholder="Select Time"
             showTime
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            v-model:value="formState.start_time"
          />
        </a-form-item>
        <a-form-item label="releaseTime" name="release_time">
          <a-date-picker
            placeholder="Select Time"
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            v-model:value="formState.release_time"
          />
        </a-form-item>
        <a-form-item label="description" name="description">
          <a-input v-model:value="formState.description" />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      v-model:visible="issueVisible"
      :confirm-loading="confirmLoading"
      title="add issue"
      @ok="handleAddIssue"
    >
      <a-form
        ref="formIssueRef"
        :model="formIssueState"
        :rules="issueRules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="issue" name="projectIssueId">
          <a-select
              v-model:value="formIssueState.projectIssueId"
              show-search
              placeholder="select issue"
              style="width: 200px"
              allowClear
              :filter-option="filterRoleOption"
            >
              <a-select-option :value="item.id" v-for="item in issueList" :key="item.id">{{
                item.name
              }}</a-select-option>
            </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, ref, reactive, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/plugins/axios'
import { columns } from './columns'
import { message } from 'ant-design-vue'
import getTableFunc from '@/utils/list.ts'
export default defineComponent({
  name: 'release',
  setup() {
    const searchText = ref<string>('')
    const {
      stateData,
      handleTableChange,
      initData,
      setUrl,
      searchQuery,
      setParams
    } = getTableFunc()
    const router = useRouter()
    const releaseId = ref('')
    const onDetail= (id: string) => {
      router.push('/release/detail?projectReleaseId=' + id+'&projectId='+projectId.value)
    }
    const delRelease = (id: string) => {
      axios
        .delete('/release/item', {
          params: {
            projectReleaseId: id
          }
        })
        .then(() => {
          message.success('删除成功')
          let page = stateData.pagination.current
          if (
            stateData.pagination.total % stateData.pagination.pageSize === 1 ||
            stateData.pagination.pageSize === 1
          ) {
            page = stateData.pagination.current - 1
          }
          initData(page)
        })
    }
    const searchEnterFun = (val: string) => {
      searchQuery({ keyword: val })
    }
    const projectId = ref('')
    onActivated(() => {
      const route = useRoute()
      const id = route.query.projectId
      projectId.value = id
      setParams(id)
      setUrl('/release/list')
      getIssueList()
    })
    let formState: UnwrapRef<FormState> = reactive({
      name: '',
      projectId: '',
      start_time: '',
      release_time: '',
      description: ''
    })
    const visible = ref<boolean>(false)
    const confirmLoading = ref<boolean>(false)
    const formRef = ref(null)
    const formIssueRef = ref(null)
    const rules = reactive({
      name: [
        {
          required: true,
          message: 'please input release name',
          trigger: 'blur'
        }
      ]
    })
    const createVersion = () => {
      visible.value = true
      formState.name = ''
      formState.start_time = null
      formState.release_time = null
      formState.description = ''
    }
    const handleOk = (e: MouseEvent) => {
      formRef.value.validate().then(() => {
        confirmLoading.value = true
        if (!releaseId.value) {
          axios
            .post('/release/item', {
              ...formState,
              projectId: projectId.value,
              id: releaseId
            })
            .then(() => {
              message.success('创建成功')
              visible.value = false
              initData()
            })
            .finally(() => {
              confirmLoading.value = false
            })
        } else {
          axios
            .put('/release/item', {
              ...formState,
              projectReleaseId: releaseId.value
            })
            .then(() => {
              message.success('编辑成功')
              visible.value = false
              initData()
            })
            .finally(() => {
              confirmLoading.value = false
            })
        }
      })
    }
    const onEdit = (record: any) => {
      visible.value = true
      formState.tagId = record.id
      formState.name = record.name
    }
    const onDelete = (id: string) => {
      const params = {
        projectId: id
      }
      axios.delete('/project/tag/item', { params: params }).then(() => {
        message.success('删除成功')
        let page = stateData.pagination.current
        if (
          stateData.pagination.total % stateData.pagination.pageSize === 1 ||
          stateData.pagination.pageSize === 1
        ) {
          page = stateData.pagination.current - 1
        }
        initData(page)
      })
    }
    const editRelease = (row: any) => {
      releaseId.value = row.id
      formState.name = row.name
      formState.start_time = row.start_time
      formState.release_time = row.release_time
      formState.description = row.description
      visible.value = true
    }
    const issueList = ref([])
    const issueVisible = ref<boolean>(false)
    let formIssueState: UnwrapRef<FormState> = reactive({
      projectIssueId: ''
    })
    const projectReleaseId = ref('')
    const addIssue = (item) => {
      issueVisible.value = true
      projectReleaseId.value = item.id
    }
    
    const issueRules = reactive({
      name: [
        {
          required: true,
          message: 'please select issue',
          trigger: 'change'
        }
      ]
    })
    const getIssueList = ()=>{
       const queryParams = {
           page: 0,
           size: 10,
           projectId:projectId.value
       }
       axios.get("/issue/filter", { params: queryParams }).then((res: any) => {
        issueList.value = res.data
      });
    }
    const removeIssue = ()=>{

    }
    const handleAddIssue = () => {
      formIssueRef.value.validate().then(() => {
        confirmLoading.value = true
          axios
            .post('/release/issue', {
              ...formIssueState,
              projectReleaseId: projectReleaseId.value,
            })
            .then(() => {
              message.success('操作成功')
              issueVisible.value = false
              initData()
            })
            .finally(() => {
              confirmLoading.value = false
            })
         
      })
    }
    //发布
    const release = (record)=>{
      axios.get('/release/ifcan',{
        params:{
          projectReleaseId:record.id
        }
      }).then(()=>{
       axios.put('release/release',{
         projectReleaseId:record.id,
         status:record.status==0?1:0
       }).then(()=>{
         message.success('do success')
         initData()
       })
      })
    }
    return {
      searchText,
      columns,
      ...toRefs(stateData),
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 16
      },
      onDetail,
      delRelease,
      handleTableChange,
      setUrl,
      searchQuery,
      searchEnterFun,
      createVersion,
      formState,
      visible,
      confirmLoading,
      formRef,
      formIssueRef,
      rules,
      handleOk,
      onEdit,
      onDelete,
      editRelease,
      issueVisible,
      formIssueState,
      issueRules,
      issueList,
      addIssue,
      handleAddIssue,
      removeIssue,
      release
    }
  }
})
</script>
<style lang="scss" scoped>
.list {
  margin: 0 20px;
}
.search {
  margin: 20px 0;
  display: flex;
  .ant-space {
    ::v-deep() {
      flex: 1;
    }
  }
}
</style>
<route lang="yaml">
meta:
  level: 1
  type: 'proside'
  name: "release"
  layout: auth
</route>
