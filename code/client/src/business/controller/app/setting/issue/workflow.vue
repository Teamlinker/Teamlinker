<template>
  <div style="width: 100%;height: 100%;display: flex;flex-direction:column" ref="root" >
    <a-space style="flex:0 1 auto;margin-bottom: 10px;width: 100%">
      <a-button type="primary" @click="addNode">{{$t("controller.app.setting.issue.workflow.addNode")}}</a-button>
    </a-space>
    <a-layout style="flex:1 1 auto;border: 1px solid gainsboro">
      <a-layout-content style="overflow:hidden;">
        <div  ref="eleWorkflow" style="height: 100%;width: 100%" tabindex="-1" @keydown.delete="onKeyDelete"></div>
      </a-layout-content>
      <a-layout-sider :resize-directions="['left']">
        <a-form :model="form" layout="vertical" style="margin:10px 5px 0px 5px;width: 90%" v-if="form.type" @submitSuccess="onSubmit">
          <h3>{{$t("util."+form.type)}}</h3>
          <a-form-item field="status" :label="$t('util.status')" v-if="form.type=='node' || form.type=='approval'" required>
            <a-select v-model="form.status">
              <a-option :value="ECommon_Model_Workflow_Node_Status.NOTSTART">{{$t("util.notStart")}}</a-option>
              <a-option :value="ECommon_Model_Workflow_Node_Status.INPROGRESS">{{$t("util.inProgress")}}</a-option>
              <a-option :value="ECommon_Model_Workflow_Node_Status.DONE">{{$t("util.done")}}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="name" :label="$t('util.name')" required>
            <a-input v-model="form.name"></a-input>
          </a-form-item>
          <a-form-item field="description" :label="$t('util.description')">
            <a-textarea v-model="form.description"></a-textarea>
          </a-form-item>
	        <template v-if="form.type==='node' || form.type==='approval'">
		        <a-form-item field="approval" :label="$t('util.approval')" v-if="form.status===ECommon_Model_Workflow_Node_Status.INPROGRESS || form.status===ECommon_Model_Workflow_Node_Status.DONE">
			        <a-switch :checked-value="1" :unchecked-value="0" v-model="form.approval"></a-switch>
		        </a-form-item>
		        <a-form-item field="allComing" :label="$t('util.allowAllConnections')" :extra="$t('controller.app.setting.issue.workflow.border')">
			        <a-switch :checked-value="1" :unchecked-value="0" v-model="form.allComing"></a-switch>
		        </a-form-item>
		        <a-form-item field="approvalType" :label="$t('util.approvalType')" v-if="form.approval">
							<a-select v-model="form.approvalType" @change="onApprovalTypeChange">
								<a-option :value="ECommon_Model_Workflow_Approval_Type.PERSON">{{$t("util.person")}}</a-option>
								<a-option :value="ECommon_Model_Workflow_Approval_Type.TEAM">{{$t("util.team")}}</a-option>
								<a-option :value="ECommon_Model_Workflow_Approval_Type.FIELD">{{$t("util.field")}}</a-option>
							</a-select>
		        </a-form-item>
		        <a-form-item field="approvalValue" :label="form.approvalType===ECommon_Model_Workflow_Approval_Type.PERSON?$t('controller.app.setting.issue.workflow.choosePerson'):form.approvalType===ECommon_Model_Workflow_Approval_Type.TEAM?$t('controller.app.setting.issue.workflow.chooseTeam'):$t('controller.app.setting.issue.workflow.chooseWorkflowField')" v-if="form.approval">
							<FieldCommonMultiLabel style="width: 100%" v-model="form.approvalValue" :type="form.approvalType===ECommon_Model_Workflow_Approval_Type.PERSON?'user':'team'" v-if="form.approvalType===ECommon_Model_Workflow_Approval_Type.PERSON || form.approvalType===ECommon_Model_Workflow_Approval_Type.TEAM"></FieldCommonMultiLabel>
			        <FieldCommonLabel style="width: 100%" v-model="form.approvalValue" type="field" :workflow-node-id="form.id" v-else-if="form.approvalType===ECommon_Model_Workflow_Approval_Type.FIELD"></FieldCommonLabel>
		        </a-form-item>
		        <a-form-item field="approvalExtra" :label="$t('util.chooseMemberTag')" v-if="form.approval && form.approvalType===ECommon_Model_Workflow_Approval_Type.TEAM">
			        <FieldCommonLabel style="width: 100%" v-model="form.approvalExtra" type="tag"></FieldCommonLabel>
		        </a-form-item>
	        </template>
          <a-form-item>
            <a-space v-if="form.type=='node' || form.type=='approval'" size="medium">
              <a-button html-type="submit" type="primary">{{$t("util.save")}}</a-button>
              <a-button html-type="button" type="primary" @click="onEditFields">{{$t("controller.app.setting.issue.workflow.editFields")}}</a-button>
            </a-space>
            <a-button html-type="submit" type="primary" v-else>{{$t("util.save")}}</a-button>
          </a-form-item>
        </a-form>
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, nextTick, onBeforeMount, onMounted, reactive, ref} from "vue";
import LogicFlow from "@logicflow/core";
import {apiWorkflow} from "../../../../common/request/request";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {flowNode} from "../../../../common/component/flow/node";
import AddWorkflowNode from "./addWorkflowNode.vue";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import {Message} from "@arco-design/web-vue";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import FieldList from "./fieldList.vue";
import {flowApproval} from "@/business/common/component/flow/approval";
import {ECommon_Model_Workflow_Approval_Type} from "../../../../../../../common/model/workflow_approval";
import FieldCommonMultiLabel from "@/business/common/component/field/common/fieldCommonMultiLabel.vue";
import FieldCommonLabel from "@/business/common/component/field/common/fieldCommonLabel.vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  issueTypeId:string
}>()
const eleWorkflow=ref<HTMLElement>(null);
const root=ref(null)
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator();
const {t}=useI18n()
navigator.register("fieldList",markRaw(FieldList))
const form=reactive({
  id:"",
  name:"",
  description:"",
  type:"" ,
  status:ECommon_Model_Workflow_Node_Status.INPROGRESS,
	approval:0,
	approvalType:ECommon_Model_Workflow_Approval_Type.PERSON,
	approvalValue:[] as string[]|string,
	approvalExtra:"",
	allComing:0
})
let lf:LogicFlow
const onKeyDelete=async (event:KeyboardEvent)=>{
  const elements=lf.getSelectElements();
  let type:string,name:string,id:string
  if(elements.edges.length>0) {
    type="transition"
    name=(<any>elements.edges[0].text).value;
    id=elements.edges[0].id
  } else if(elements.nodes.length>0) {
    type="node"
    name=(<any>elements.nodes[0].text).value;
    id=elements.nodes[0].id
	  if(elements.nodes[0].properties.status===ECommon_Model_Workflow_Node_Status.NOTSTART) {
			Message.error(t("tip.notStartNodeNotRemove"))
		  return
	  }
  }
  if(type) {
    let ret=await Dialog.confirm(root.value,appContext,`${t("tip.doYouWantToDelete")}${type}:${name}`)
    if(ret) {
      if(type=="transition") {
        lf.deleteEdge(id)
      } else if(type=="node") {
        lf.deleteNode(id)
      }
    }
  }

}
const onSubmit=async ()=>{
  let res=await ((form.type=="node" || form.type=="approval")?apiWorkflow.editNode({
    workflowNodeId:form.id,
    name:form.name,
    description:form.description,
    status:form.status,
	  approval:form.approval,
	  ...(form.approval && {
			approvalType:form.approvalType,
		  approvalValue:Array.isArray(form.approvalValue)?form.approvalValue:form.approvalValue?[form.approvalValue]:[],
		  approvalExtra:form.approvalExtra
	  }),
	  isAllComing:form.allComing
  }):apiWorkflow.editAction({
    workflowActionId:form.id,
    name:form.name,
    description:form.description
  }))
  if(res?.code==0) {
    Message.success(t("tip.updateSuccess"))
    if(form.type=="node" || form.type=="approval") {
      let obj=lf.getNodeModelById(form.id)
      obj.updateText(form.name)
	    obj.setProperties(res.data)
	    let type=form.type
	    let newType=form.approval?"approval":"node"
	    if(type!==newType) {
		    lf.graphModel.changeNodeType(form.id,newType)
		    form.type=newType
	    }
			if(form.allComing) {
				let arr=[...lf.getNodeIncomingEdge(form.id)]
				for(let obj of arr) {
					lf.deleteEdge(obj.id)
				}
			}
    } else {
      let obj=lf.getEdgeModelById(form.id)
      obj.updateText(form.name)
      obj.setProperty("name",form.name)
      obj.setProperty("description",form.description)
    }
  } else {
    Message.error(res.msg)
  }
}
const onEditFields=()=>{
  navigator.push("fieldList",{
    workflowNodeId:form.id
  },`${form.name} -> ${t("util.fields")}`)
}

const onApprovalTypeChange=()=> {
	if(form.approvalType===ECommon_Model_Workflow_Approval_Type.PERSON || form.approvalType===ECommon_Model_Workflow_Approval_Type.TEAM) {
		form.approvalValue=[];
		form.approvalExtra=''
	} else if(form.approvalType===ECommon_Model_Workflow_Approval_Type.FIELD) {
		form.approvalValue="";
		form.approvalExtra=''
	}
}

const requestNodes=async ()=>{
  let res=await apiWorkflow.info({
    issueTypeId:props.issueTypeId
  })
  if(res?.code==0) {
    return {
      nodes:res.data.nodes.map(item=>{
        return {
          id:item.id,
          type:item.is_approval?"approval":"node",
          x:item.x,
          y:item.y,
          text:item.name,
          properties:item
        }
      }),
      edges:res.data.actions.map(item=>{
        return {
          id:item.id,
          type: "polyline",
          sourceNodeId: item.source_node_id,
          targetNodeId: item.dest_node_id,
          text: item.name,
          properties: item,
	        ...(item.source_anchor_point && {
						startPoint:JSON.parse(item.source_anchor_point)
	        }),
	        ...(item.end_anchor_point && {
						endPoint:JSON.parse(item.end_anchor_point)
	        })
        }
      })
    }
  }
}
const addNode=async ()=>{
  let ret:any=await Dialog.open(root.value,appContext,t("controller.app.setting.issue.workflow.addNode") ,markRaw(AddWorkflowNode),{
    issueTypeId:props.issueTypeId
  })
  if(ret) {
	  lf.addNode({
		  id:ret.data.id,
		  type:"node",
		  text:ret.data.name,
		  x:(-lf.graphModel.transformModel.TRANSLATE_X+lf.graphModel.width/2-100),
		  y:(-lf.graphModel.transformModel.TRANSLATE_Y+20)*lf.graphModel.transformModel.SCALE_Y,
		  properties:ret.data
	  })
  }
}

let requestNodesPromise;
onBeforeMount(()=>{
  requestNodesPromise=requestNodes();
})
onMounted(async ()=>{
  lf=new LogicFlow({
    container:eleWorkflow.value,
    keyboard: {
      enabled: false
    },
    stopScrollGraph:true,
    adjustEdgeStartAndEnd:false,
  })
  lf.register(flowNode)
	lf.register(flowApproval)
  lf.setTheme({
    baseEdge:{
      strokeWidth:1.2,
      stroke:"gray"
    }
  })
  let ret=await requestNodesPromise;
  if(ret) {
    lf.on("node:drop",async ({data})=>{
      apiWorkflow.editNode({
        workflowNodeId:data.properties.id,
        x:data.x,
        y:data.y
      })
	    let outgoingEdges=lf.getNodeOutgoingEdge(data.properties.id)
	    outgoingEdges.forEach(item=>{
				apiWorkflow.editAction({
					workflowActionId:item.id,
					sourceAnchorPoint:JSON.stringify(item.startPoint)
				})
	    })
	    let incomingEdges=lf.getNodeIncomingEdge(data.properties.id)
	    incomingEdges.forEach(item=>{
		    apiWorkflow.editAction({
			    workflowActionId:item.id,
			    endAnchorPoint:JSON.stringify(item.endPoint)
		    })
	    })
    })
    lf.on("edge:add",async ({data})=>{
      let res=await apiWorkflow.addAction({
        issueTypeId:props.issueTypeId,
        name:"empty",
        sourceNodeId:data.sourceNodeId,
        destNodeId:data.targetNodeId,
	      sourceAnchorPoint:JSON.stringify(data.startPoint),
	      endAnchorPoint:JSON.stringify(data.endPoint)
      })
      if(res?.code==0) {
        let obj=lf.getEdgeModelById(data.id)
        obj.id=res.data.id
        obj.updateText("empty");
        obj.setProperties(res.data)
	      lf.openEdgeAnimation(obj.id)
      } else {
				Message.error(res.msg)
				lf.deleteEdge(data.id)
      }
    })
    lf.on("edge:delete",async ({data})=>{
      if(data.properties.id==form.id) {
        form.type=""
      } else if(!data.properties.id) {
				return
      }
      apiWorkflow.deleteAction({
        workflowActionId:data.properties.id
      })
    })
    lf.on("node:delete",({data})=>{
      if(data.properties.id==form.id) {
        form.type=""
      }
	    apiWorkflow.deleteNode({
		    workflowNodeId:data.properties.id
	    })
    })
    lf.on("node:click,edge:click",({data})=>{
      form.id=data.properties.id
      form.type=data.type=="node"?"node":data.type==='approval'?"approval":"transition"
      form.name=data.properties.name
      form.description=data.properties.description
      if(data.type=="node" || data.type=="approval") {
        form.status=data.properties.status
	      form.allComing=data.properties.is_all_coming
	      form.approval=data.properties.is_approval
	      if(form.approval) {
					form.approvalType=data.properties.approval.type
		      if(form.approvalType===ECommon_Model_Workflow_Approval_Type.TEAM || form.approvalType===ECommon_Model_Workflow_Approval_Type.PERSON) {
						form.approvalValue=data.properties.approval.value
			      if(form.approvalType===ECommon_Model_Workflow_Approval_Type.TEAM) {
							form.approvalExtra=data.properties.approval.extra
			      }
		      } else if(form.approvalType===ECommon_Model_Workflow_Approval_Type.FIELD) {
						form.approvalValue=data.properties.approval.value.length>0?data.properties.approval.value[0]:""
		      }
	      } else {
					form.approvalType=ECommon_Model_Workflow_Approval_Type.PERSON
		      form.approvalValue=[]
		      form.approvalExtra=""
	      }
      }
    })
    lf.on("blank:click",({date})=>{
      nextTick(()=>{
        form.type=""
      })
    })
	  lf.on("text:update",async (param)=>{
		  if(form.type=="node" || form.type=="approval") {
        let obj=lf.getNodeModelById(form.id)
				let res=await apiWorkflow.editNode({
					workflowNodeId:form.id,
					name:obj.text.value
				})
			  if(res?.code==0) {
				  obj.setProperty("name",obj.text.value)
          form.name=obj.text.value
			  }
		  } else {
        let obj=lf.getEdgeModelById(form.id)
			  let res=await apiWorkflow.editAction({
				  workflowActionId:form.id,
				  name:obj.text.value
			  })
			  if(res?.code==0) {
          obj.setProperty("name",obj.text.value)
          form.name=obj.text.value
			  }
		  }
	  })
	  lf.on("edge:adjust",({data})=>{
		  apiWorkflow.editAction({
			  workflowActionId:data.properties.id,
			  sourceAnchorPoint:JSON.stringify(data.startPoint),
			  endAnchorPoint:JSON.stringify(data.endPoint)
		  })
	  })
    lf.render(ret)
	  for(let edge of ret.edges) {
		  lf.openEdgeAnimation(edge.id)
	  }
  }
})
</script>

<style scoped>

</style>