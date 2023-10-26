<template>
  <div ref="root">
    <a-space>
      <a-input-search @search="onSearch" v-model="keyword" style="width: 300px" search-button :placeholder="$t('placeholder.typeProjectName')"></a-input-search>
      <a-button type="primary" @click="onBind">{{$t("util.bind")}}</a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #operation="{record}" v-if="!reserved">
        <a-button size="small" type="primary" status="danger" @click="onUnBind(record)">{{$t("util.revoke")}}</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiIssue, apiIssueType} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {ICommon_Model_Project} from "../../../../../../../common/model/project";
import EditBindProject from "./editBindProject.vue";
import ProjectSettingIssueSolutionConvert
	from "@/business/controller/app/project/setting/projectSettingIssueSolutionConvert.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  issueTypeSolutionId:string,
  reserved:number
}>()
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
let data=ref<DCSType<ICommon_Model_Project[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const search=async (page:number)=>{
  let res=await apiIssueType.solutionProjectList({
    issueTypeSolutionId:props.issueTypeSolutionId,
    size:pagination.pageSize,
    page:page-1,
    keyword:keyword.value
  })
  if(res?.code==0) {
    data.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  } else {
    Message.error(res.msg)
  }
}
const onPageChange=(page:number)=>{
  search(page)
}
const onSearch=()=>{
  search(1)
}
const onBind=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.bind"),markRaw(EditBindProject),{
    issueTypeSolutionId:props.issueTypeSolutionId
  })
  if(ret) {
    search(pagination.current);
  }
}
const onUnBind=async (item:DCSType<ICommon_Model_Project>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.unbindProjectFromIssueSolution"))
  if(ret) {
	  let res=await apiIssue.count({
		  projectId:item.id
	  })
	  if(res?.code==0) {
		  if(res.data.count==0) {
			  let res=await apiIssueType.solutionUnbindProject({
				  projectId:item.id
			  })
			  if(res?.code==0) {
				  Message.success(t("tip.deleteSuccess"))
				  search(pagination.current)
			  }
		  } else {
			  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingIssueSolution.issueTypeConvert"),markRaw(ProjectSettingIssueSolutionConvert),{
				  projectId:item.id,
				  originalIssueTypeSolutionId:props.issueTypeSolutionId
			  })
			  if(ret) {
				  search(pagination.current);
			  }
		  }
	  }
  }
}

onBeforeMount(()=>{
	search(pagination.current)
})
</script>

<style scoped>

</style>