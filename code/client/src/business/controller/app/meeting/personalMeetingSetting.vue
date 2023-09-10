
<template>
  <a-form :model="form" auto-label-width ref="formEle">
      <a-form-item field="id" :label="$t('util.meetingId')">
          {{form.id}}
      </a-form-item>
      <a-form-item field="password" :label="$t('util.meetingPassword')" required>
          <a-input v-model="form.password"></a-input>
      </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiMeeting} from "../../../common/request/request";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";

const formEle=ref()
const form=reactive({
    id:"",
    password:""
})

const getPersonalMeeting=async ()=>{
    let res=await apiMeeting.getPersonalRoom()
    if(res?.code==0) {
        form.id=res.data.id
        form.password=res.data.password
    }
}

onBeforeMount(()=>{
    getPersonalMeeting()
})

onDialogOk(dialogFuncGenerator({
    form:()=>formEle.value,
    func:()=>apiMeeting.editRoom({
        meetingRoomId:form.id,
        password:form.password
    })
}))
</script>

<style scoped>

</style>