<template>
  <div>
    <div class="add-member" @click="addMember">
      <a-button>添加成员</a-button>{{options}}
    </div>
    <a-modal v-model:visible="visible" title="添加成员" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item  label="名字" name="name">
          <a-input v-model:value="formState.name" />
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
             <a-select-option :value="item.name" v-for="item in options" :key="item.id">{{item.name}}</a-select-option>
    
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
interface FormState {
  name: string;
  roleId: string;
}
import { defineComponent, reactive, toRefs, ref, UnwrapRef } from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
export default defineComponent({
  name: "项目信息",
  setup() {
    const router = useRouter();
    const state = reactive({});
    const visible = ref<boolean>(false);
    let options = ref([])
    const initData = () => {
      const id = router.currentRoute.value.query.projectId;
      console.log(id, "projectId");
      // 395922736190524416

      if (id) {
        const params = {
          projectId: id,
        };
        axios.get("/project/basic", { params: params }).then((res) => {
          console.log(res, "resss");
        });
      }
    };
    initData();
    const addMember = () => {
      visible.value = true; 
      const id = router.currentRoute.value.query.projectId;
      axios.get("/project/roles", { params: {projectId:id} }).then((res:any) => {
          console.log(res, "resss");
          options.value = res.data
        });
    };
    const handleOk = (e: MouseEvent) => {
      console.log(e);
      formRef.value.validate().then(() => {});
      // visible.value = false;
    };
    const formRef = ref();
    let formState: UnwrapRef<FormState> = reactive({
      name: "",
      roleId:""
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
      options,
      handleRoleChange,
      filterRoleOption
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '项目信息'
    layout: auth
</route>
<style scoped>
.add-member {
  margin-top: 50px;
  margin-left: 50px;
}
</style>