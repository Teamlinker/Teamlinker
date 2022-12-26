<template>
  <div ref="root">
    <a-tree :data="data" :block-node="true" :default-expand-all="true" :show-line="true" :field-names="{
    key:'id',
    title:'name',
    children:'data'
  }" ref="tree">
      <template #extra="node">
        <a-space style="margin-left: 20px">
          <a-button type="outline" size="mini" @click="onAdd(node)">add</a-button>
          <a-button type="outline" status="danger" size="mini" v-if="node.id" @click="onRemove(node)">remove</a-button>
        </a-space>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, nextTick, onBeforeMount, ref} from "vue";
import {ICommon_Route_Res_Project_CreateModule_Data} from "../../../../../../../common/routes/response";
import {apiProject} from "../../../../common/request/request";
import {Dialog} from "../../../../common/component/dialog/dialog";

const props=defineProps<{
  projectId:string
}>()
const data=ref<ICommon_Route_Res_Project_CreateModule_Data[]>([])
const tree=ref(null)
onBeforeMount(async ()=>{
  let res=await apiProject.listModule({
    projectId:props.projectId
  })
  if(res?.code==0) {
    data.value=[{
      id:null,
      name:"root",
      data:res.data
    }]
    await nextTick(()=>{
      tree.value.expandAll()
    })
  }
})
const root=ref(null)
const appContext=getCurrentInstance().appContext
const onAdd=async (item:ICommon_Route_Res_Project_CreateModule_Data)=>{
  let name=await Dialog.input(root.value,appContext,"please input module name")
  if(name) {
    let res=await apiProject.createModule({
      projectId:props.projectId,
      parentModuleId:item.id,
      name:name
    })
    if(res?.code==0) {
      if(!item.data) {
        item.data=[]
      }
      item.data.push({
        id:res.data.id,
        name:res.data.name,
        data:[]
      })
    }
  }
}
const onRemove=async (item:ICommon_Route_Res_Project_CreateModule_Data)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove this module?")
  if(ret) {
    let res=await apiProject.removeModule({
      moduleId:item.id
    })
    if(res?.code==0) {
      removeNode(data.value,item.id);
    }
  }
}
const removeNode=(items:ICommon_Route_Res_Project_CreateModule_Data[],id:string)=> {
  for(let i=0;i<items.length;i++) {
    let obj=items[i]
    if(obj.id==id) {
      items.splice(i,1)
    } else if(obj.data && obj.data.length>0) {
      removeNode(obj.data,id)
    }
  }
}
</script>

<style scoped>

</style>