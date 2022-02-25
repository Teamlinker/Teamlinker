<template>
  <div class="list">
    <div class="search">
      <a-space>
        <a-input
          allowClear
          v-model:value="queryParams.keyword"
          placeholder="标签名称"
          @keyup.enter.prevent="searchQuery(queryParams.keyword)"
        />
        <a-button @click="searchQuery(queryParams.keyword)" type="primary"
          >搜索</a-button
        >
      </a-space>
      <div>
        <a-button @click="addTag" type="primary">添加标签</a-button>
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :rowKey="(record) => record.id"
      :pagination="pagination"
    >
      <template #action="{ record }">
        <a @click="onEdit(record)">编辑</a>
        <a-popconfirm title="确认删除吗?" @confirm="onDelete(record.id)">
          <a style="margin-left: 10px">删除</a>
        </a-popconfirm>
      </template>
    </a-table>
    <a-modal
      v-model:visible="visible"
      :confirm-loading="confirmLoading"
      title="添加标签"
      @ok="handleOk"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="名字" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
interface FormState {
  name: string
  projectId: string
  tagId?: string
}
import {
  defineComponent,
  ref,
  UnwrapRef,
  reactive,
  toRefs,
  onActivated
} from 'vue'
import axios from '@/plugins/axios'
import { message } from 'ant-design-vue'
import { Icon } from '@/layouts/components/ICON.ts'
import { useRouter } from 'vue-router'
import getTableFunc from '@/utils/list.ts'
import { columns } from './columns'
export default defineComponent({
  name: '添加标签',
  components: {
    Icon
  },
  setup() {
    const { stateData, handleTableChange, setUrl, searchQuery, initData } =
      getTableFunc()
    const visible = ref<boolean>(false)
    const confirmLoading = ref<boolean>(false)
    const list = ref<string[]>([])
    const formRef = ref()
    const router = useRouter()
    const projectId = ref<any>('')
    let formState: UnwrapRef<FormState> = reactive({
      name: '',
      projectId: '',
      tagId: ''
    })
    const rules = reactive({
      name: [
        {
          required: true,
          message: '请输入标签名称',
          trigger: 'blur'
        }
      ]
    })
    const addTag = () => {
      visible.value = true
      formState.name = ''
    }
    const handleOk = (e: MouseEvent) => {
      console.log(e)
      formRef.value.validate().then(() => {
        confirmLoading.value = true
        axios
          .post('/project/tag/item', {
            name: formState.name,
            projectId: projectId.value,
            tagId: formState.tagId
          })
          .then(() => {
            message.success('创建成功')
            visible.value = false
            initData()
          })
          .finally(() => {
            confirmLoading.value = false
          })
      })
    }
    const onEdit = (record: any) => {
      visible.value = true
      formState.tagId = record.id
      formState.name = record.name
    }
    const onDelete = (id: string) => {
      const params = {
        tagId: id,
        projectId: projectId.value
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
    onActivated(() => {
      const id = router.currentRoute.value.query.projectId
      projectId.value = id
      stateData.queryParams = { projectId: id }
      setUrl('/project/tag/list')
    })
    return {
      columns,
      ...toRefs(stateData),
      handleTableChange,
      setUrl,
      initData,
      searchQuery,
      visible,
      confirmLoading,
      formRef,
      list,
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      },
      formState,
      rules,
      addTag,
      handleOk,
      onEdit,
      onDelete
    }
  }
})
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '标签'
    icon: 'DashboardOutlined'
    layout: auth
</route>
<style scoped lang="scss">
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