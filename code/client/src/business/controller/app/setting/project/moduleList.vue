<template>
  <div>
    <a-tree :data="data" :block-node="true" :default-expand-all="true" :show-line="true" :field-names="{
    key:'id',
    title:'name',
    children:'data'
  }" ref="tree" draggable @drop="onDrop">
      <template #extra="node">
        <a-space style="margin-left: 20px">
          <a-button type="outline" size="mini" @click="onAdd(node)">{{$t("util.add")}}</a-button>
          <a-button type="outline" size="mini" @click="onEdit(node)" v-if="node.id">{{$t("util.edit")}}</a-button>
          <a-button type="outline" status="danger" size="mini" v-if="node.id" @click="onRemove(node)">{{$t("util.remove")}}</a-button>
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
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  projectId:string
}>()
const data=ref<ICommon_Route_Res_Project_CreateModule_Data[]>([])
const tree=ref(null)
const {t}=useI18n()
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
const root=getRootNavigatorRef();
const appContext=getCurrentInstance().appContext
const onAdd=async (item:ICommon_Route_Res_Project_CreateModule_Data)=>{
  let name=await Dialog.input(root.value,appContext,t("tip.typeModuleName"))
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
const onEdit=async (item:ICommon_Route_Res_Project_CreateModule_Data)=>{
  let name=await Dialog.input(root.value,appContext,t("tip.editModuleName"),item.name)
  if(name) {
    let res=await apiProject.editModule({
      moduleId:item.id,
      name:name
    })
    if(res?.code==0) {
      item.name=name;
    }
  }
}
const onRemove=async (item:ICommon_Route_Res_Project_CreateModule_Data)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteModule"))
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
const onDrop=async ({ dragNode, dropNode, dropPosition })=>{
  if(dropPosition==0) {
    let res=await apiProject.editModule({
      moduleId:dragNode.id,
      parentModuleId:dropNode.id
    })
    if(res?.code==0) {
      const loop = (data, key, callback) => {
        data.some((item, index, arr) => {
          if (item.id === key) {
            callback(item, index, arr);
            return true;
          }
          if (item.data) {
            return loop(item.data, key, callback);
          }
          return false;
        });
      };

      loop(data.value, dragNode.id, (_, index, arr) => {
        arr.splice(index, 1);
      });
      loop(data.value, dropNode.id, (item) => {
        item.data = item.data || [];
        item.data.push(dragNode);
      });
    }
  }
}
</script>

<style scoped>

</style>