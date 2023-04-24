<template>
  <span style="display: inline-block;width: 100%;cursor: text" @mouseenter="onEnter" @mouseleave="onLeave" tabindex="-1" @focusin="onFocus" ref="element">
    <template v-if="type==EClient_Field_Basic_Type.NAME">
      <span style="font-size: 24px;font-weight: bold" v-if="!isEdit">{{ showValue }}</span>
      <template v-else>
        <a-row style="padding-right: 10px">
          <a-input v-model="editValue"></a-input>
          <a-button type="text" @click="onClick">
            <template #icon>
              <icon-check></icon-check>
            </template>
          </a-button>
          <a-button type="text" @click="onBlur">
            <template #icon>
              <icon-close style="color: red"></icon-close>
            </template>
          </a-button>
        </a-row>
      </template>
    </template>
    <template v-if="type==EClient_Field_Basic_Type.DESCRIPTION">
      <span style="line-height: 30px" v-if="!isEdit">{{ showValue }}</span>
      <template v-else>
        <a-row style="padding-right: 10px">
          <a-textarea v-model="editValue" allow-clear></a-textarea>
          <a-button type="text" @click="onClick">
            <template #icon>
              <icon-check></icon-check>
            </template>
          </a-button>
          <a-button type="text" @click="onBlur">
            <template #icon>
              <icon-close style="color: red"></icon-close>
            </template>
          </a-button>
        </a-row>
      </template>
    </template>
    <template v-if="type==EClient_Field_Basic_Type.ASSIGNER">
      <template v-if="!isEdit">
        <UserAvatar v-if="showValue" :photo="showValue.photo" :name="showValue.nickname" :organization-user-id="showValue.organizationUserId"></UserAvatar>
        <span v-else style="line-height: 30px;width: 100%;color: gray">No User</span>
      </template>
      <a-row style="padding-right: 10px" v-else>
        <a-select allow-search allow-clear v-model="editValue" @search="onSearchAssigner">
          <a-option v-for="item in assignerList" :label="item.organizationUser.nickname" :value="item.organizationUser.id">
            <a-avatar :size="24" :image-url="item.user.photo"></a-avatar>&nbsp;&nbsp;
            {{ item.organizationUser.nickname }}
          </a-option>
        </a-select>
        <a-button type="text" @click="onClick">
          <template #icon>
            <icon-check></icon-check>
          </template>
        </a-button>
        <a-button type="text" @click="onBlur">
          <template #icon>
            <icon-close style="color: red"></icon-close>
          </template>
        </a-button>
      </a-row>
    </template>
    <template v-if="type==EClient_Field_Basic_Type.REPORTER">
      <template v-if="!isEdit">
        <UserAvatar v-if="showValue" :photo="showValue.photo" :name="showValue.nickname" :organization-user-id="showValue.organizationUserId"></UserAvatar>
        <span v-else style="line-height: 30px;width: 100%;color: gray">No User</span>
      </template>
      <template v-else>
        <a-row style="padding-right: 10px">
          <a-select allow-search allow-clear v-model="editValue" @search="onSearchReporter">
            <a-option v-for="item in reporterList" :label="item.organizationUser.nickname" :value="item.organizationUser.id">
              <a-avatar :size="24" :image-url="item.user.photo"></a-avatar>&nbsp;&nbsp;
              {{item.organizationUser.nickname}}
            </a-option>
          </a-select>
          <a-button type="text" @click="onClick">
            <template #icon>
              <icon-check></icon-check>
            </template>
          </a-button>
          <a-button type="text" @click="onBlur">
            <template #icon>
              <icon-close style="color: red"></icon-close>
            </template>
          </a-button>
        </a-row>
      </template>
    </template>
    <template v-if="type==EClient_Field_Basic_Type.PRIORITY">
      <FieldPriority :priority="showValue" v-if="!isEdit"></FieldPriority>
      <template v-else>
        <a-space size="mini">
          <a-select v-model="editValue">
            <a-option label="low" :value="ECommon_Model_Project_Issue_Priority.LOW"></a-option>
            <a-option label="medium" :value="ECommon_Model_Project_Issue_Priority.MEDIUM"></a-option>
            <a-option label="high" :value="ECommon_Model_Project_Issue_Priority.HIGH"></a-option>
            <a-option label="urgent" :value="ECommon_Model_Project_Issue_Priority.URGENT"></a-option>
          </a-select>
          <a-button type="text" @click="onClick">
            <template #icon>
              <icon-check></icon-check>
            </template>
          </a-button>
          <a-button type="text" @click="onBlur">
            <template #icon>
              <icon-close style="color: red"></icon-close>
            </template>
          </a-button>
        </a-space>
      </template>
    </template>
    <template v-if="type==EClient_Field_Basic_Type.LABEL">
      <template v-if="!isEdit">
        <a-space wrap size="mini" v-if="showValue.length>0">
          <a-tag v-for="item in showValue" color="blue">{{item.name}}</a-tag>
        </a-space>
        <span v-else style="line-height: 30px;width: 100%;color: gray">None</span>
      </template>
      <a-row style="padding-right: 10px" v-else>
        <a-space size="mini" wrap>
          <a-tag v-for="(item,index) in editValue" :closable="true" @close="onCloseLabelTag(index)" :key="item.id">
            {{item.name}}
          </a-tag>
          <a-select v-model="addValue" allow-search @search="onSearchLabel" v-if="showInput" @change="onAddChange">
            <a-option v-for="item in labelList" :label="item.name" :value="item.id"></a-option>
          </a-select>
          <a-tag v-else :style="{backgroundColor: 'var(--color-fill-2)',border: '1px dashed var(--color-fill-3)',cursor: 'pointer',}" @click="showInput=true">
            <template #icon>
              <icon-plus />
            </template>
            Add
          </a-tag>
          <a-button type="text" @click="onClick">
            <template #icon>
              <icon-check></icon-check>
            </template>
          </a-button>
          <a-button type="text" @click="onBlur">
            <template #icon>
              <icon-close style="color: red"></icon-close>
            </template>
          </a-button>
        </a-space>
      </a-row>
    </template>
    <template v-if="type==EClient_Field_Basic_Type.MODULE">
      <template v-if="!isEdit">
        <a-space wrap size="mini" v-if="showValue.length>0">
          <template #split>
            /
          </template>
          <span v-for="item in showValue" style="color: blue">{{item.name}}</span>
        </a-space>
        <span v-else style="line-height: 30px;width: 100%;color: gray">None</span>
      </template>
      <a-row style="padding-right: 10px" v-else>
        <a-cascader v-model="editValue" :field-names="fields" :options="moduleList" placeholder="please select" :format-label="format" check-strictly allow-clear allow-search></a-cascader>
        <a-button type="text" @click="onClick">
          <template #icon>
            <icon-check></icon-check>
          </template>
        </a-button>
        <a-button type="text" @click="onBlur">
          <template #icon>
            <icon-close style="color: red"></icon-close>
          </template>
        </a-button>
      </a-row>
    </template>
    <template v-if="type==EClient_Field_Basic_Type.FIXVERSIONS">
      <template v-if="!isEdit">
        <a-space wrap size="mini" v-if="showValue.length>0">
          <ProjectReleasePreview v-for="item in showValue" :key="item.id" :project-release-id="item.id" :name="item.name"></ProjectReleasePreview>
        </a-space>
        <span v-else style="line-height: 30px;width: 100%;color: gray">None</span>
      </template>
      <a-row style="padding-right: 10px" v-else>
        <a-space size="mini" wrap>
          <a-tag v-for="(item,index) in editValue" :closable="true" @close="onCloseLabelTag(index)" :key="item.id">
            {{item.name}}
          </a-tag>
          <a-select v-model="addValue" allow-search @search="onSearchRelease" v-if="showInput" @change="onAddChange">
            <a-option v-for="item in labelList" :label="item.name" :value="item.id"></a-option>
          </a-select>
          <a-tag v-else :style="{backgroundColor: 'var(--color-fill-2)',border: '1px dashed var(--color-fill-3)',cursor: 'pointer',}" @click="showInput=true">
            <template #icon>
              <icon-plus />
            </template>
            Add
          </a-tag>
          <a-button type="text" @click="onClick">
            <template #icon>
              <icon-check></icon-check>
            </template>
          </a-button>
          <a-button type="text" @click="onBlur">
            <template #icon>
              <icon-close style="color: red"></icon-close>
            </template>
          </a-button>
        </a-space>
      </a-row>
    </template>
  </span>
</template>

<script setup lang="ts">
import {EClient_Field_Basic_Type} from "./fieldBasicType";
import {ICommon_Model_Project_Label} from "../../../../../../common/model/project_label";
import {ICommon_Model_Project_Module} from "../../../../../../common/model/project_module";
import {inject, onMounted, ref, watch} from "vue";
import {apiIssue, apiOrganization, apiProject, apiRelease, DCSType} from "../../request/request";
import UserAvatar from "../userAvatar.vue";
import {
  ICommon_Route_Res_Organization_User_Item,
  ICommon_Route_Res_Project_CreateModule_Data
} from "../../../../../../common/routes/response";
import FieldPriority from "./fieldPriority.vue";
import {ECommon_Model_Project_Issue_Priority} from "../../../../../../common/model/project_issue";
import {injectProjectInfo} from "../../util/symbol";
import {checkPermission} from "../../util/helper";
import {Permission_Types} from "../../../../../../common/permission/permission";
import {ICommon_Model_Project_Release} from "../../../../../../common/model/project_release";
import ProjectReleasePreview from "../../../controller/app/project/release/projectReleasePreview.vue";
import {SessionStorage} from "../../storage/session";

type User={
  id:string,
  organizationUserId:string,
  photo?:string,
  nickname?:string
}
type Value=string|ECommon_Model_Project_Issue_Priority|User|ICommon_Model_Project_Label[]|ICommon_Model_Project_Module[]|number|ICommon_Model_Project_Release[]
const props=defineProps<{
  projectIssueId:string,
  type:EClient_Field_Basic_Type,
  value:Value
}>()
const fields={
  label:"name",
  value:"id",
  children:"data"
}
const showInput=ref(false)
const addValue=ref("")
const element=ref<HTMLSpanElement>(null)
const showValue=ref(props.value)
const editValue=ref<string|ECommon_Model_Project_Issue_Priority|string[]|{
  id:string,
  name:string
}[]>(null)
const assignEditValue=()=>{
  switch (props.type) {
    case EClient_Field_Basic_Type.DESCRIPTION:
    case EClient_Field_Basic_Type.NAME: {
      editValue.value=showValue.value as string
      break
    }
    case EClient_Field_Basic_Type.PRIORITY:{
      editValue.value=showValue.value as number
      break
    }
    case EClient_Field_Basic_Type.REPORTER:
    case EClient_Field_Basic_Type.ASSIGNER:{
      editValue.value=""
      break
    }
    case EClient_Field_Basic_Type.LABEL:{
      let value=showValue.value as ICommon_Model_Project_Label[]
      editValue.value=value.length>0?value.map(item=>{
        return {
          id:item.id,
          name:item.name
        }
      }):[]
      break
    }
    case EClient_Field_Basic_Type.MODULE:{
      let value=showValue.value as ICommon_Model_Project_Module[]
      editValue.value=value.length>0?value[value.length-1].id:""
      break
    }
    case EClient_Field_Basic_Type.FIXVERSIONS:{
      let value=showValue.value as ICommon_Model_Project_Release[]
      editValue.value=value.length>0?value.map(item=>{
        return {
          id:item.id,
          name:item.name
        }
      }):[]
      break
    }
    default:
      break
  }
}
const projectId=inject(injectProjectInfo).id;
const permission=inject(injectProjectInfo).permission
const isEdit=ref(false)
const assignerList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const reporterList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const labelList=ref<{
  id:string,
  name:string
}[]>([])
const moduleList=ref<ICommon_Route_Res_Project_CreateModule_Data[]>([])
watch(()=>props.value,(newValue,oldValue)=>{
  showValue.value=props.value
  if(props.type===EClient_Field_Basic_Type.DESCRIPTION) {
    if(!showValue.value) {
      isEdit.value=true
    } else {
      isEdit.value=false
    }
  }
  assignEditValue()
},{
  immediate:true
})
watch(isEdit,()=>{
  if(isEdit.value && props.type==EClient_Field_Basic_Type.MODULE) {
    getModuleList()
  }
})
const onEnter=(event:MouseEvent)=>{
  if(!isEdit.value) {
    const ele=event.currentTarget as HTMLElement
    ele.style.backgroundColor="rgb(230,231,237)"
  }
}
const onLeave=(event:MouseEvent)=>{
  const ele=event.currentTarget as HTMLElement
  ele.style.backgroundColor=""
}
const onFocus=async (event:MouseEvent)=>{
  if(checkPermission(permission.value,Permission_Types.Project.EDIT)) {
    isEdit.value=true
    const ele=event.currentTarget as HTMLElement
    ele.style.backgroundColor=""
  }
}
const onBlur=async ()=>{
  if(props.type===EClient_Field_Basic_Type.DESCRIPTION && !editValue.value) {
    return
  }
  isEdit.value=false
  showInput.value=false
  addValue.value=""
  assignEditValue()
}
const onClick=async ()=>{
  if(props.type==EClient_Field_Basic_Type.NAME) {
    let res=await apiIssue.editBasicField({
      projectIssueId:props.projectIssueId,
      name:editValue.value as string
    })
    if(res?.code==0) {
      showValue.value=editValue.value as string
      onBlur()
    }
  } else if(props.type==EClient_Field_Basic_Type.DESCRIPTION) {
    let res=await apiIssue.editDescription({
      projectIssueId:props.projectIssueId,
      description:editValue.value as string
    })
    if(res?.code==0) {
      showValue.value=editValue.value as string
      onBlur()
    }
  } else if(props.type==EClient_Field_Basic_Type.ASSIGNER) {
    let res=await apiIssue.editBasicField({
      projectIssueId:props.projectIssueId,
      assignerId:editValue.value as string
    })
    if(res?.code==0) {
      showValue.value=res.data.assigner_id as User
      onBlur()
    }
  } else if(props.type==EClient_Field_Basic_Type.REPORTER) {
    let res=await apiIssue.editBasicField({
      projectIssueId:props.projectIssueId,
      reporterId:editValue.value as string
    })
    if(res?.code==0) {
      showValue.value=res.data.reporter_id as User
      onBlur()
    }
  } else if(props.type==EClient_Field_Basic_Type.PRIORITY) {
    let res=await apiIssue.editBasicField({
      projectIssueId:props.projectIssueId,
      priority:editValue.value as ECommon_Model_Project_Issue_Priority
    })
    if(res?.code==0) {
      showValue.value=editValue.value as number
      onBlur()
    }
  } else if(props.type==EClient_Field_Basic_Type.LABEL) {
    let arr=editValue.value as {
      id:string,
      name:string
    }[]
    let arrId=Array.from(new Set(arr.map(item=>item.id)));
    let res=await apiIssue.bindLabel({
      projectIssueId:props.projectIssueId,
      labelIds:arrId
    })
    if(res?.code==0) {
      showValue.value=res.data
      onBlur()
    }
  } else if(props.type==EClient_Field_Basic_Type.MODULE) {
    let res=await apiIssue.bindModule({
      projectIssueId:props.projectIssueId,
      moduleId:editValue.value as string
    })
    if(res?.code==0) {
      showValue.value=res.data
      onBlur()
    }
  } else if(props.type==EClient_Field_Basic_Type.FIXVERSIONS) {
    let arr=editValue.value as {
      id:string,
      name:string
    }[]
    let arrId=Array.from(new Set(arr.map(item=>item.id)));
    let res=await apiIssue.bindReleases({
      projectIssueId:props.projectIssueId,
      projectReleaseIds:arrId
    })
    if(res?.code==0) {
      showValue.value=res.data
      onBlur()
    }
  }
}
const onSearchAssigner=async (keyword:string)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    keyword,
    page:0,
    size:10
  })
  if(res?.code==0) {
    assignerList.value=res.data.data
  }
}
const onSearchReporter=async (keyword:string)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    keyword,
    page:0,
    size:10
  })
  if(res?.code==0) {
    reporterList.value=res.data.data
  }
}
const onSearchLabel=async (keyword:string)=>{
  let res=await apiProject.listLabel({
    projectId,
    keyword,
    page:0,
    size:10
  })
  if(res?.code==0) {
    labelList.value=res.data.data
  }
}
const onSearchRelease=async (keyword:string)=>{
  let res=await apiRelease.list({
    projectId,
    name:keyword,
    page:0,
    size:10
  })
  if(res?.code==0) {
    labelList.value=res.data.data
  }
}
const getModuleList=async ()=>{
  let res=await apiProject.listModule({
    projectId
  })
  if(res?.code==0) {
    moduleList.value=res.data
  }
}
const format = (options) => {
  const labels = options.map(option => option.name)
  return labels.join('/')
}
onMounted(()=>{
  if(props.type==EClient_Field_Basic_Type.DESCRIPTION && showValue.value=="") {
    element.value.focus()
  }
})
const onCloseLabelTag=(index:number)=>{
  (editValue.value as any[]).splice(index,1)
}
const onAddChange=()=>{
  let arr=editValue.value as {
    id:string,
    name:string
  }[]
  let index=labelList.value.findIndex((item)=>{
    if(item.id==addValue.value) {
      return true;
    }
  })
  arr.push({
    id:labelList.value[index].id,
    name:labelList.value[index].name
  })
  addValue.value=""
  showInput.value=false
}
</script>

<style scoped>

</style>