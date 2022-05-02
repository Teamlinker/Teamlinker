<template>
  <div class="create-issue">
    <div v-html="html"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, inject } from "vue";
import axios from "@/plugins/axios";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { notification } from "ant-design-vue";
interface FormState {
  name: string;
}
export default defineComponent({
  emits: ["hideIssueModal"],
  props: ["workflowActionId", "projectIssueId"],
  setup(props, content) {
    const state: any = reactive({
      html: "",
      workflowActionId: props.workflowActionId,
      projectIssueId: props.projectIssueId,
      list: "",
    });

    const getField = () => {
      axios
        .get("/issue/item/next", {
          params: {
            projectIssueId: state.projectIssueId,
            workflowActionId: state.workflowActionId,
          },
        })
        .then((res: any) => {
          //   [
          //       {"id":"6926817707836833800","name":"datepicker","icon":null,"description":null,"multi":0,"type":8},
          //       {"id":"6926817707836833801","name":"datetimepicker","icon":null,"description":null,"multi":0,"type":9},
          //       {"id":"6926817707836833792","name":"label","icon":null,"description":null,"multi":0,"type":2},
          //       {"id":"6926817707836833793","name":"multi label","icon":null,"description":null,"multi":1,"type":1},
          //       {"id":"6926817707836833797","name":"multi select","icon":null,"description":null,"multi":1,"type":6},
          //       {"id":"6926817707836833795","name":"multi text","icon":null,"description":null,"multi":0,"type":4},
          //       {"id":"6926817707836833796","name":"select","icon":null,"description":null,"multi":0,"type":5},
          //       {"id":"6926817707836833798","name":"switch","icon":null,"description":null,"multi":0,"type":0},
          //       {"id":"6926817707836833794","name":"text","icon":null,"description":null,"multi":0,"type":3},
          //       {"id":"6926817707836833799","name":"timepicker","icon":null,"description":null,"multi":0,"type":7}
          //   ]
          let list = res.data;
          state.list = list;
          var html = "";
          for (let i = 0; i < list.length; i++) {
            if (list[i].fieldType.type == "1") {
            } else if (list[i].fieldType.type == "2") {
            } else if (list[i].fieldType.type == "3") {
              html =
                html +
                `<div class='item'><span class='left'>${list[i].field.name}</span><input id='ele${list[i].field.id}' class='custom-text' type='text' /><div>`;
              state.html = html;
            } else if (list[i].fieldType.type == "4") {
            } else if (list[i].fieldType.type == "5") {
            } else if (list[i].fieldType.type == "6") {
            } else if (list[i].fieldType.type == "7") {
            } else if (list[i].fieldType.type == "8") {
            } else if (list[i].fieldType.type == "9") {
            }
          }
        });
    };
    getField();
    const openNotificationWithIcon = (type: string) => {
      notification[type]({
        message: "success",
        description: "success",
      });
    };
    const onSubmit = () => {
      let list = state.list;
      let value = [];
      for (let i = 0; i < list.length; i++) {
        let obj:any = {}
        if (list[i].fieldType.type == "1") {
        } else if (list[i].fieldType.type == "2") {
        } else if (list[i].fieldType.type == "3") {
          obj.fieldId = list[i].field.id
          obj.value = (document.getElementById(`ele${list[i].field.id}`) as any).value
          value.push(obj)
        } else if (list[i].fieldType.type == "4") {
        } else if (list[i].fieldType.type == "5") {
        } else if (list[i].fieldType.type == "6") {
        } else if (list[i].fieldType.type == "7") {
        } else if (list[i].fieldType.type == "8") {
        } else if (list[i].fieldType.type == "9") {
        }
      }
      axios
        .post("/issue/item/next", {
          projectIssueId: state.projectIssueId,
          workflowActionId: state.workflowActionId,
          value: value,
        })
        .then((res: any) => {
          if (res.code == "0") {
            openNotificationWithIcon("success");
          }
        });
    };
    return {
      ...toRefs(state),
      onSubmit,
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    type: 'proside'
    name: '事务详情'
    layout: auth
</route>
<style scoped>
.create-issue {
  margin-top: 50px;
}
</style>
<style lang="scss">
.custom-text {
  border: 1px solid #ccc;
}
.item {
  padding: 10px;
  .left {
    display: inline-block;
    width: 150px;
    text-align: right;
    margin-right: 5px;
  }
}
</style>
