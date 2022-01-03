<template>
  <div style="margin-left:240px">
    <div class="module-list">
      <a-tree v-model:expandedKeys="expandedKeys" :tree-data="treeData">
        <template #title="{ title }">
          {{ title }}
        </template>
      </a-tree>
    </div>
    <div class="add-member">
      <a-button @click="addTag">添加模块</a-button>
      <a-modal v-model:visible="visible" title="添加模块" @ok="handleOk">
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
  </div>
</template>
<script lang="ts">
interface FormState {
  name: string;
  projectId: string;
}
import { DownOutlined } from "@ant-design/icons-vue";
import _ from "lodash";
import { defineComponent, ref, UnwrapRef, reactive, watch } from "vue";
import axios from "@/plugins/axios";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
export default defineComponent({
  name: "添加标签",
  components: {
    DownOutlined,
  },
  setup() {
    const expandedKeys = ref<string[]>([]);
    const selectedKeys = ref<string[]>([]);
    const treeData = ref<string[]>([]);
    const router = useRouter()
    const visible = ref<boolean>(false);
    const formRef = ref();
    let formState: UnwrapRef<FormState> = reactive({
      name: "",
      projectId: "",
    });
    const rules = reactive({
      name: [
        {
          required: true,
          message: "请输入项目名称",
          trigger: "blur",
        },
      ],
    });
    const addTag = () => {
      visible.value = true;
    };
    const handleOk = (e: MouseEvent) => {
      console.log(e);
      formRef.value.validate().then(() => {
        const id = router.currentRoute.value.query.projectId;
        axios
          .post("project/module/item", {
            name: formState.name,
            projectId: "395922736190524416",
            parentModuleId: id,
          })
          .then(() => {
            message.success("创建成功");
            visible.value = false;
          });
      });
    };
    const TreeMap = (list) => {
      return list.map((v) => {
        return {
          children: v.data.length ? TreeMap(v.data) : [],
          title: v.name,
          key: v.id,
        };
      });
    };
    let initData = () => {
      const params = {
        projectId: "395922736190524416",
      };
      axios.get("project/module/list", { params: params }).then((res: any) => {
        console.log(res, "resss");
        const data = TreeMap(res.data);
        console.log(data, "treeData");
        treeData.value = data;
      });
    };
    initData();
    return {
      expandedKeys,
      selectedKeys,
      treeData,
      visible,
      formRef,
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      formState,
      rules,
      addTag,
      handleOk,
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '模块'
    icon: 'DashboardOutlined'
    layout: auth
</route>
<style scoped lang="scss">
.module-list {
  min-height: 200px;
}
</style>