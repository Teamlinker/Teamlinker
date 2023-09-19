<template>
  <a-form ref="eleForm" style="width: 80%" :model="form">
    <a-form-item :label="$t('util.name')" field="name" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item :label="$t('util.color')" field="color" required>
      <a-radio-group v-model="form.color">
        <a-radio v-for="item in ECommon_Calendar_Color" :value="item">
          <div :style="{backgroundColor:item}" style="display: inline-block;width: 14px;height: 14px;margin-top: 3px;border-radius: 2px"></div>
        </a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {apiCalendar} from "../../../common/request/request";
import {ECommon_Calendar_Color, ICommon_Model_Calendar} from "../../../../../../common/model/calendar";
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
  type:"edit"|"add",
  item?:DCSType<ICommon_Model_Calendar>
}>()
const eleForm=ref()
const form = reactive({
  name: props.type=="edit"?props.item.name:"",
  color: props.type=="edit"?props.item.color:ECommon_Calendar_Color.BLUE
})
onDialogOk(dialogFuncGenerator({
  func: () => {
    return props.type=="edit"?apiCalendar.editCalendar({
      calendarId:props.item.id,
      color:form.color,
      name:form.name
    }):apiCalendar.addCalendar({
      name:form.name,
      color:form.color
    })
  },
  form: () => {
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>