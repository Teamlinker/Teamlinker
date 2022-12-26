<template>
  <div style="width: 100%;height: 100%;overflow: auto;display: flex;flex-direction:column" ref="root" >
    <a-space style="flex:0 1 auto;margin-bottom: 10px">
      <a-button type="primary" @click="addNode">Add Node</a-button>
    </a-space>
    <a-layout style="flex:1 1 auto;border: 1px solid gainsboro">
      <a-layout-content style="overflow:hidden;">
        <div  ref="eleWorkflow" style="height: 100%;width: 100%" tabindex="1" @keydown.delete="onKeyDelete"></div>
      </a-layout-content>
      <a-layout-sider :resize-directions="['left']">
        <a-form :model="form" layout="vertical" style="margin:10px 5px 0px 5px;width: 90%" v-if="form.type" @submitSuccess="onSubmit">
          <h3>{{form.type}}</h3>
          <a-form-item field="status" label="status" v-if="form.type=='node'" required>
            <a-select v-model="form.status">
              <a-option :value="ECommon_Model_Workflow_Node_Status.NOTSTART">NOTSTART</a-option>
              <a-option :value="ECommon_Model_Workflow_Node_Status.INPROGRESS">INPROGRESS</a-option>
              <a-option :value="ECommon_Model_Workflow_Node_Status.DONE">DONE</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="name" label="name" required>
            <a-input v-model="form.name"></a-input>
          </a-form-item>
          <a-form-item field="description" label="description">
            <a-textarea v-model="form.description"></a-textarea>
          </a-form-item>
          <a-form-item>
            <a-space v-if="form.type=='node'" size="medium">
              <a-button html-type="submit" type="primary">Save</a-button>
              <a-button html-type="button" type="primary" @click="onEditFields">Edit Fields</a-button>
            </a-space>
            <a-button html-type="submit" type="primary" v-else>Save</a-button>
          </a-form-item>
        </a-form>
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, onMounted, reactive, ref} from "vue";
import LogicFlow from "@logicflow/core";
import {apiWorkflow} from "../../../../common/request/request";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {flowNode} from "../../../../common/component/flow/node";
import AddWorkflowNode from "./addWorkflowNode.vue";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import {Message} from "@arco-design/web-vue";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import FieldList from "./fieldList.vue";

const props=defineProps<{
  issueTypeId:string
}>()
const eleWorkflow=ref(null);
const root=ref(null)
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator();
navigator.register("fieldList",markRaw(FieldList))
const form=reactive({
  id:"",
  name:"",
  description:"",
  type:"",
  status:ECommon_Model_Workflow_Node_Status.INPROGRESS
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
  }
  if(type) {
    let ret=await Dialog.confirm(root.value,appContext,`Do you want to delete ${type} ${name}`)
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
  let res=await (form.type=="node"?apiWorkflow.editNode({
    workflowNodeId:form.id,
    name:form.name,
    description:form.description,
    status:form.status
  }):apiWorkflow.editAction({
    workflowActionId:form.id,
    name:form.name,
    description:form.description
  }))
  if(res?.code==0) {
    Message.success("update success")
    if(form.type=="node") {
      let obj=lf.getNodeModelById(form.id)
      obj.updateText(form.name)
      obj.setProperty("name",form.name)
      obj.setProperty("description",form.description)
      obj.setProperty("status",form.status)
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
  },`${form.name} -> Fields`)
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
          type:"node",
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
          properties: item
        }
      })
    }
  }
}
const addNode=async ()=>{
  let ret:any=await Dialog.open(root.value,appContext,"Add Node" ,markRaw(AddWorkflowNode),{
    issueTypeId:props.issueTypeId
  })
  if(ret) {
    lf.dnd.startDrag({
      id:ret.id,
      type:"node",
      text:ret.name,
      properties:ret
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
    })
    lf.on("edge:add",async ({data})=>{
      let res=await apiWorkflow.addAction({
        issueTypeId:props.issueTypeId,
        name:"empty",
        sourceNodeId:data.sourceNodeId,
        destNodeId:data.targetNodeId
      })
      if(res?.code==0) {
        let obj=lf.getEdgeModelById(data.id)
        obj.id=res.data.id
        obj.updateText("empty");
        obj.setProperties(res.data)
      }
    })
    lf.on("edge:delete",async ({data})=>{
      if(data.properties.id==form.id) {
        form.type=""
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
      form.type=data.type=="node"?"node":"transition"
      form.name=data.properties.name
      form.description=data.properties.description
      if(data.type=="node") {
        form.status=data.properties.status
      }
    })
    lf.on("blank:click",({date})=>{
      form.type=""
    })
    lf.render(ret)
  }
})
</script>

<style scoped>

</style>