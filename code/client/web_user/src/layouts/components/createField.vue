<template>
  <div class="create-field" :style="{marginBottom:rule.length?'-70px':''}">
    <form-create
      :rule="rule"
      v-model:api="fApi"
      :option="options"
      v-model="value"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, inject, watch } from 'vue'
import axios from '@/plugins/axios'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import formCreate from '@form-create/ant-design-vue'
interface FormState {
  name: string
}
export default defineComponent({
  emits: ['hideIssueModal'],
  props: ['issueField'],
  setup(props, content) {
    const state: any = reactive({
      html: '',
      workflowActionId: props.workflowActionId,
      projectIssueId: props.projectIssueId,
      list: '',
      fApi: {},
      value: { field1: '111', field2: '222', time: '11:11:11' },
      options: {
        onSubmit: (formData) => {
          let res = formData
          let resArr = []
          for (let k in res) {
            resArr.push({
              fieldId: k.split('-')[1],
              value: res[k]
            })
          }
        }
      },
      rule: []
    })

    const getField = (list) => {
      state.list = list
      var html = ''
      var arr = []
      for (let i = 0; i < list.length; i++) {
        let id = 'tm' + i + '-' + list[i].field.id
        if (list[i].fieldType.type == '1') {
          //multi label
          let val = list[i].field.default_value
          arr.push({
            type: 'input',
            title: list[i].field.name,
            field: id,
            value: val,
            wrap: {
              labelCol: { span: 4 },
              wrapperCol: { span: 14 }
            },
            props: {
              type: 'text',
              disabled: true
            }
          })
        } else if (list[i].fieldType.type == '2') {
          //label
          let val = list[i].field.default_value
          arr.push({
            type: 'input',
            title: list[i].field.name,
            field: id,
            value: val,
            wrap: {
              labelCol: { span: 4 },
              wrapperCol: { span: 14 }
            },
            props: {
              type: 'text',
              disabled: true
            }
          })
        } else if (list[i].fieldType.type == '3') {
          let val = list[i].field.default_value
          arr.push({
            type: 'input',
            title: list[i].field.name,
            field: id,
            value: val,
            wrap: {
              labelCol: { span: 4},
              wrapperCol: { span: 14 }
            },
            props: {
              type: 'text'
            }
          })
        } else if (list[i].fieldType.type == '4') {
          //multi text
          let val = list[i].field.default_value
          arr.push({
            type: 'input',
            title: list[i].field.name,
            field: id,
            value: val,
            wrap: {
              labelCol: { span: 4 },
              wrapperCol: { span: 14 }
            },
            props: {
              type: 'textarea'
            }
          })
        } else if (list[i].fieldType.type == '5') {
          //select
          let option = []
          let arrOption = list[i].values
          for (let i = 0; i < arrOption.length; i++) {
            option.push({
              value: arrOption[i].value,
              label: arrOption[i].name,
              disabled: false
            })
          }
          let val = list[i].field.default_value
          arr.push({
            type: 'select',
            field: id,
            title: list[i].field.name,
            value: val,
            options: option,
            wrap: {
              labelCol: { span: 4 },
              wrapperCol: { span: 14 }
            },
            props: {
              mode: 'defalut'
            }
          })
        } else if (list[i].fieldType.type == '6') {
          //multi select
          let option = []
          let arrOption = list[i].values
          for (let i = 0; i < arrOption.length; i++) {
            option.push({
              value: arrOption[i].value,
              label: arrOption[i].name,
              disabled: false
            })
          }
          let val = list[i].field.default_value
          arr.push({
            type: 'select',
            field: id,
            title: list[i].field.name,
            value: [],
            options: option,
            wrap: {
              labelCol: { span: 4 },
              wrapperCol: { span: 14 }
            },
            props: {
              mode: 'multiple'
            }
          })
        } else if (list[i].fieldType.type == '7') {
          //timepicker
          arr.push({
            type: 'timePicker',
            field: id,
            title: list[i].field.name,
            value: '',
            wrap: {
              labelCol: { span: 4 },
              wrapperCol: { span: 14 }
            }
          })
        } else if (list[i].fieldType.type == '8') {
          //datepicker
          arr.push({
            type: 'datePicker',
            field: id,
            title: list[i].field.name,
            value: '',
            wrap: {
              labelCol: { span: 4 },
              wrapperCol: { span: 14 }
            }
          })
        } else if (list[i].fieldType.type == '9') {
          //datetimepicker
        }
      }
      state.rule = arr
      console.log(arr)
    }
    watch(
      () => props.issueField,
      (newValue) => {
        getField(newValue)
      }
    )
    const openNotificationWithIcon = (type: string) => {
      notification[type]({
        message: 'success',
        description: 'success'
      })
    }
    const onSubmit = () => {
      return state.fApi.submit((formData, fapi) => {
        console.log(formData, 'formData11111')

       
      })
    }

    return {
      ...toRefs(state),
      onSubmit
    }
  }
})
</script>
<route lang="yaml">
  meta:
    level: 1
    type: 'proside'
    name: '事务详情'
    layout: auth
</route>
<style lang="scss">
.create-field {
  .ant-btn {
      display:none !important;
  }
}
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
