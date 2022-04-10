<template>
  <div class="list">
    <div class="search">
      <a-space>
        <a-input
          allowClear
          v-model:value="queryParams.keyword"
          placeholder="项目名称"
          @keyup.enter.prevent="searchEnterFun(ueryParams.keyword)"
        />
        <a-button @click="searchQuery(queryParams.keyword)" type="primary"
          >搜索</a-button
        >
      </a-space>
      <div>
        <a-button @click="createProject" type="primary">创建项目</a-button>
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :rowKey="(record) => record.id"
      :pagination="pagination"
    >
      <template #photo="{ record }">
        <img
          :src="'http://175.27.166.37:13000' + record.photo"
          width="60"
          v-if="record.photo"
        />
      </template>
      <template #action="{ record }">
        <a @click="onGoSet(record.id)">项目设置</a>
        <a @click="onGoSetIssue(record.id)" style="margin-left:5px;">事务</a>
        <a-popconfirm title="确认删除吗?" @confirm="onDelete(record.id)">
          <a style="margin-left: 10px">删除</a>
        </a-popconfirm>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, ref, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { columns } from './columns'
import { message } from 'ant-design-vue'
import getTableFunc from '@/utils/list.ts'
export default defineComponent({
  name: '项目列表',
  setup() {
    const searchText = ref<string>('')
    const { stateData, handleTableChange, initData, setUrl, searchQuery } =
      getTableFunc()
    const router = useRouter()

    //删除项目
    const onDelete = (key: string) => {
      const params = {
        projectId: key
      }
      axios.delete('/project/remove', { params: params }).then(() => {
        message.success('删除成功')
        let cur
        if (stateData.pagination.total % 10 === 1) {
          cur = stateData.pagination.current - 1
        } else {
          cur = stateData.pagination.current - 1
        }
        initData(cur)
      })
    }
    const onGoSet = (id: string) => {
      console.log(id, 'idddd')
      router.push('/project/edit?projectId=' + id)
    }
     const onGoSetIssue = (id: string) => {
      router.push('/issue/list?projectId=' + id)
    }
    const createProject = () => {
      router.push('/project/create')
    }
    const searchEnterFun = (val: string) => {
      searchQuery({ keyword: val })
    }
    onActivated(() => {
      setUrl('/project/list')
    })

    return {
      searchText,
      columns,
      ...toRefs(stateData),
      onDelete,
      onGoSet,
      onGoSetIssue,
      handleTableChange,
      setUrl,
      searchQuery,
      createProject,
      searchEnterFun
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
    name: '项目列表'
    layout: auth
</route>