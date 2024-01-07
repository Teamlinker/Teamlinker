<template>
  <div ref="root">
    <a-button @click="onAdd" type="primary" style="margin-bottom: 10px">{{$t("util.add")}}</a-button>
    <a-table :columns="columns" :data="data" :pagination="false">
      <template #operation="{record}">
        <template v-if="!record.reserved">
          <a-space wrap>
            <a-button type="primary" size="small" @click="onEdit(record)">{{$t("util.manage")}}</a-button>
            <a-button status="danger" size="small" @click="onDelete(record)">{{$t("util.delete")}}</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {ICommon_Model_Member_Tag} from "../../../../../../../common/model/member_tag";
import {apiOrganization} from "../../../../common/request/request";
import {Dialog} from "../../../../common/component/dialog/dialog";
import EditTag from "./editTag.vue";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";

const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    dataIndex:"name"
  },
  {
    title:t("util.description"),
    dataIndex:"description"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
const data=ref<ICommon_Model_Member_Tag[]>([])
const root=ref(null);
const appContext=getCurrentInstance().appContext
const search=async ()=>{
  let ret=await apiOrganization.listTag({})
  if(ret?.code==0) {
    data.value=ret.data
  }
}
const onAdd=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.setting.userTeam.tag.addTag"),markRaw(EditTag),{
    type:"add"
  })
  if(ret) {
    search();
  }
}
const onEdit=async (item:ICommon_Model_Member_Tag)=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.setting.userTeam.tag.editTag"),markRaw(EditTag),{
    type:"edit",
    item:item
  })
  if(ret) {
    search();
  }
}
const onDelete=async (item:ICommon_Model_Member_Tag)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteTag"))
  if(ret) {
    let res=await apiOrganization.removeTag({
      memberTagId:item.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      search()
    } else {
      Message.error(res.msg);
    }
  }
}

onBeforeMount(()=>{
  search();
})
</script>

<style scoped>

</style>