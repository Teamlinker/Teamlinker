<template>
  <a-layout style="height: 100%">
    <a-layout-content class="issueProfileContent">
      <a-row style="color: grey" v-drag.shortcut="()=>({
				shortcutType:ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE,
				shortcutRefId:projectIssueId,
				shortcutName:key+'-'+info?.unique_id+' '+info?.name
      })">
        {{key+"-"+info?.unique_id}}
      </a-row>
      <a-row style="margin-top: 10px">
        <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.NAME" :value="info.name" v-if="info"></FieldEditBasic>
      </a-row>
	    <a-row v-if="info?.approval?.type===ECommon_Model_Project_Issue_Approval_Type.REJECTED" style="align-items: center;margin-top: 10px;">
		    <UserAvatar :organization-user-id="info.approval.approval_organization_user_id"></UserAvatar>
		    <span style="color: orange;font-weight: bold">&nbsp;{{$t("controller.app.project.issue.projectIssueHistory.rejectedYourApproval")}}</span>
		    <a-popover v-if="info.approval.reason" position="right">
			    <icon-info-circle-fill style="color: orange;margin-left: 10px"></icon-info-circle-fill>
			    <template #content>
						<RichEditor style="color: black" :model-value="JSON.parse(info.approval.reason)" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
			    </template>
		    </a-popover>
	    </a-row>
      <a-row style="margin-top: 20px">
        <a-space wrap>
          <a-dropdown>
            <a-button :disabled="actionList.length==0" :type="info?.workflowNode.status===ECommon_Model_Workflow_Node_Status.NOTSTART?'secondary':'primary'" :status="info?.approval?.type===ECommon_Model_Project_Issue_Approval_Type.REJECTED?'danger':info?.workflowNode.status===ECommon_Model_Workflow_Node_Status.DONE?'success':'normal'">{{calculateApprovalName}}&nbsp;&nbsp;<icon-down></icon-down>
            </a-button>
            <template #content>
              <a-doption v-for="item in actionList as any[]" :key="item.isApproval?item.type:item.id" @click="onAction(item)">{{item.isApproval?approvalMap[item.type]:item.name}}</a-doption>
            </template>
          </a-dropdown>
	        <a-button v-if="!parentIssue" @click="onCreateSubIssue">
		        {{$t("controller.app.project.issue.projectIssueProfile.createChildIssue")}}
	        </a-button>
          <a-dropdown-button>
	          {{$t("controller.app.project.issue.projectIssueProfile.linkIssue")}}
            <template #icon>
              <icon-down />
            </template>
            <template #content>
              <a-doption @click="onAddItem('related')">{{$t("controller.app.project.issue.projectIssueProfile.related")}}</a-doption>
              <a-doption @click="onAddItem('child')">{{$t("controller.app.project.issue.projectIssueProfile.child")}}</a-doption>
              <a-doption @click="onAddItem('parent')">{{$t("controller.app.project.issue.projectIssueProfile.parent")}}</a-doption>
            </template>
          </a-dropdown-button>
          <a-dropdown>
            <a-button>
              <template #icon>
                <icon-more></icon-more>
              </template>
            </a-button>
            <template #content>
	            <a-popover trigger="hover" position="rt" @popup-visible-change="showQuickMeeting">
		            <a-doption>{{$t("controller.app.project.issue.projectIssueProfile.quickMeeting")}}</a-doption>
		            <template #content>
			            <a-row style="flex-direction: column;align-items: center">
				            <a-input size="small" :placeholder="$t('placeholder.typeUserName')" v-model="searchUserKey"></a-input>
				            <a-table style="width: 100%;margin-top: 10px" row-key="id" :columns="columns" :data="issueRelatedUserList.filter(item=>(item.id!==organizationUserId && item.name.includes(searchUserKey)))" :row-selection="rowSelection" v-model:selected-keys="selectKeys" :pagination="false">
					            <template #name="{record}">
						            <UserAvatar :organization-user-id="record.id" :name="record.name" :photo="record.photo"></UserAvatar>
					            </template>
				            </a-table>
				            <a-button type="primary" style="margin-top: 10px" size="small" @click="onMeeting">{{$t("util.invite")}}</a-button>
			            </a-row>
		            </template>
	            </a-popover>
	            <a-doption v-if="checkPermission(permission,Permission_Types.Project.EDIT)" @click="onCopy">{{$t("util.copy")}}</a-doption>
	            <a-doption v-if="checkPermission(permission,Permission_Types.Project.EDIT)" @click="onConvert">{{$t("util.convert")}}</a-doption>
              <a-doption v-if="checkPermission(permission,Permission_Types.Project.DELETE) || info?.created_by.id===store.userInfo.id" @click="onDelete" style="color: red">{{$t("util.delete")}}</a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </a-row>
      <a-row style="margin-top: 20px;font-weight: bold">
	      {{$t("util.description")}}
      </a-row>
      <a-row style="margin-top: 10px">
        <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.DESCRIPTION" :value="description" style="margin-right: 10px;box-sizing: border-box"></FieldEditBasic>
      </a-row>
	    <ProjectIssueRelated :project-issue-id="projectIssueId" :child-issue-list="childIssueList" :parent-issue="parentIssue" :related-issue-list="relatedIssueList" @remove-parent="parentIssue=null"></ProjectIssueRelated>
	    <a-tabs type="rounded" style="margin-top: 50px;" lazy-load size="small">
		    <a-tab-pane key="comment" :title="$t('util.comments')">
			    <ProjectIssueComment style="margin-top: 10px" :project-issue-id="projectIssueId"></ProjectIssueComment>
		    </a-tab-pane>
		    <a-tab-pane key="history" :title="$t('util.history')">
					<ProjectIssueHistory :project-issue-id="projectIssueId"></ProjectIssueHistory>
		    </a-tab-pane>
	    </a-tabs>
    </a-layout-content>
    <a-layout-sider :resize-directions="['left']" :width="200" style="overflow-y: auto">
      <ProjectIssueField :label-list="labelList" :module-list="moduleList" :field-list="fieldList" :info="info" v-if="info" style="margin: 5px 5px 0px 5px"></ProjectIssueField>
    </a-layout-sider>
  </a-layout>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance, inject, markRaw, onBeforeMount, ref, watch} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {apiIssue, apiMeeting} from "../../../../common/request/request";
import {
	ICommon_Route_Res_ProjectIssue_BasicInfo,
	ICommon_Route_Res_ProjectIssue_fieldsInfo
} from "../../../../../../../common/routes/response";
import FieldEditBasic from "../../../../common/component/field/fieldEditBasic.vue";
import {EClient_Field_Basic_Type} from "../../../../common/component/field/fieldBasicType";
import {ICommon_Model_Project_Label} from "../../../../../../../common/model/project_label";
import {ICommon_Model_Project_Module} from "../../../../../../../common/model/project_module";
import {ICommon_Model_Project_Issue} from "../../../../../../../common/model/project_issue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import ProjectIssueBind from "./projectIssueBind.vue";
import {Message} from "@arco-design/web-vue";
import {useDesktopStore} from "../../../desktop/store/desktop";
import {checkPermission, Permission_Types} from "../../../../../../../common/permission/permission";
import {ICommon_Model_Workflow_Action} from "../../../../../../../common/model/workflow_action";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import ProjectIssueNext from "./projectIssueNext.vue";
import {vDrag} from "../../../../../teamOS/common/directive/drag";
import UserAvatar from "../../../../common/component/userAvatar.vue";
import {SessionStorage} from "../../../../common/storage/session";
import {TableRowSelection} from "@arco-design/web-vue/es/table/interface";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {ECommon_Model_Organization_Member_Type} from "../../../../../../../common/model/organization";
import ProjectIssueComment from "./projectIssueComment.vue";
import ProjectIssueField from "./projectIssueField.vue";
import ProjectIssueRelated from "./projectIssueRelated.vue";
import ProjectIssueHistory from "./projectIssueHistory.vue";
import {
	ECommon_Model_Project_Issue_Approval_Action,
	ECommon_Model_Project_Issue_Approval_Type
} from "../../../../../../../common/model/project_issue_approval";
import RichEditor from "@/business/common/component/richEditor/richEditor.vue";
import {ECommon_Content_Line_Config_Type} from "../../../../../../../common/model/content";
import {RichEditorEventHandle} from "@/business/common/component/richEditorEventHandle";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../../common/model/finder_item";
import ProjectIssueConvert from "@/business/controller/app/project/issue/projectIssueConvert.vue";
import {useI18n} from "vue-i18n";
import {DCSType, ECommon_User_Online_Status} from "../../../../../../../common/types";

const props=defineProps<{
  projectIssueId:string
}>()
const navigator=getCurrentNavigator();
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const projectId=inject(injectProjectInfo).id
const key=inject(injectProjectInfo).key
const permission=inject(injectProjectInfo).permission
const info=ref<DCSType<ICommon_Route_Res_ProjectIssue_BasicInfo>>()
const description=ref("")
const parentIssue=ref<DCSType<ICommon_Model_Project_Issue>>();
const relatedIssueList=ref<DCSType<ICommon_Model_Project_Issue>[]>([])
const childIssueList=ref<DCSType<ICommon_Model_Project_Issue>[]>([])
const moduleList=ref<DCSType<ICommon_Model_Project_Module>[]>([])
const	labelList=ref<DCSType<ICommon_Model_Project_Label>[]>([])
const actionList=ref<DCSType<ICommon_Model_Workflow_Action>[] | {
	isApproval:true,
	type:ECommon_Model_Project_Issue_Approval_Action
}[]>([])
const fieldList=ref<ICommon_Route_Res_ProjectIssue_fieldsInfo[]>([])
const store=useDesktopStore()
const issueRelatedUserList=ref<{
	id:string,
	name:string,
	photo:string
}[]>([])
const searchUserKey=ref("")
const organizationUserId=SessionStorage.get("organizationUserId")
const selectKeys=ref([])
const rowSelection=ref<TableRowSelection>({
	type:"checkbox",
	showCheckedAll:true,
	onlyCurrent:false
})
const {t}=useI18n()
const approvalMap={
	[ECommon_Model_Project_Issue_Approval_Action.COMMIT]:t("util.commit"),
	[ECommon_Model_Project_Issue_Approval_Action.RESOLVE]:t("util.resolve"),
	[ECommon_Model_Project_Issue_Approval_Action.REJECT]:t("util.reject"),
	[ECommon_Model_Project_Issue_Approval_Action.REVOKE]:t("util.revoke")
}
const columns = [
	{
		title: t("util.name"),
		slotName: 'name',
	}
]
const getInfo=async ()=>{
  let res=await apiIssue.basicInfo({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    info.value=res.data
  } else {
		Message.error(res.msg)
  }
}
watch([key,info],()=>{
  navigator.setCurrentPath(key.value+"-"+info.value?.unique_id)
})
const getDescription=async ()=>{
  let res=await apiIssue.descriptionInfo({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    description.value=res.data?res.data:"[]"
  }
}
const getOtherInfo=async ()=>{
  let res=await apiIssue.otherInfoList({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    labelList.value=res.data.labels
    moduleList.value=res.data.modules
    parentIssue.value=res.data.parent
    childIssueList.value=res.data.children
    relatedIssueList.value=res.data.relateds
  }
}

const onAddItem=async (type:"parent"|"child"|"related")=>{
  if(type=="parent") {
    let ret=await Dialog.open(root.value,appContext,t("controller.app.project.issue.projectIssueProfile.parent"),markRaw(ProjectIssueBind),{
      projectId:projectId,
      projectKey:key.value
    })
    if(ret) {
      let res=await apiIssue.addParentIssue({
        projectIssueId:props.projectIssueId,
        projectIssueParentId:ret as string
      })
      if(res?.code==0) {
        getOtherInfo()
      } else {
        Message.error(res.msg)
      }
    }
  } else if(type=="child") {
    let ret=await Dialog.open(root.value,appContext,t("controller.app.project.issue.projectIssueProfile.child"),markRaw(ProjectIssueBind),{
      projectId:projectId,
      projectKey:key.value
    })
    if(ret) {
      let res=await apiIssue.addChildIssue({
        projectIssueId:props.projectIssueId,
        projectIssueChildId:ret as string
      })
      if(res?.code==0) {
        getOtherInfo()
      } else {
        Message.error(res.msg)
      }
    }
  } else if(type=="related") {
    let ret=await Dialog.open(root.value,appContext,t("controller.app.project.issue.projectIssueProfile.related"),markRaw(ProjectIssueBind),{
      projectId:projectId,
      projectKey:key.value
    })
    if(ret) {
      let res=await apiIssue.addRelatedIssue({
        projectIssueId:props.projectIssueId,
        projectIssueRelatedId:ret as string
      })
      if(res?.code==0) {
        getOtherInfo()
      } else {
        Message.error(res.msg)
      }
    }
  }
}

const onDelete=async ()=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteIssue"))
  if(ret) {
    let res=await apiIssue.remove({
      projectIssueId:props.projectIssueId
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      navigator.pop()
    }
  }
}
const getActionList=async ()=>{
  let res=await apiIssue.actionsInfo({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    actionList.value=res.data
  }
}
const onAction=async (item:ICommon_Model_Workflow_Action | {
	isApproval:true,
	type:ECommon_Model_Project_Issue_Approval_Action
})=>{
	if("isApproval" in item) {
		if(item.type===ECommon_Model_Project_Issue_Approval_Action.REVOKE) {
			let res=await apiIssue.revokeApproval({
				projectIssueId:props.projectIssueId
			})
			if(res?.code!=0) {
				Message.error(res.msg)
				return
			}
		} else if(item.type===ECommon_Model_Project_Issue_Approval_Action.RESOLVE) {
			let res=await apiIssue.resolveApproval({
				projectIssueId:props.projectIssueId
			})
			if(res?.code!=0) {
				Message.error(res.msg)
				return
			}
		} else if(item.type===ECommon_Model_Project_Issue_Approval_Action.REJECT) {
			let ret:any=await Dialog.inputRich(root.value,appContext,t("tip.rejectReason"))
			if(ret) {
				let res=await apiIssue.rejectApproval({
					projectIssueId:props.projectIssueId,
					reason:JSON.stringify(ret.map(item=>{
						return {
							arr:item.arr
						}
					}))
				})
				if(res?.code!=0) {
					Message.error(res.msg)
					return
				}
			} else {
				return
			}
		} else if(item.type===ECommon_Model_Project_Issue_Approval_Action.COMMIT) {
			let res=await apiIssue.commitApproval({
				projectIssueId:props.projectIssueId
			})
			if(res?.code!=0) {
				Message.error(res.msg)
				return
			}
		}
	} else {
		let res=await apiIssue.getNextNodeFields({
			projectIssueId:props.projectIssueId,
			workflowActionId:item.id
		})
		if(res?.code==0) {
			if(res.data.length>0) {
				let ret=await Dialog.open(root.value,appContext,item.name,markRaw(ProjectIssueNext),{
					projectId:projectId,
					projectIssueId:props.projectIssueId,
					workflowActionId:item.id,
					items:res.data
				})
				if(!ret) {
					return
				}
			} else {
				await apiIssue.confirmNextNode({
					projectIssueId:props.projectIssueId,
					workflowActionId:item.id
				})
			}
		} else {
			Message.error(res.msg)
			return
		}
	}
	getInfo()
	getActionList()
	getFieldList()
}

const onMeeting=async ()=>{
	let res=await apiMeeting.getPersonalRoom()
	if(res?.code===0) {
		if(store.status===ECommon_User_Online_Status.MEETING) {
			eventBus.emit(EClient_EVENTBUS_TYPE.MEETING_INVITE,selectKeys.value.map(item=>({
				id:item,
				type:ECommon_Model_Organization_Member_Type.USER
			})))
		} else {
			eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,res.data.id,res.data.password,selectKeys.value.map(item=>({
				id:item,
				type:ECommon_Model_Organization_Member_Type.USER
			})))
		}
	}
}

const onCopy=async ()=>{
	let ret=await Dialog.input(root.value,appContext,t("tip.typeIssueName"))
	if(ret) {
		let res=await apiIssue.copy({
			projectIssueId:props.projectIssueId,
			name:ret
		})
		if(res?.code==0) {
			eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,res.data.id);
		}
	}
}

const onConvert=async ()=>{
	let ret=await Dialog.open(root.value,appContext,t("util.convert"),markRaw(ProjectIssueConvert),{
		projectId:projectId,
		projectIssueId:props.projectIssueId,
		issueTypeId:info.value.issueType.id
	})
	if(ret) {
		getInfo()
		getActionList()
		getFieldList()
	}
}

const onCreateSubIssue=async ()=>{
	let ret=await Dialog.input(root.value,appContext,t("tip.typeIssueName"))
	if(ret) {
		let res=await apiIssue.createChildIssue({
			projectIssueId:props.projectIssueId,
			name:ret
		})
		if(res?.code==0) {
			getOtherInfo()
			eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,res.data.id)
		}
	}
}

const showQuickMeeting=async ()=>{
	let res=await apiIssue.issueRelatedUsers({
		projectIssueId:props.projectIssueId
	})
	if(res?.code==0) {
		issueRelatedUserList.value=res.data
	}
}

const getFieldList=async ()=>{
	let res=await apiIssue.fieldsInfo({
		projectIssueId:props.projectIssueId
	})
	if(res?.code==0) {
		fieldList.value=res.data
	}
}

const calculateApprovalName=computed(()=>{
	if(info.value) {
		if(info.value.approval) {
			if(info.value.approval.type===ECommon_Model_Project_Issue_Approval_Type.PENDING) {
				return `${info.value.approval.workflowNode.name}(${t("util.waitForApproval")})`
			} else if(info.value.approval.type===ECommon_Model_Project_Issue_Approval_Type.RESOLVED) {
				return info.value.workflowNode.name
			} else if(info.value.approval.type===ECommon_Model_Project_Issue_Approval_Type.REJECTED) {
				return `${info.value.approval.workflowNode.name}(${t("util.rejected")})`
			}
		} else {
			return info.value.workflowNode.name
		}
	} else {
		return ""
	}
})

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

onBeforeMount(()=>{
  getInfo()
  getDescription()
  getOtherInfo()
  getActionList()
	getFieldList()
})
</script>

<style scoped>
.issueProfileContent :deep .arco-comment-actions {
  margin-top: 0px;
}
</style>