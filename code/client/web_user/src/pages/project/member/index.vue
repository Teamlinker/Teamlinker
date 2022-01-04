<template>
  <div>
    <div style="margin-left: 240px">
      <div class="add-member" @click="addMember">
        <a-button>添加成员</a-button>
      </div>
      <a-modal v-model:visible="visible" title="添加成员" @ok="handleOk">
        <a-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-form-item label="名字" name="name">
            <a-select
              v-model:value="formState.name"
              show-search
              placeholder="input search text"
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
              @change="handleRoleChange"
            >
              <a-select-option
                :value="item.id"
                v-for="item in options"
                :key="item.id"
                >{{ item.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </div>
</template>
<script lang="ts">
interface FormState {
  name: string;
  roleId: string;
  type:Number
}
import { defineComponent, reactive, toRefs, ref, UnwrapRef, toRaw } from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import { message } from 'ant-design-vue';
export default defineComponent({
  name: "项目信息",
  setup() {
    const router = useRouter();
    const state = reactive({});
    const visible = ref<boolean>(false);
    const nameList = ref<any[]>([]);
    let formState: UnwrapRef<FormState> = reactive({
      name: "",
      roleId: "",
      type:0
    });
    const rules = reactive({
      name: [
        {
          required: true,
          message: "请输入项目名称",
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
        Promise.all([axios.get("/user/filter",{params:params}),axios.get('/team/filter',{params:params})]).then(res=>{
          if (currentValue === value) {
            const userList = res[0].data.map(item=>{
              return {
                value:item.id,
                label:item.name+'(个人)',
                type:0
              }
            })
            const teamList = res[1].data.map(item=>{
              return {
                value:item.id,
                label:item.name+'(团队)',
                type:1
              }
            })
            let data = userList.concat(teamList)
            callback(data);
          }

        })
      }
      timeout = setTimeout(fake, 300);
    }
    //名字搜索
    const handleSearch = (val: string) => {
      if (!val) {
        return false;
      }
      fetch(val, (d: any[]) => (nameList.value = d));
    };
    //名字选择
    const handleChange = (val: string) => {
      const type = nameList.value.filter(item=>item.value===val)[0].type
      formState.type = type
    };
    let options = ref([]);
    //获取成员列表
    const initData = () => {
      const id = router.currentRoute.value.query.projectId;
      if (id) {
        const params = {
          projectId: id,
          page: 0,
          size: 10,
        };
        axios.get("/project/member/list", { params: params }).then((res) => {
          console.log(res, "resss");
        });
      }
    };
    initData();
    //新增成员
    const addMember = () => {
      visible.value = true;
      const id = router.currentRoute.value.query.projectId;
      axios
        .get("/project/roles", { params: { projectId: id } })
        .then((res: any) => {
          options.value = res.data;
        });
    };
    //提交表单
    const handleOk = (e: MouseEvent) => {
      formRef.value.validate().then(() => {});
      let formData = toRaw(formState);
      const id = router.currentRoute.value.query.projectId;
      const params = {
        projectId: id,
        memberId: formData.name,
        type: formData.type,
        roleId: formData.roleId,
      };
      axios.put("/project/member/item", params).then(() => {
        message.success("创建成功");
      });
    };
    const formRef = ref();

    const handleRoleChange = (value: string) => {
      console.log(`selected ${value}`);
    };
    const filterRoleOption = (input: string, option: any) => {
      return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };
    return {
      ...toRefs(state),
      addMember,
      visible,
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
      handleRoleChange,
      filterRoleOption,
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '项目成员'
    layout: auth
</route>
<style scoped>
.add-member {
  margin-top: 50px;
  margin-left: 50px;
}
</style>