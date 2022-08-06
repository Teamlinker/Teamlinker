<template>
  <div class="create-issue">
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

      fApi: {},
      value: { field1: "111", field2: "222", time: "11:11:11" },
      options: {
        onSubmit: (formData) => {
          // alert(JSON.stringify(formData));
          let res = formData;
          let resArr = [];
          for (let k in res) {
            resArr.push({
              fieldId: k.split("-")[1],
              value: res[k],
            });
          }
          axios
            .post("/issue/item/next", {
              projectIssueId: state.projectIssueId,
              workflowActionId: state.workflowActionId,
              value: resArr,
            })
            .then((res: any) => {
              if (res.code == "0") {
                openNotificationWithIcon("success");
              }
            });
        },
      },
      rule: [],
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
          // list = [
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203200",
          //       label_type: 0,
          //       name: "mllabel",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       description: null,
          //       icon: null,
          //       id: "6956860845087260672",
          //       multi: 1,
          //       name: "multi label",
          //       type: 1,
          //     },
          //     values: [],
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203201",
          //       label_type: 0,
          //       name: "label",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 2,
          //     },
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203203",
          //       label_type: 0,
          //       name: "text",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 3,
          //     },
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203204",
          //       label_type: 0,
          //       name: "area",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 4,
          //     },
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203205",
          //       label_type: 0,
          //       name: "select",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 5,
          //     },
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203206",
          //       label_type: 0,
          //       name: "msel",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 6,
          //     },
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203207",
          //       label_type: 0,
          //       name: "mllabel",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 7,
          //     },
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203208",
          //       label_type: 0,
          //       name: "dp",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 8,
          //     },
          //   },
          //   {
          //     field: {
          //       default_value: "",
          //       description: "",
          //       field_solution_id: "6959433445843927040",
          //       field_type_id: "6956860845087260672",
          //       id: "6959446439441203209",
          //       label_type: 0,
          //       name: "mllabel",
          //       optional: 1,
          //       sort: 0,
          //       weight: 50,
          //       workflow_id: "6956860843782832128",
          //       workflow_node_id: "6956860843896078336",
          //       workflow_solution_id: "6956860844638470144",
          //     },
          //     fieldType: {
          //       type: 9,
          //     },
          //   },
          // ];
          state.list = list;
          var html = "";
          var arr = [];
          for (let i = 0; i < list.length; i++) {
            let id = "tm" + i + "-" + list[i].field.id;
            if (list[i].fieldType.type == "1") {
              //multi label
              let val = list[i].field.default_value;
              arr.push({
                type: "input",
                title: list[i].field.name,
                field: id,
                value: val,
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
                props: {
                  type: "text",
                  disabled: true,
                },
              });
            } else if (list[i].fieldType.type == "2") {
              //label
              let val = list[i].field.default_value;
              arr.push({
                type: "input",
                title: list[i].field.name,
                field: id,
                value: val,
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
                props: {
                  type: "text",
                  disabled: true,
                },
              });
            } else if (list[i].fieldType.type == "3") {
              //text
              //text
              // html =
              //   html +
              //   `<div class='item'><span class='left'>${list[i].field.name}</span><input id='ele${list[i].field.id}' class='custom-text' type='text' /><div>`;
              // state.html = html;
              // state.rule.push({
              //   type: "text",
              //   fileId: "text" + i,
              //   title: "text",
              //   value: "pink",
              // });
              let val = list[i].field.default_value;
              arr.push({
                type: "input",
                title: list[i].field.name,
                field: id,
                value: val,
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
                props: {
                  type: "text",
                },
              });
            } else if (list[i].fieldType.type == "4") {
              //multi text
              let val = list[i].field.default_value;
              arr.push({
                type: "input",
                title: list[i].field.name,
                field: id,
                value: val,
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
                props: {
                  type: "textarea",
                },
              });
            } else if (list[i].fieldType.type == "5") {
              //select
              let option = [];
              let arrOption = list[i].values;
              for (let i = 0; i < arrOption.length; i++) {
                option.push({
                  value: arrOption[i].value,
                  label: arrOption[i].name,
                  disabled: false,
                });
              }
              let val = list[i].field.default_value;
              arr.push({
                type: "select",
                field: id,
                title: list[i].field.name,
                value: val,
                options: option,
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
                props: {
                  mode: "defalut",
                },
              });
            } else if (list[i].fieldType.type == "6") {
              //multi select
              let option = [];
              let arrOption = list[i].values;
              for (let i = 0; i < arrOption.length; i++) {
                option.push({
                  value: arrOption[i].value,
                  label: arrOption[i].name,
                  disabled: false,
                });
              }
              let val = list[i].field.default_value;
              arr.push({
                type: "select",
                field: id,
                title: list[i].field.name,
                value: [],
                options: option,
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
                props: {
                  mode: "multiple",
                },
              });
            } else if (list[i].fieldType.type == "7") {
              //timepicker
              arr.push({
                type: "timePicker",
                field: id,
                title: list[i].field.name,
                value: "",
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
              });
            } else if (list[i].fieldType.type == "8") {
              //datepicker
              arr.push({
                type: "datePicker",
                field: id,
                title: list[i].field.name,
                value: "",
                wrap: {
                  labelCol: { span: 6 },
                  wrapperCol: { span: 18 },
                },
              });
            } else if (list[i].fieldType.type == "9") {
              //datetimepicker
            }
          }
          state.rule = arr;
          console.log(arr);
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
        let obj: any = {};
        if (list[i].fieldType.type == "1") {
        } else if (list[i].fieldType.type == "2") {
        } else if (list[i].fieldType.type == "3") {
          obj.fieldId = list[i].field.id;
          obj.value = (
            document.getElementById(`ele${list[i].field.id}`) as any
          ).value;
          value.push(obj);
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
