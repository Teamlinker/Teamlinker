<template>
  <a-layout style="height: 100%">
    <a-layout-content id="issueProfileContent">
      <a-row style="color: gray">
        {{key+"-"+info?.unique_id}}
      </a-row>
      <a-row style="margin-top: 10px">
        <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.NAME" :value="info.name" v-if="info"></FieldEditBasic>
      </a-row>
      <a-row style="margin-top: 10px">
        <a-space>
          <a-dropdown>
            <a-button :disabled="actionList.length==0" :type="info?.workflowNode.status===ECommon_Model_Workflow_Node_Status.NOTSTART?'secondary':'primary'" :status="info?.workflowNode.status===ECommon_Model_Workflow_Node_Status.DONE?'success':'normal'">{{info?.workflowNode.name}}&nbsp;&nbsp;<icon-down></icon-down>
            </a-button>
            <template #content>
              <a-doption v-for="item in actionList" :key="item.id" @click="onAction(item)">{{item.name}}</a-doption>
            </template>
          </a-dropdown>
          <a-dropdown-button>
            Link Issue
            <template #icon>
              <icon-down />
            </template>
            <template #content>
              <a-doption @click="onAddItem('related')">Related</a-doption>
              <a-doption @click="onAddItem('child')">Child</a-doption>
              <a-doption @click="onAddItem('parent')">Parent</a-doption>
            </template>
          </a-dropdown-button>
          <a-dropdown>
            <a-button>
              <template #icon>
                <icon-more></icon-more>
              </template>
            </a-button>
            <template #content>
              <a-doption v-if="checkPermission(permission,Permission_Types.Project.ADMIN) || info.created_by.id===store.userInfo.id" @click="onDelete" style="color: red">Delete</a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </a-row>
      <a-row style="margin-top: 20px;font-weight: bold">
        Description
      </a-row>
      <a-row style="margin-top: 10px">
        <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.DESCRIPTION" :value="description"></FieldEditBasic>
      </a-row>
      <template v-if="parentIssue">
        <a-row style="margin-top: 20px;font-weight: bold">Parent Issue</a-row>
        <a-list style="margin-top: 10px;margin-right: 10px" size="small" hoverable>
          <a-list-item>
            <a-space size="large">
              {{key+"-"+parentIssue.unique_id}}
              <a-link href="javascript:void(0)">{{parentIssue.name}}</a-link>
              <FieldPriority :priority="parentIssue.priority"></FieldPriority>
            </a-space>
            <template #actions>
              <a-button type="text" size="mini" @click="onRemoveItem('parent')">
                <template #icon>
                  <icon-close style="color: red"></icon-close>
                </template>
              </a-button>
            </template>
          </a-list-item>
        </a-list>
      </template>
      <template v-if="childIssueList.length>0">
        <a-row style="margin-top: 20px;font-weight: bold">Child Issues</a-row>
        <a-list style="margin-top: 10px;margin-right: 10px" size="small" hoverable>
          <a-list-item v-for="(item,index) in childIssueList" :key="item.id">
            <a-space size="large">
              {{key+"-"+item.unique_id}}
              <a-link href="javascript:void(0)">{{item.name}}</a-link>
              <FieldPriority :priority="item.priority"></FieldPriority>
            </a-space>
            <template #actions>
              <a-button type="text" size="mini" @click="onRemoveItem('child',index)">
                <template #icon>
                  <icon-close style="color: red"></icon-close>
                </template>
              </a-button>
            </template>
          </a-list-item>
        </a-list>
      </template>
      <template v-if="relatedIssueList.length>0">
        <a-row style="margin-top: 20px;font-weight: bold">Related Issues</a-row>
        <a-list style="margin-top: 10px;margin-right: 10px" size="small" hoverable>
          <a-list-item v-for="(item,index) in relatedIssueList" :key="item.id">
            <a-space size="large">
              {{key+"-"+item.unique_id}}
              <a-link href="javascript:void(0)">{{item.name}}</a-link>
              <FieldPriority :priority="item.priority"></FieldPriority>
            </a-space>
            <template #actions>
              <a-button type="text" size="mini" @click="onRemoveItem('related',index)">
                <template #icon>
                  <icon-close style="color: red"></icon-close>
                </template>
              </a-button>
            </template>
          </a-list-item>
        </a-list>
      </template>
      <a-row style="margin-top: 50px;font-weight: bold">Comments</a-row>
      <a-comment v-for="(item,index) in commentList" :author="item.value.created_by.nickname" :datetime="moment(item.value.created_time).format('YYYY-MM-DD HH:mm:ss')" :avatar="item.value.created_by.photo" style="margin-right: 10px">
        <template #content>
          <template v-if="!item.isEdit">
            {{item.value.content}}
          </template>
          <template v-else>
            <a-textarea allow-clear v-model="item.editContent"></a-textarea>
          </template>
        </template>
        <template #actions v-if="checkPermission(permission,Permission_Types.Project.ADMIN) || item.value.created_by.id==store.userInfo.id">
          <template v-if="!item.isEdit">
            <a-link href="javascript:void(0)" style="color: gray;font-size: 13px;padding: 0px" @click="item.isEdit=true">
              Edit
            </a-link>
            <a-link href="javascript:void(0)" style="color: gray;font-size: 13px;padding: 0px" @click="onRemoveComment(index)">
              Delete
            </a-link>
          </template>
          <template v-else>
            <a-button type="text" @click="onEditComment(item)">
              <template #icon>
                <icon-check></icon-check>
              </template>
            </a-button>
            <a-button type="text" @click="item.editContent='',item.isEdit=false">
              <template #icon>
                <icon-close style="color: red"></icon-close>
              </template>
            </a-button>
          </template>
        </template>
      </a-comment>
      <a-comment :avatar="store.userInfo.photo" style="margin-right: 10px">
        <template #content>
          <a-textarea placeholder="please type your comment" v-model="commentAdd"></a-textarea>
        </template>
        <template #actions>
          <a-button type="primary" size="small" @click="onCommentAdd">Save</a-button>
        </template>
      </a-comment>
    </a-layout-content>
    <a-layout-sider :resize-directions="['left']" :width="200" style="overflow-y: auto">
      <a-collapse :default-active-key="['detail']" style="margin: 5px 5px 0px 5px" id="issueProfileDetail">
        <a-collapse-item key="detail" header="Detail">
          <a-form layout="vertical" :model="{}">
            <a-form-item label="Issue Type">
              {{info?.issueType.name}}
            </a-form-item>
            <a-form-item label="Assigner">
              <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.ASSIGNER" :value="info.assigner_id" v-if="info"></FieldEditBasic>
            </a-form-item>
            <a-form-item label="Reporter">
              <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.REPORTER" :value="info.reporter_id" v-if="info"></FieldEditBasic>
            </a-form-item>
            <a-form-item label="Priority">
              <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.PRIORITY" :value="info.priority" v-if="info"></FieldEditBasic>
            </a-form-item>
            <a-form-item label="Module">
              <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.MODULE" :value="moduleList"></FieldEditBasic>
            </a-form-item>
            <a-form-item label="Label">
              <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.LABEL" :value="labelList"></FieldEditBasic>
            </a-form-item>
            <a-form-item label="Fix Versions">
              <FieldEditBasic :project-issue-id="projectIssueId" :type="EClient_Field_Basic_Type.FIXVERSIONS" :value="releaseList"></FieldEditBasic>
            </a-form-item>
          </a-form>
        </a-collapse-item>
        <a-collapse-item key="more" header="More">
          <a-form layout="vertical" :model="{}" v-if="fieldList.length>0">
            <a-form-item v-for="item in fieldList" :label="item.nodeField.field.name" :key="item.issueFieldValue.id">
              <FieldEdit :item="item"></FieldEdit>
            </a-form-item>
          </a-form>
        </a-collapse-item>
      </a-collapse>
      <a-row style="margin-top: 10px;color: gray;font-size: 12px;line-height: 1.3;padding-left: 5px;margin-bottom: 10px">
        Created {{moment(info?.created_time).format('YYYY-MM-DD HH:mm:ss')}}
      </a-row>
    </a-layout-sider>
  </a-layout>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, onBeforeMount, ref, watch} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {apiIssue, DCSType} from "../../../../common/request/request";
import {
  ICommon_Route_Res_ProjectIssue_BasicInfo,
  ICommon_Route_Res_ProjectIssue_fieldsInfo
} from "../../../../../../../common/routes/response";
import FieldEditBasic from "../../../../common/component/field/fieldEditBasic.vue";
import {EClient_Field_Basic_Type} from "../../../../common/component/field/fieldBasicType";
import {ICommon_Model_Project_Label} from "../../../../../../../common/model/project_label";
import {ICommon_Model_Project_Module} from "../../../../../../../common/model/project_module";
import FieldEdit from "../../../../common/component/field/fieldEdit.vue";
import moment from "moment";
import {ICommon_Model_Project_Issue} from "../../../../../../../common/model/project_issue";
import FieldPriority from "../../../../common/component/field/fieldPriority.vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import ProjectIssueBind from "./projectIssueBind.vue";
import {Message} from "@arco-design/web-vue";
import {ICommon_Model_Comment} from "../../../../../../../common/model/comment";
import {useDesktopStore} from "../../../desktop/store/desktop";
import {checkPermission} from "../../../../common/util/helper";
import {Permission_Types} from "../../../../../../../common/permission/permission";
import {ICommon_Model_Workflow_Action} from "../../../../../../../common/model/workflow_action";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import ProjectIssueNext from "./projectIssueNext.vue";
import {ICommon_Model_Project_Release} from "../../../../../../../common/model/project_release";

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
const labelList=ref<DCSType<ICommon_Model_Project_Label[]>>([])
const moduleList=ref<DCSType<ICommon_Model_Project_Module[]>>([])
const fieldList=ref<ICommon_Route_Res_ProjectIssue_fieldsInfo[]>([])
const parentIssue=ref<DCSType<ICommon_Model_Project_Issue>>();
const relatedIssueList=ref<DCSType<ICommon_Model_Project_Issue>[]>([])
const childIssueList=ref<DCSType<ICommon_Model_Project_Issue>[]>([])
const commentList=ref<DCSType<{
  value:ICommon_Model_Comment,
  isEdit:boolean,
  editContent:string
}[]>>([])
const actionList=ref<DCSType<ICommon_Model_Workflow_Action>[]>([])
const releaseList=ref<DCSType<ICommon_Model_Project_Release[]>>([])
const commentAdd=ref("")
const store=useDesktopStore()
const getInfo=async ()=>{
  let res=await apiIssue.basicInfo({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    info.value=res.data
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
    description.value=res.data
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
const getFieldList=async ()=>{
  let res=await apiIssue.fieldsInfo({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    fieldList.value=res.data
  }
}
const onRemoveItem=async (type:"parent"|"child"|"related",index:number)=>{
  if(type==="parent") {
    let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove parent issue?")
    if(ret) {
      let res=await apiIssue.removeParentIssue({
        projectIssueId:props.projectIssueId,
        projectIssueParentId:parentIssue.value.id
      })
      if(res?.code==0) {
        parentIssue.value=null;
      }
    }
  } else if(type=="child") {
    let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove child issue?")
    if(ret) {
      let res=await apiIssue.removeChildIssue({
        projectIssueId:props.projectIssueId,
        projectIssueChildId:childIssueList.value[index].id
      })
      if(res?.code==0) {
        childIssueList.value.splice(index,1)
      }
    }
  } else if(type=="related") {
    let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove related issue?")
    if(ret) {
      let res=await apiIssue.removeRelatedIssue({
        projectIssueId:props.projectIssueId,
        projectIssueRelatedId:relatedIssueList.value[index].id
      })
      if(res?.code==0) {
        relatedIssueList.value.splice(index,1)
      }
    }
  }
}
const onAddItem=async (type:"parent"|"child"|"related")=>{
  if(type=="parent") {
    let ret=await Dialog.open(root.value,appContext,"Parent",markRaw(ProjectIssueBind),{
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
    let ret=await Dialog.open(root.value,appContext,"Child",markRaw(ProjectIssueBind),{
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
    let ret=await Dialog.open(root.value,appContext,"Related",markRaw(ProjectIssueBind),{
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
const getCommentList=async ()=>{
  let res=await apiIssue.commentList({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    commentList.value=res.data.map(item=>{
      return {
        value:item,
        isEdit:false,
        editContent:item.content
      }
    })
  }
}
const onCommentAdd=async ()=>{
  let res=await apiIssue.commentCreate({
    projectIssueId:props.projectIssueId,
    content:commentAdd.value
  })
  if(res?.code==0) {
    commentList.value.unshift({
      value:res.data,
      isEdit:false,
      editContent:res.data.content
    })
    commentAdd.value=""
  }
}
const onEditComment=async (item:DCSType<{
  value:ICommon_Model_Comment,
  isEdit:boolean,
  editContent:string
}>)=>{
  if(!item.editContent) {
    Message.error("content can not be empty")
    return
  }
  let res=await apiIssue.commentEdit({
    commentId:item.value.id,
    content:item.editContent
  })
  if(res?.code==0) {
    item.value.content=item.editContent
    item.isEdit=false
  }
}
const onRemoveComment=async (index:number)=>{
  let item=commentList.value[index];
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to delete this comment?")
  if(ret) {
    let res=await apiIssue.commentRemove({
      commentId:item.value.id
    })
    if(res?.code==0) {
      commentList.value.splice(index,1)
    }
  }
}
const onDelete=async ()=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to delete this issue?")
  if(ret) {
    let res=await apiIssue.remove({
      projectIssueId:props.projectIssueId
    })
    if(res?.code==0) {
      Message.success("delete success")
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
const onAction=async (item:ICommon_Model_Workflow_Action)=>{
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
    getInfo()
    getFieldList()
    getActionList()
  } else {
    Message.error(res.msg)
  }
}
const getReleaseList=async ()=>{
  let res=await apiIssue.releaseList({
    projectIssueId:props.projectIssueId
  })
  if(res?.code==0) {
    releaseList.value=res.data
  }
}
onBeforeMount(()=>{
  getInfo()
  getDescription()
  getOtherInfo()
  getFieldList()
  getCommentList()
  getActionList()
  getReleaseList()
})
</script>

<style scoped>
#issueProfileDetail :deep(div[role="region"]) {
  background-color: white !important;
  padding-left: 5px;
  padding-right: 0px;
}
#issueProfileDetail :deep .arco-form-item {
  margin-bottom: 10px;
}
#issueProfileDetail :deep .arco-form-item-label {
  font-weight: bold;
}
#issueProfileContent :deep .arco-comment-actions {
  margin-top: 0px;
}
</style>