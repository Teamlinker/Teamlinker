<template>
  <a-form :model="{}">
    <a-form-item :label="$t('util.tags')">
      <a-space wrap>
        <a-tag v-for="item in tagList" bordered color="arcoblue" checkable :checked="item.checked" @check="item.checked=!item.checked">{{item.name}}</a-tag>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {ICommon_Model_Member_Tag} from "../../../../../../../common/model/member_tag";
import {onBeforeMount, ref} from "vue";
import {apiOrganization} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  tags:ICommon_Model_Member_Tag[],
  organizationUserId:string
}>()
const tagList=ref<{
  id:string,
  name:string,
  checked:boolean
}[]>([])
const {t}=useI18n()
onBeforeMount(async ()=>{
  let res=await apiOrganization.listTag({});
  if(res?.code==0) {
    let userTagIds=props.tags.map(item=>item.id);
    tagList.value=res.data.map(item=>{
      return {
        id:item.id,
        name:item.name,
        checked:userTagIds.includes(item.id)
      }
    })
  }
})
onDialogOk(async ()=>{
  let res=await apiOrganization.setTagMember({
    memberId:props.organizationUserId,
    memberTagIds:tagList.value.filter(item=>item.checked).map(item=>item.id).join(",")
  })
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