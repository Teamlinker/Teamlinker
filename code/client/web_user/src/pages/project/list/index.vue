<template>
  <div>
    <div class="search">
      <a-input v-model:value="searchText" placeholder="Basic usage" />
      <a-button @click="searchQuery">搜索</a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :rowKey="(record) => record.id"
      :pagination="pagination"
    > 
      <template #photo="{ record }">
        <img :src="'http://175.27.166.37:13000'+record.photo" width="60"/>
      </template>
      <template #action="{ record }">
         <a @click="onGoSet(record.id)">项目设置</a>
        <a-popconfirm title="确认删除吗?" @confirm="onDelete(record.id)">
          <a style="margin-left:10px">删除</a>
        </a-popconfirm>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import { columns } from "./columns";
import { message } from 'ant-design-vue';
import getTableFunc from '@/utils/list.ts'
export default defineComponent({
  name: "项目列表",
  setup() {
    const searchText = ref<string>('');
    const {stateData,handleTableChange,initData,setUrl,searchQuery} = getTableFunc()
    const router = useRouter()
    setUrl('/project/list')
    const  onDelete = (key: string) => {
       const params = {
         projectId:key
       }
       axios.delete('/project/remove',{ params: params }).then(()=>{
         message.success('删除成功');
         initData(0);
       }
        
       )
    };
    const onGoSet = (id:string)=>{
       console.log(id,'idddd')
       router.push('/project/module?projectId='+id)
    }
    return {
      searchText,
      columns,
      ...toRefs(stateData),
      onDelete,
      onGoSet,
      handleTableChange,
      setUrl,
      searchQuery
    };
  },
});
</script>
<style lang="scss">
</style>
<route lang="yaml">
  meta:
    level: 1
    name: '项目列表'
    layout: auth
</route>