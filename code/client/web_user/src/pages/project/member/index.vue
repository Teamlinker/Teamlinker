<template>
  <div class="list">
    <div class="search">
      <a-space>
        <a-input
          allowClear
          v-model:value="queryParams.keyword"
          placeholder="成员姓名"
          @keyup.enter.prevent="searchQuery(queryParams.keyword)"
        />
        <a-button @click="searchQuery(queryParams.keyword)" type="primary">搜索</a-button>
      </a-space>
      <div>
        <a-button @click="addMember" type="primary">新增成员</a-button>
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :rowKey="(record) => record.id"
      :pagination="pagination"
    >
      <template #action="{ record }">
        <a @click="onDelete(record.id)">删除</a>
      </template>
    </a-table>
    <div style="margin-left: 240px">
      <a-modal
        v-model:visible="visible"
        :confirm-loading="confirmLoading"
        title="添加成员"
        @ok="handleOk"
      >
        <a-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-form-item label="姓名" name="memberId">
            <a-select
              v-model:value="formState.memberId"
              show-search
              placeholder="请输入成员姓名"
              style="width: 200px"
              :default-active-first-option="false"
              :show-arrow="false"
              :filter-option="false"
              :not-found-content="null"
              :options="nameList"
              @search="handleSearch"
              @change="handleChange"
            ></a-select>
          </a-form-item>
          <a-form-item label="角色" name="roleId">
            <a-select
              v-model:value="formState.roleId"
              show-search
              placeholder="选择角色"
              style="width: 200px"
              allowClear
              :filter-option="filterRoleOption"
            >
              <a-select-option :value="item.id" v-for="item in options" :key="item.id">{{
                item.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </div>
</template>
<script lang="ts">
interface FormState {
  memberId: string;
  roleId: string;
  type: Number;
}
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  UnwrapRef,
  toRaw,
  onActivated,
} from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import { message } from "ant-design-vue";
import { columns } from "./columns";
import getTableFunc from "@/utils/list.ts";
export default defineComponent({
  name: "项目信息",
  setup() {
    const {
      stateData,
      handleTableChange,
      setUrl,
      searchQuery,
      initData,
    } = getTableFunc();
    const router = useRouter();
    const projectId = ref<any>("");
    const confirmLoading = ref<boolean>(false);
    const visible = ref<boolean>(false);
    const nameList = ref<any>();
    const options = ref([]);
    const formRef = ref();
    let formState: UnwrapRef<FormState> = reactive({
      memberId: "",
      roleId: "",
      type: 0,
    });
    const rules = reactive({
      memberId: [
        {
          required: true,
          message: "请输入成员姓名",
          trigger: "blur",
        },
      ],
      roleId: [
        {
          required: true,
          message: "请选择角色",
          trigger: "change",
        },
      ],
    });
    let timeout: any;
    let currentValue = "";
    //姓名搜索
    function fetch(value: string, callback: any) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      currentValue = value;
      function fake() {
        const params = {
          name: value,
        };
        Promise.all([
          axios.get("/user/filter", { params: params }),
          axios.get("/team/filter", { params: params }),
        ]).then((res) => {
          if (currentValue === value) {
            const userList = res[0].data.map((item: any) => {
              return {
                value: item.id,
                label: item.name + "(个人)",
                type: 0,
              };
            });
            const teamList = res[1].data.map((item: any) => {
              return {
                value: item.id,
                label: item.name + "(团队)",
                type: 1,
              };
            });
            let data = userList.concat(teamList);
            callback(data);
          }
        });
      }
      timeout = setTimeout(fake, 300);
    }
    const handleSearch = (val: string) => {
      if (!val) {
        return false;
      }
      fetch(val, (d: any[]) => (nameList.value = d));
    };
    const handleChange = (val: string) => {
      console.log(val, "valll2");
    };
    //新增成员
    const addMember = () => {
      visible.value = true;
      resetForm();
    };
    //resetForm
    const resetForm = () => {
      formState.memberId = "";
      formState.roleId = "";
    };
    //表单提交
    const handleOk = (e: MouseEvent) => {
      formRef.value.validate().then(() => {
        confirmLoading.value = true;
        let formData = toRaw(formState);
        const type = nameList.value.filter(
          (item: any) => item.value === formData.memberId
        )[0].type;
        const params = {
          projectId: projectId.value,
          memberId: formData.memberId,
          type: type,
          roleId: formData.roleId,
        };
        axios
          .post("/project/member/item", params)
          .then(() => {
            message.success("操作成功");
            initData();
          })
          .finally(() => {
            confirmLoading.value = false;
          });
      });
    };

    const filterRoleOption = (input: string, option: any) => {
      return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };
    //删除
    const onDelete = (id: string) => {
      const params = {
        projectId: projectId.value,
        memberId: id,
      };
      axios.delete("/project/member/item", { params: params }).then(() => {
        message.success("操作成功");
        let page = stateData.pagination.current;
        if (
          stateData.pagination.total % stateData.pagination.pageSize === 1 ||
          stateData.pagination.pageSize === 1
        ) {
          page = stateData.pagination.current - 1;
        }
        initData(page);
      });
    };
    //获取角色
    const getRole = () => {
      axios
        .get("/project/roles", { params: { projectId: projectId.value } })
        .then((res: any) => {
          console.log(res, "resss");
          options.value = res.data;
        });
    };
    onActivated(() => {
      const id = router.currentRoute.value.query.projectId;
      projectId.value = id;
      stateData.queryParams = { projectId: id };
      setUrl("/project/member/list");
      getRole();
    });
    return {
      columns,
      ...toRefs(stateData),
      handleTableChange,
      setUrl,
      initData,
      searchQuery,
      addMember,
      visible,
      confirmLoading,
      handleOk,
      formRef,
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      formState,
      rules,
      nameList,
      options,
      handleSearch,
      handleChange,
      filterRoleOption,
      onDelete,
    };
  },
});
</script>
<route lang="yaml">
meta:
  level: 1
  type: "proset"
  name: "项目信息"
  layout: auth
</route>
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
