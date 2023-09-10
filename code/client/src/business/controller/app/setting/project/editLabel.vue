<template>
  <a-form :model="form" style="width: 80%" ref="eleForm">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {apiProject} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  type:"add"|"edit",
  item?:{
    id:string,
    name:string
  },
  projectId?:string
}>()
const form=reactive({
  name:props.type=="edit"?props.item.name:""
})
const {t}=useI18n()
const eleForm=ref(null)
onDialogOk(async ()=>{
  let isError=await eleForm.value.validate()
  if(isError) {
    return false
  }
  let res=await (props.type=="edit"?apiProject.editLabel({
    labelId:props.item.id,
    name:form.name
  }):apiProject.createLabel({
    projectId:props.projectId,
    name:form.name
  }))
  if(res?.code==0) {
    Message.success(t("tip.operationSuccess"))
    return true
  } else {
    Message.error(res.msg)
    return false;
  }
})
</script>

<style scoped>

</style>