<template>
<div>
    111
    <form-create
      :rule="rule"
      v-model:api="fApi"
      :option="options"
      v-model="value"
    />
</div>
</template>
<script lang="ts">

import { defineComponent, reactive, toRefs, ref, inject } from "vue";
import axios from "@/plugins/axios";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { notification } from "ant-design-vue";
import formCreate from "@form-create/ant-design-vue";
export default defineComponent({
   components: {
    
  },
  setup() {
    const state: any = reactive({
      html: "",
      fApi: {},
      value: { field1: "111", field2: "222", time: "11:11:11" },
      options: {
        onSubmit: (formData) => {
          alert(JSON.stringify(formData));
        },
      },
      rule: [
        { type: "input", field: "field1", title: "field1", value: "aaa" },
        { type: "input", field: "field2", title: "field2", value: "sss" },
        { type: "timePicker", field: "time", title: "time", value: "12:12:12" },
        {
          type: "ElButton",
          title: "修改 field1",
          native: false,
          on: {
            click: () => {
              // this.rule[0].value += "a";
            },
          },
          children: ["点击"],
        },
      ],
    });

      return {
      ...toRefs(state),
    };
  },
})
</script>

<route lang="yaml">
  meta:
    level: 1
    type: 'proside'
    name: '项目看板'
    layout: auth
</route>