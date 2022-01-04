<template>
  <div class="cont">
    <div class="add-tag">
      <a-button @click="addTag">添加标签</a-button>
      </div>
      <div class="tag-list">
        <div @close="closeTag" v-for="item in list" :key="item.id" class="tag">
          <div>{{ item.name }}</div>
          <div>编辑</div>
          <div>删除</div>
        </div>
      </div>
      <a-modal v-model:visible="visible" title="添加标签" @ok="handleOk">
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
  name: string;
  projectId: string;
}
import { defineComponent, ref, UnwrapRef, reactive } from "vue";
import axios from "@/plugins/axios";
import { message } from "ant-design-vue";
import { Icon } from "@/layouts/components/ICON.ts";
export default defineComponent({
  name: "添加标签",
  components: {
    Icon
  },
  setup() {
    const visible = ref<boolean>(false);
    const list = ref<string[]>([]);
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
        axios
          .post("/project/tag/item", {
            name: formState.name,
            projectId: "397761629303016448",
          })
          .then(() => {
            message.success("创建成功");
            visible.value = false;
            initData();
          });
      });
    };
    const closeTag = () => {
      console.log("111");
    };
    let initData = () => {
      const params = {
        projectId: "397761629303016448",
        page: 0,
        size: 10,
      };
      axios.get("project/tag/list", { params: params }).then((res: any) => {
        console.log(res, "resss");
        list.value = res.data.data;
      });
    };
    initData();
    return {
      visible,
      formRef,
      list,
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      formState,
      rules,
      addTag,
      closeTag,
      handleOk,
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '标签'
    icon: 'DashboardOutlined'
    layout: auth
</route>
<style scoped lang="scss">
.cont{
  margin-left:240px;
}
.add-tag{
  margin-bottom:20px;
}
.tag-list{
  .tag{
    display:flex;
    div{
      margin-bottom:10px;
      margin-right:10px;
    }
  }
}
</style>