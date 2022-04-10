<template>
  <div class="list">
    <div class="search">
      <a-space>
        <a-input
          allowClear
          v-model:value="queryParams.name"
          placeholder="名称"
          @keyup.enter.prevent="searchEnterFun(ueryParams.keyword)"
        />
        <a-select  placeholder="select priority" v-model:value="queryParams.priority" style="width: 120px"  :options="priorityOptions"></a-select>
        <a-select  placeholder="select assigner" v-model:value="queryParams.assigner" style="width: 120px"  :options="assignerOptions"></a-select>
        <a-select  placeholder="select reporter" v-model:value="queryParams.reporter" style="width: 120px"  :options="reporterOptions"></a-select>
        <a-button @click="searchQuery(queryParams.name)" type="primary"
          >搜索</a-button
        >
      </a-space>
      <div>
        <a-button @click="createProject" type="primary">创建事务</a-button>
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
        <a-popconfirm title="确认删除吗?" @confirm="onDelete(record.id)">
          <a style="margin-left: 10px">删除</a>
        </a-popconfirm>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, ref, onActivated } from 'vue'
import type { SelectProps } from 'ant-design-vue';
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { message } from 'ant-design-vue'
export default defineComponent({
  name: '事务列表',
  setup() {
    const priorityOptions = ref<SelectProps['options']>([
      {
        value: '0',
        label: '高',
      },
      {
        value: '1',
        label: '中',
      },
      {
        value: '2',
        label: '低',
      },
    ]);
     const assignerOptions = ref<SelectProps['options']>([]);
     const reporterOptions = ref<SelectProps['options']>([]);
    const stateData = {
      queryParams:{
        name:'',
        priority:'',
        assigner:'',
        reporter:'',
      }
    }
    const searchQuery = ()=>{

    }
    return {
      priorityOptions,
      ...toRefs(stateData),
      searchQuery,

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
    name: '事务列表'
    layout: auth
</route>