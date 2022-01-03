<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :rowKey="(record) => record.id"
      :pagination="pagination"
    >
      <template #action="{ record }">
        <a-popconfirm title="确认删除吗?" @confirm="onDelete(record.id)">
          <a>删除</a>
        </a-popconfirm>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, UnwrapRef } from "vue";
import axios from "@/plugins/axios";
import { columns } from "./columns";
import { message } from 'ant-design-vue';
interface State {
  tableData: Array<any>;
  pagination: {
    current: Number;
    total: Number;
    onChange: Function;
  };
}
export default defineComponent({
  name: "项目列表",
  setup() {
    const state: UnwrapRef<State> = reactive({
      pagination: {
        current: 1,
        total: 0,
        onChange: () => {},
      },
      tableData: [],
    });
    let initData = async (page: number) => {
      const params = {
        page: page,
        size: 10,
      };
        axios.get("project/list", { params: params }).then((res: any) => {
        console.log(res, "resss");
        state.tableData = res.data.data;
        state.pagination.onChange = pageChange;
        state.pagination.total = +res.data.count;
      });
    };
    const pageChange = (page: number) => {
      initData(page);
      state.pagination.current = page;
    };
    initData(0);
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

    return {
      columns,
      ...toRefs(state),
      onDelete,
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