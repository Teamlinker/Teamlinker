<template>
  <div  :data-id="item.id" :id="item.id" :style="{zIndex:item.isPopup?102:item.isFocus?101:100,left:item.rect.left,top:item.rect.top,width:item.rect.width,height:item.rect.height}"  style="box-shadow:0px 0px 2px 2px rgba(169, 169, 169, 0.2);position:absolute;border-radius: 5px;" :tabindex="index" @focus="onFocus(item.id)" v-resize="item.rect" v-show="item.status!=ETeamOS_Window_Status.MIN || item.isPopup" name="window">
	  <template v-if="!item.isPopup">
		  <a-row style="height: 35px;background: rgba(249,249,249,0.9);backdrop-filter: blur(5px)" v-drag:[item.id].free="item.rect" @dragend="item.onMove">
			  <a-col flex="100px" style="height: 100%;text-align: center;line-height: 35px;color: rgb(93,93,93);font-size: medium;cursor: move;align-items: center;display: flex">
				  <SvgIcon style="margin-left: 10px;margin-right: 10px;width: 18px;height: 18px" :name="iconGroupMap[item.group]"></SvgIcon>
				  <span style="font-size: small;color: #333">{{item.title}}</span>
			  </a-col>
			  <a-col flex="80px" style="height: 100%">
				  <a-row style="height: 100%" align="center" justify="left" :wrap="false" v-if="item.isControl">
					  <a-col flex="auto">
						  <a-button type="text" @click="back" v-show="action.canBack">
							  <template #icon>
								  <icon-arrow-left style="color: rgb(93,93,93)"></icon-arrow-left>
							  </template>
						  </a-button>
					  </a-col>
					  <a-col flex="auto">
						  <a-button type="text" @click="go" v-show="action.canGo">
							  <template #icon>
								  <icon-arrow-right style="color: rgb(93,93,93)"></icon-arrow-right>
							  </template>
						  </a-button>
					  </a-col>
				  </a-row>
			  </a-col>
			  <a-col flex="auto" style="height: 100%;text-align: center;line-height: 35px;color: rgb(93,93,93);font-size: medium;cursor: move" @dblclick="onDbClick">

			  </a-col>
			  <a-col flex="80px" style="height: 100%">
				  <a-row style="height: 100%" align="center" justify="center" :wrap="false">
					  <a-col flex="auto">
						  <a-button type="text" @click="onMin(item.id)">
							  <template #icon>
								  <icon-minus style="color: rgb(93,93,93)"></icon-minus>
							  </template>
						  </a-button>
					  </a-col>
					  <a-col flex="auto">
						  <a-button type="text" @click="item.status==ETeamOS_Window_Status.NORMAL?onMax(item.id):onNormal(item.id)">
							  <template #icon>
								  <icon-expand v-if="item.status==ETeamOS_Window_Status.NORMAL" style="color: rgb(93,93,93)"></icon-expand>
								  <icon-shrink v-else-if="item.status==ETeamOS_Window_Status.MAX" style="color: rgb(93,93,93)"></icon-shrink>
							  </template>
						  </a-button>
					  </a-col>
					  <a-col flex="auto">
						  <a-button type="text" @click="onClose(item.id)">
							  <template #icon>
								  <icon-close style="color: rgb(93,93,93)"></icon-close>
							  </template>
						  </a-button>
					  </a-col>
				  </a-row>
			  </a-col>
		  </a-row>
	  </template>
    <template v-else="item.isPopup">
	    <a-row style="height: 35px;background: rgba(249,249,249,0.9);backdrop-filter: blur(5px)" v-drag:[item.id].free="item.rect" @dragend="item.onMove">
		    <a-col flex="100px" style="height: 100%;text-align: center;line-height: 35px;color: rgb(93,93,93);font-size: medium;cursor: move;align-items: center;display: flex">
			    <SvgIcon style="margin-left: 10px;margin-right: 10px;width: 18px;height: 18px" :name="iconGroupMap[item.group]"></SvgIcon>
			    <span style="font-size: small;color: #333">{{item.title}}</span>
		    </a-col>
		    <a-col flex="auto" style="height: 100%;text-align: center;line-height: 35px;color: rgb(93,93,93);font-size: medium;cursor: move">
		    </a-col>
		    <a-col flex="30px" style="height: 100%">
			    <a-row style="height: 100%" align="center" justify="center" :wrap="false">
				    <a-col flex="auto">
					    <a-button type="text" @click="onShow(item.id)">
						    <template #icon>
							    <icon-expand style="color: rgb(93,93,93)"></icon-expand>
						    </template>
					    </a-button>
				    </a-col>
			    </a-row>
		    </a-col>
	    </a-row>
    </template>
	  <a-row style="height: calc(100% - 35px);background-color:white;position: relative;z-index: -1">
		  <NavigatorContainer :routes="item.nodes[0].components" :id="item.nodes[0].id" :path="item.nodes[0].path" :default="item.nodes[0].default" ref="navigator" v-if="item.type==ETeamOS_Window_Type.SIMPLE" name="root" style="position: relative"/>
		  <a-tabs type="card-gutter" :editable="true" show-add-button auto-switch :justify="true" v-else-if="item.type==ETeamOS_Window_Type.TAB" @change="change" style="width: 100%" @add="addTab" @delete="removeTab" @tabClick="change" :active-key="item.activeKey">
			  <a-tab-pane v-for="(node,index) in item.nodes" :key="node.id" tabindex="-1" :closable="item.nodes.length>1">
				  <template #title>
					  <div style="width: 100%;height: 100%">
						  {{getTabTitle(node.id)}}
					  </div>
				  </template>
				  <NavigatorContainer :id="node.id" :routes="node.components" :default="node.default" :meta="node.meta" ref="navigatorList" name="root" :path="node.path" @focus="onFocus(item.id)" :tabindex="index" style="position: relative"/>
			  </a-tab-pane>
		  </a-tabs>
	  </a-row>
  </div>
</template>

<script setup lang="ts">
import {windowManager} from "./windowManager";
import {nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import NavigatorContainer from "../common/component/navigator/navigatorContainer.vue";
import {ETeamOS_Window_Status, ETeamOS_Window_Type, Window} from "./window";
import {vDrag} from "../common/directive/drag";
import {vResize} from "../common/directive/resize";
import {v4} from "uuid"
import SvgIcon from "../../icon/svgIcon.vue";
import {iconGroupMap} from "../icon/icon";

vResize;
vDrag;
let props=defineProps<{
  item:Window,
  index:number
}>()
provide("windowRef",props.item)
const onFocus=(id:string)=>{
  windowManager.setFocus(id);
}
const onMax=(id:string)=>{
  windowManager.max(id)
}
const onNormal=(id:string)=>{
  windowManager.normal(id)
}
const onMin=(id:string)=>{
  windowManager.hide(id)
}
const onClose=(id:string)=>{
  windowManager.close(id)
}
const onShow=(id:string)=>{
	windowManager.show(id)
}

const onDbClick=()=>{
	if(props.item.status===ETeamOS_Window_Status.NORMAL) {
		windowManager.max(props.item.id)
	} else {
		windowManager.normal(props.item.id)
	}
}

const navigator=ref<InstanceType<typeof NavigatorContainer>>(null)
const navigatorList=ref<InstanceType<typeof NavigatorContainer>[]>([])
const back=()=>{
  if(props.item.type==ETeamOS_Window_Type.SIMPLE) {
    navigator.value.navigatorManager.back()
  } else {
    for(let o of navigatorList.value) {
      if(o.id==props.item.activeKey) {
        o.navigatorManager.back()
      }
    }
  }
}
const go=()=>{
  if(props.item.type==ETeamOS_Window_Type.SIMPLE) {
    navigator.value.navigatorManager.go()
  } else {
    for(let o of navigatorList.value) {
      if(o.id==props.item.activeKey) {
        o.navigatorManager.go()
      }
    }
  }
}
const change=(key)=>{
  props.item.activeKey=key;
  for(let o of navigatorList.value) {
    if(o.id==props.item.activeKey) {
      action.canBack=o.navigatorManager.canBack
      action.canGo=o.navigatorManager.canGo
    }
  }
}
let action=reactive({
  canBack:ref(false),
  canGo:ref(false)
})
const handleController=()=>{
  if(props.item.type==ETeamOS_Window_Type.SIMPLE) {
    action.canBack=navigator.value.navigatorManager.canBack
    action.canGo=navigator.value.navigatorManager.canGo
  } else {
    for(let o of navigatorList.value) {
      if(o.id==props.item.activeKey) {
        action.canBack=o.navigatorManager.canBack
        action.canGo=o.navigatorManager.canGo
      }
    }
  }
}

onMounted(()=>{
  handleController()
})
watch(()=>props.item.nodes,()=>{
  nextTick(()=>{
    handleController()
  })
},{
  deep:true
})
const addTab=async ()=>{
  if(props.item.onNewTab) {
    let ret=await props.item.onNewTab(props.item)
    if(ret) {
      if(!ret.id) {
        ret.id=v4();
      }
      props.item.nodes.push(ret);
      props.item.activeKey=ret.id;
    }
  }
}
const removeTab=async (id:string)=>{
  for(let i=0;i<props.item.nodes.length;i++) {
    let node=props.item.nodes[i]
    if(node.id==id) {
      props.item.nodes.splice(i,1);
      if(id==props.item.activeKey) {
        if(i>=props.item.nodes.length) {
          props.item.activeKey=props.item.nodes[props.item.nodes.length-1].id;
        } else {
					props.item.activeKey=props.item.nodes[i].id
        }
      }
      break;
    }
  }
  if(props.item.onRemoveTab) {
    props.item.onRemoveTab(props.item);
  }
}
const getTabTitle=(id:string)=>{
  for(let o of navigatorList.value) {
    if(o.id==id) {
      return o.navigatorManager.getCurrentNavigator().calculatePath()
    }
  }
}
</script>

<style scoped>

</style>